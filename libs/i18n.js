'use strict';

/**
 * Suporte bilíngue PT-BR (padrão) / EN.
 *
 * O idioma pode ser definido por:
 *   - APP_LANGUAGE=pt-BR|en (ou pt/en/en-US) no credentials.env ou ambiente
 *   - --lang pt|pt-BR|en na linha de comando
 *
 * Este módulo NÃO depende do logger/config para evitar ciclos de require:
 * o logger o utiliza para traduzir mensagens no momento do log.
 */

const catalog = require('./i18n/log-catalog');
const valuePairs = require('./i18n/values');
const uiMessages = require('./i18n/ui');
const notifyPhrases = require('./i18n/notify-phrases');

const LANG_PT_BR = 'pt-BR';
const LANG_EN = 'en';
const SUPPORTED_LANGUAGES = [LANG_PT_BR, LANG_EN];

const PT_ALIASES = new Set([
  'pt',
  'pt-br',
  'pt_br',
  'pt-pt',
  'portugues',
  'português',
  'portuguese'
]);
const EN_ALIASES = new Set([
  'en',
  'en-us',
  'en_us',
  'en-gb',
  'en_gb',
  'ingles',
  'inglês',
  'english'
]);

/**
 * Normaliza um valor de idioma. Valores desconhecidos caem no padrão pt-BR
 * (use resolveLanguage quando for necessário rejeitar entradas inválidas).
 * @param {unknown} value
 * @returns {'pt-BR'|'en'}
 */
function normalizeLanguage(value) {
  return resolveLanguage(value) || LANG_PT_BR;
}

/**
 * Resolve um idioma suportado ou retorna null para entradas inválidas.
 * @param {unknown} value
 * @returns {'pt-BR'|'en'|null}
 */
function resolveLanguage(value) {
  if (value === null || value === undefined) return LANG_PT_BR;
  const normalized = String(value).trim().toLowerCase().replace(/_/g, '-');
  if (!normalized) return LANG_PT_BR;
  if (EN_ALIASES.has(normalized)) return LANG_EN;
  if (PT_ALIASES.has(normalized)) return LANG_PT_BR;
  return null;
}

const initialLanguage = resolveLanguage(process.env.APP_LANGUAGE || process.env.BOT_LANGUAGE);
let currentLanguage = initialLanguage || LANG_PT_BR;
let translationCache = new Map();

/** @returns {'pt-BR'|'en'} */
function getLanguage() {
  return currentLanguage;
}

/**
 * Define o idioma atual (aceita aliases; entradas inválidas mantêm o padrão).
 * @param {unknown} value
 * @returns {'pt-BR'|'en'}
 */
function setLanguage(value) {
  const next = normalizeLanguage(value);
  if (next !== currentLanguage) {
    currentLanguage = next;
    translationCache = new Map();
  }
  return currentLanguage;
}

