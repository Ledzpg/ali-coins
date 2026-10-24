'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const espree = require('espree');

const i18n = require('../libs/i18n');
const catalog = require('../libs/i18n/log-catalog');

test.afterEach(() => {
  i18n.setLanguage('pt-BR');
});

test('i18n - padrão é português e não altera mensagens', () => {
  assert.strictEqual(i18n.getLanguage(), 'pt-BR');
  assert.strictEqual(i18n.isEnglish(), false);
  assert.strictEqual(
    i18n.translateMessage('Configuração validada com sucesso:'),
    'Configuração validada com sucesso:'
  );
});

test('i18n - normaliza aliases de idioma e rejeita valores desconhecidos', () => {
  assert.strictEqual(i18n.normalizeLanguage('pt'), 'pt-BR');
  assert.strictEqual(i18n.normalizeLanguage('pt-BR'), 'pt-BR');
  assert.strictEqual(i18n.normalizeLanguage('en-US'), 'en');
  assert.strictEqual(i18n.normalizeLanguage('english'), 'en');
  assert.strictEqual(i18n.normalizeLanguage('fr'), 'pt-BR');
  assert.strictEqual(i18n.resolveLanguage('fr'), null);
  assert.strictEqual(i18n.resolveLanguage('en'), 'en');
});

test('i18n - traduz mensagens exatas e templates com valores dinâmicos', () => {
  i18n.setLanguage('en');
  assert.strictEqual(
    i18n.translateMessage('Configuração validada com sucesso:'),
    'Configuration validated successfully:'
  );
  assert.strictEqual(
    i18n.translateMessage('\nSaldo total final: 1500'),
    '\nFinal total balance: 1500'
  );
  assert.strictEqual(
    i18n.translateMessage('a sequência subiu (15 dias seguidos)'),
    'the streak went up (15 days in a row)'
  );
});

test('i18n - t() usa o dicionário de interface (CLI/help)', () => {
  i18n.setLanguage('en');
  assert.strictEqual(
    i18n.t('Exibe esta ajuda com a lista de opções'),
    'Displays this help with the list of options'
  );
  assert.strictEqual(
    i18n.t('Conta: {user}', { user: 'us***@example.com' }),
    'Account: us***@example.com'
  );
});

test('i18n - notificações Telegram são traduzidas linha a linha', () => {
  i18n.setLanguage('en');
  const translated = i18n.translateNotificationText(
    '🪙 Ganhas hoje: +5 moedas\n📅 Sequência: 3 dias\n💰 Saldo: 10 moedas'
  );
  assert.match(translated, /Earned today: \+5 coins/);
  assert.match(translated, /Streak: 3 days/);
  assert.match(translated, /Balance: 10 coins/);
  assert.doesNotMatch(translated, /Ganhas hoje|Sequência|moedas/);
});

test('i18n - menu de login manual em inglês', () => {
  i18n.setLanguage('en');
  const { manualLoginReason, buildLoginChoiceMenu } = require('../libs/ui/manual-login');
  assert.strictEqual(manualLoginReason({ hasValidLogin: false }), 'no valid session');
  const menu = buildLoginChoiceMenu({
    account: { maskedUser: 'us***@example.com' },
    reason: 'no valid session',
    timeoutMs: 30000
  });
  assert.match(menu, /Optional manual login/);
  assert.match(menu, /Account: us\*\*\*@example\.com/);
  assert.match(menu, /Continue 100% headless/);
  assert.match(menu, /timeout 30s/);
});

test('i18n - mensagem de dry-run do Telegram em inglês', () => {
  i18n.setLanguage('en');
  const { buildMessage } = require('../libs/notify');
  const message = buildMessage({ event: 'dry_run', hostname: 'host' });
  assert.match(message, /Dry-Run Test/);
  assert.match(message, /Environment and credentials validation completed successfully/);
  assert.doesNotMatch(message, /Moedas|Teste Dry-Run|validação de ambiente/);
});

test(
  'i18n - helper dos scripts .sh respeita --lang en (Unix)',
  { skip: process.platform === 'win32' },
  () => {
    const { execFileSync } = require('node:child_process');
    const root = path.join(__dirname, '..');
    const out = execFileSync(
      'bash',
      [
        '-c',
        '. ./libs/i18n/scripts.sh --lang en; ali_msg "Português" "English"; ali_err "Erro" "Error"'
      ],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    assert.strictEqual(out.trim(), 'English');
  }
);

test('i18n - todas as mensagens estáticas de logger têm entrada no catálogo', () => {
  const root = path.join(__dirname, '..');
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.git', 'tests', 'scratch'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.js')) files.push(full);
    }
  }
  walk(root);

  function walkNodes(node, cb) {
    if (!node || typeof node !== 'object') return;
    cb(node);
    for (const key of Object.keys(node)) {
      if (key === 'parent') continue;
      const value = node[key];
      if (Array.isArray(value)) value.forEach((item) => walkNodes(item, cb));
      else if (value && typeof value === 'object' && value.type) walkNodes(value, cb);
    }
  }

  function flatten(node, state) {
    if (!node || typeof node !== 'object') return null;
    if (node.type === 'Literal' && typeof node.value === 'string') return [node.value];
    if (node.type === 'TemplateLiteral') {
      let text = '';
      const base = state.next;
      for (let i = 0; i < node.quasis.length; i++) {
        text += node.quasis[i].value.cooked ?? node.quasis[i].value.raw;
        if (i < node.expressions.length) {
          text += `{{${base + i}}}`;
          state.next += 1;
        }
      }
      return [text];
    }
    if (node.type === 'BinaryExpression' && node.operator === '+') {
      const left = flatten(node.left, state);
      const right = flatten(node.right, state);
      if (!left || !right) return null;
      return left.flatMap((l) => right.map((r) => l + r));
    }
    if (node.type === 'ConditionalExpression') {
      return [
        ...(flatten(node.consequent, state) || []),
        ...(flatten(node.alternate, state) || [])
      ];
    }
    return null;
  }

  const exact = new Set();
  const templates = new Set();
  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    let ast;
    try {
      ast = espree.parse(`(function(){\n${code}\n})`, {
        ecmaVersion: 'latest',
        sourceType: 'script',
        loc: true
      });
    } catch {
      continue;
    }
    walkNodes(ast, (node) => {
      if (node.type !== 'CallExpression') return;
      const callee = node.callee;
      if (!callee || callee.type !== 'MemberExpression') return;
      if (callee.object.type !== 'Identifier' || callee.object.name !== 'logger') return;
      if (callee.property.type !== 'Identifier') return;
      if (!['info', 'warn', 'error', 'debug', 'fatal', 'trace'].includes(callee.property.name)) {
        return;
      }
      if (!node.arguments.length) return;
      for (let i = node.arguments.length - 1; i >= 0; i--) {
        const messages = flatten(node.arguments[i], { next: 0 });
        if (messages && messages.length) {
          for (const message of messages) {
            if (message.includes('{{')) templates.add(message);
            else exact.add(message);
          }
          return;
        }
      }
    });
  }

  const missingExact = [...exact].filter((message) => !(message in catalog.exact));
  const missingTemplates = [...templates].filter(
    (message) => !catalog.templates.some((entry) => entry.pt === message)
  );
  assert.deepStrictEqual(
    missingExact,
    [],
    `Mensagens de logger sem tradução EN: ${missingExact.join(' | ')}`
  );
  assert.deepStrictEqual(
    missingTemplates,
    [],
    `Templates de logger sem tradução EN: ${missingTemplates.join(' | ')}`
  );
});