/** @returns {boolean} */
function isEnglish() {
  return currentLanguage === LANG_EN;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Glossário de valores dinâmicos (status, flags, unidades). Aplicado DEPOIS da
// tradução do template para cobrir interpolações que o catálogo não vê.
const compiledValues = valuePairs
  .map(([pt, en]) => ({
    pt,
    en,
    regex: new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegExp(pt)}(?![\\p{L}\\p{N}_])`, 'gu')
  }))
  .sort((a, b) => b.pt.length - a.pt.length);

const PROTECTED_VALUE_RE = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w.-]+\.\w+)/g;

/**
 * Traduz status de tarefa compostos que aparecem interpolados em logs/relatórios.
 * Aplicado antes do glossário de palavras para casar as frases PT completas.
 * @param {string} text
 * @returns {string}
 */
function translateInlineStatuses(text) {
  return text
    .replace(
      /Falhou \(limite de (\d+) tentativas atingido\)/g,
      'Failed (attempt limit of $1 reached)'
    )
    .replace(
      /Falhou \(sem progresso após (\d+) tentativas\)/g,
      'Failed (no progress after $1 attempts)'
    )
    .replace(/Concluída \(([^)]*)\)/g, 'Completed ($1)')
    .replace(/Executada parcialmente \(([^)]*)\)/g, 'Partially executed ($1)')
    .replace(
      /Requer verificação manual \(botão "([^"]*)" não reconhecido\)/g,
      'Manual verification required (button "$1" not recognized)'
    )
    .replace(
      /Requer pedido entregue elegível para avaliação/g,
      'Requires a delivered order eligible for review'
    )
    .replace(
      /Requer interação direta no App AliExpress \(minigame\/quiz\)/g,
      'Requires direct interaction in the AliExpress app (minigame/quiz)'
    )
    .replace(
      /Exclusiva do App AliExpress \(requer rega no app móvel\)/g,
      'AliExpress app exclusive (requires watering in the mobile app)'
    )
    .replace(
      /Desativada \(tarefas que exigem o app desligadas\)/g,
      'Disabled (app-only tasks disabled)'
    );
}

/**
 * Traduz valores dinâmicos PT que aparecem dentro de uma mensagem já traduzida.
 * URLs/e-mails são preservados intactos.
 * @param {string} text
 * @returns {string}
 */
function applyValueGlossary(text) {
  if (!text) return text;
  const protectedValues = [];
  let out = translateInlineStatuses(text);
  out = out.replace(PROTECTED_VALUE_RE, (match) => {
    protectedValues.push(match);
    return `\u0000${protectedValues.length - 1}\u0000`;
  });
  for (const rule of compiledValues) out = out.replace(rule.regex, rule.en);
  out = out.replace(/\u0000(\d+)\u0000/g, (_, index) => protectedValues[Number(index)] ?? '');
  return out;
}

/**
 * Compila um template com placeholders {{n}} em regex + ordem dos placeholders.
 * @param {string} template
 * @returns {{regex: RegExp, order: number[], staticLength: number}}
 */
function compileTemplate(template) {
  const parts = template.split(/(\{\{\d+\}\})/);
  const order = [];
  let pattern = '^';
  let staticLength = 0;
  for (const part of parts) {
    const match = part.match(/^\{\{(\d+)\}\}$/);
    if (match) {
      pattern += '([\\s\\S]*?)';
      order.push(Number(match[1]));
    } else {
      pattern += escapeRegExp(part);
      staticLength += part.length;
    }
  }
  pattern += '$';
  return { regex: new RegExp(pattern), order, staticLength };
}

const compiledTemplates = catalog.templates
  .map((entry) => ({ ...entry, ...compileTemplate(entry.pt) }))
  .sort((a, b) => b.staticLength - a.staticLength);

// Variante sem espaços nas bordas: consumidores podem remover o \n inicial de
// banners/relatórios. Preservamos o enquadramento original ao traduzir.
const compiledTemplatesTrimmed = catalog.templates
  .map((entry) => {
    const pt = entry.pt.trim();
    if (!pt) return null;
    return { ...entry, pt, en: entry.en.trim(), ...compileTemplate(pt) };
  })
  .filter(Boolean)
  .sort((a, b) => b.staticLength - a.staticLength);

// Índice por mensagem "trimada" para tolerar diferenças de espaços nas bordas
// (pino/consumidores podem remover newlines/spaces ao redor da mensagem).
const exactTrimmed = new Map();
for (const [pt, en] of Object.entries(catalog.exact)) {
  const trimmed = pt.trim();
  if (!trimmed) continue;
  if (!exactTrimmed.has(trimmed)) exactTrimmed.set(trimmed, en);
}

/**
 * Traduz uma mensagem de log PT → EN. Em PT-BR retorna a mensagem intacta.
 * Mensagens sem tradução no catálogo retornam o texto original (fallback seguro).
 * @param {string} message
 * @returns {string}
 */
function applyTemplate(entry, text) {
  const match = entry.regex.exec(text);
  if (!match) return null;
  const captures = match.slice(1);
  return entry.en.replace(/\{\{(\d+)\}\}/g, (_, rawIndex) => {
    const position = entry.order.indexOf(Number(rawIndex));
    return position >= 0 ? (captures[position] ?? '') : '';
  });
}

function translateMessage(message) {
  if (!isEnglish() || typeof message !== 'string' || !message) return message;

  const cached = translationCache.get(message);
  if (cached !== undefined) return cached;

  const direct = catalog.exact[message];
  if (direct !== undefined) {
    const translated = applyValueGlossary(direct);
    translationCache.set(message, translated);
    return translated;
  }

  // Tenta a versão sem espaços nas bordas, preservando o enquadramento original.
  const trimmed = message.trim();
  const lead = (message.match(/^\s*/) || [''])[0];
  const trail = (message.match(/\s*$/) || [''])[0];
  if (trimmed) {
    const hit = exactTrimmed.get(trimmed);
    if (hit !== undefined) {
      const translated = lead + applyValueGlossary(hit) + trail;
      translationCache.set(message, translated);
      return translated;
    }
  }

  for (const entry of compiledTemplates) {
    const translated = applyTemplate(entry, message);
    if (translated !== null) {
      const withValues = applyValueGlossary(translated);
      translationCache.set(message, withValues);
      return withValues;
    }
  }

  if (trimmed) {
    for (const entry of compiledTemplatesTrimmed) {
      const translated = applyTemplate(entry, trimmed);
      if (translated !== null) {
        const framed = lead + applyValueGlossary(translated) + trail;
        translationCache.set(message, framed);
        return framed;
      }
    }
  }

  // Fallback: mantém a mensagem original (PT) se não houver entrada no catálogo.
  translationCache.set(message, message);
  return message;
}

/**
 * Traduz uma mensagem de notificação (Telegram) linha a linha.
 *
 * As notificações são montadas com HTML/emoji e valores dinâmicos; traduzir o
 * texto inteiro por template não funciona. Primeiro tentamos o catálogo de logs
 * (linha completa); depois aplicamos as frases extraídas de libs/notify.js por
 * substituição de substring, preservando tags/emoji/valores.
 * @param {string} text
 * @returns {string}
 */
/**
 * Traduz um valor curto de relatório/status (glossário + catálogo).
 * Diferente de translateMessage, aplica o glossário mesmo quando não há
 * template no catálogo (ex.: "Concluída" → "Completed", "1505 moedas" → "1505 coins").
 * @param {string} text
 * @returns {string}
 */
function translateValue(text) {
  if (!isEnglish() || typeof text !== 'string' || !text) return text;
  const base = Object.prototype.hasOwnProperty.call(uiMessages, text)
    ? uiMessages[text]
    : translateMessage(text);
  return applyValueGlossary(base);
}

function translateNotificationText(text) {
  if (!isEnglish() || typeof text !== 'string' || !text) return text;
  return text
    .split('\n')
    .map((line) => {
      if (!line) return line;
      // Frases específicas de notificação primeiro: o catálogo de logs tem
      // templates genéricos (ex.: "Conta: {{0}}") que não devem capturar a linha
      // inteira e deixar o restante em português.
      let out = line;
      for (const [pt, en] of notifyPhrases) {
        if (out.includes(pt)) out = out.split(pt).join(en);
      }
      if (out !== line) return applyValueGlossary(out);

      const catalogHit = translateMessage(line);
      if (catalogHit !== line) {
        let withPhrases = catalogHit;
        for (const [pt, en] of notifyPhrases) {
          if (withPhrases.includes(pt)) withPhrases = withPhrases.split(pt).join(en);
        }
        return applyValueGlossary(withPhrases);
      }
      return applyValueGlossary(out);
    })
    .join('\n');
}

/**
 * Traduz uma mensagem de interface/log e interpola variáveis {nome}.
 * @param {string} text
 * @param {Record<string, unknown>} [vars]
 * @returns {string}
 */
function t(text, vars) {
  let translated = text;
  if (isEnglish()) {
    translated = Object.prototype.hasOwnProperty.call(uiMessages, text)
      ? uiMessages[text]
      : translateMessage(text);
  }
  if (!vars) return translated;
  return translated.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  );
}

module.exports = {
  LANG_PT_BR,
  LANG_EN,
  SUPPORTED_LANGUAGES,
  normalizeLanguage,
  resolveLanguage,
  getLanguage,
  setLanguage,
  isEnglish,
  translateMessage,
  translateValue,
  translateNotificationText,
  t
};
