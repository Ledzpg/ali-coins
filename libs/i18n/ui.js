'use strict';

/**
 * Traduções de interface que não passam pelo logger (CLI/help, menus interativos,
 * mensagens diretas ao usuário). Chave = texto canônico em português.
 *
 * Mantenha as chaves idênticas às strings usadas no código; `t()` consulta este
 * mapa antes do catálogo de logs.
 */
module.exports = {
  'AliExpress Coin Collector & Task Runner com Playwright':
    'AliExpress Coin Collector & Task Runner with Playwright',

  'Valida credenciais e ambiente sem abrir navegador':
    'Validates credentials and environment without opening a browser',
  'Força a execução: sobrescreve lockfile ativo e ignora o cooldown pós-captcha (tenta o login)':
    'Forces execution: overrides an active lockfile and ignores the post-captcha cooldown (still attempts login)',
  'Não aplica o atraso inicial aleatório (START_DELAY_MIN_MS/MAX_MS); use em execuções manuais e retentativas':
    'Does not apply the random initial delay (START_DELAY_MIN_MS/MAX_MS); use for manual runs and retries',
  'Formata a saída de status e relatórios em JSON': 'Formats status output and reports as JSON',
  'Idioma da interface e dos logs: pt-BR (padrão) ou en (English)':
    'Interface and log language: pt-BR (default) or en (English)',
  'Ativa notificações via Telegram (sobrescreve TELEGRAM_ENABLED)':
    'Enables Telegram notifications (overrides TELEGRAM_ENABLED)',
  'Desativa notificações via Telegram': 'Disables Telegram notifications',
  'Abre uma janela para login manual quando necessário (equivale a MANUAL_LOGIN=always)':
    'Opens a window for manual login when needed (same as MANUAL_LOGIN=always)',
  'Nunca oferece login manual; mantém 100% headless (equivale a MANUAL_LOGIN=never)':
    'Never offers manual login; stays 100% headless (same as MANUAL_LOGIN=never)',
  'Ativa envio de heartbeat / dead man switch (sobrescreve HEARTBEAT_ENABLED)':
    'Enables heartbeat / dead man switch (overrides HEARTBEAT_ENABLED)',
  'Desativa envio de heartbeat / dead man switch': 'Disables heartbeat / dead man switch',
  'Exibe o token criptografado gerado no terminal (export_session)':
    'Prints the generated encrypted token in the terminal (export_session)',
  'Caminho do arquivo com o token de sessão (import_session)':
    'Path to the file containing the session token (import_session)',
  'Salva a sessão importada em texto puro sem criptografia at-rest (import_session)':
    'Saves the imported session as plain text without at-rest encryption (import_session)',
  'Exporta ou importa todas as contas configuradas com sessão ativa':
    'Exports or imports all configured accounts with an active session',
  'Especifica o índice (1, 2) ou e-mail da conta (export_session / import_session)':
    'Specifies the account index (1, 2) or e-mail (export_session / import_session)',
  'Mantém os arquivos session_token*.txt após a importação em lote (padrão: remover)':
    'Keeps session_token*.txt files after batch import (default: remove)',
  'Migra session.json legado para session.json.enc (import_session)':
    'Migrates legacy session.json to session.json.enc (import_session)',
  'Re-criptografa as sessões com a nova chave SESSION_SECRET_NEW/SESSION_SECRET_OLD (export_session)':
    'Re-encrypts sessions with the new key SESSION_SECRET_NEW/SESSION_SECRET_OLD (export_session)',
  'Nome da variável de ambiente com a nova chave para --rotate (export_session)':
    'Name of the environment variable with the new key for --rotate (export_session)',
  'Exibe esta ajuda com a lista de opções': 'Displays this help with the list of options',

  'Códigos de Saída (Exit Codes):': 'Exit Codes:',
  '  0  Sucesso (novas moedas coletadas com sucesso)':
    '  0  Success (new coins collected successfully)',
  '  1  Falha crítica de execução ou autenticação':
    '  1  Critical execution or authentication failure',
  '  2  Sem Ação / Já Coletado (check-in já realizado e sem tarefas pendentes)':
    '  2  No Action / Already Collected (check-in already done and no pending tasks)',
  '  3  Lock Ativo (outra instância já em execução no host)':
    '  3  Lock Active (another instance is already running on the host)',
  '  4  Streak Quebrado (sequência de check-in foi interrompida)':
    '  4  Streak Broken (check-in streak was interrupted)',
  '  5  2FA Não-Interativo (solicitação de 2FA em ambiente sem TTY)':
    '  5  Non-Interactive 2FA (2FA request in an environment without a TTY)',
  '  6  Falha Global Não Tratada (uncaughtException / unhandledRejection)':
    '  6  Unhandled Global Failure (uncaughtException / unhandledRejection)',
  '  7  Intervenção Manual Necessária (login em janela não concluído; sem retry automático)':
    '  7  Manual Intervention Required (windowed login not completed; no automatic retry)',

  // Menu de login manual
  '🔐 Login manual opcional': '🔐 Optional manual login',
  'Conta: {user}': 'Account: {user}',
  'Motivo: {reason}': 'Reason: {reason}',
  '⚠️ O bloqueio anti-bot pode impedir o login mesmo na janela; respeite o cooldown de 48h.':
    '⚠️ The anti-bot block may prevent login even in the window; respect the 48h cooldown.',
  '  1) Continuar 100% headless (padrão)': '  1) Continue 100% headless (default)',
  '  2) Abrir janela para login manual e salvar a sessão':
    '  2) Open a window for manual login and save the session',
  'Escolha [1/2] (Enter = 1, timeout {seconds}s): ':
    'Choice [1/2] (Enter = 1, timeout {seconds}s): ',
  'login remoto suspenso após bloqueio anti-bot (RGV587)':
    'remote login suspended after anti-bot block (RGV587)',
  'bloqueio anti-bot (RGV587) ativo': 'anti-bot block (RGV587) active',
  'cooldown pós-captcha ativo': 'post-captcha cooldown active',
  'sem sessão válida': 'no valid session',
  'reautenticação solicitada pela página': 'reauthentication requested by the page',
  'login necessário': 'login required',
  'Contexto do navegador inválido para o login manual.':
    'Invalid browser context for manual login.',
  'Não foi possível ler os cookies da janela de login: {err}':
    'Could not read cookies from the login window: {err}',
  'A janela de login foi fechada antes de concluir a autenticação.':
    'The login window was closed before authentication completed.',
  'Tempo esgotado aguardando o login manual ({seconds}s).':
    'Timed out waiting for manual login ({seconds}s).',
  'Conta não identificada para o login manual.': 'Account not identified for manual login.',
  'Login detectado, mas a sessão não pôde ser salva. Verifique SESSION_SECRET e as permissões do diretório.':
    'Login detected, but the session could not be saved. Check SESSION_SECRET and directory permissions.',

  // Erros de validação do credentials.env
  'A variável ALI_USER é obrigatória no credentials.env.':
    'ALI_USER is required in credentials.env.',
  'A variável ALI_USER deve ser uma string de texto.': 'ALI_USER must be a text string.',
  'ALI_USER não pode estar vazio.': 'ALI_USER cannot be empty.',
  'A variável ALI_PASSWORD é obrigatória no credentials.env.':
    'ALI_PASSWORD is required in credentials.env.',
  'A variável ALI_PASSWORD deve ser uma string de texto.': 'ALI_PASSWORD must be a text string.',
  'ALI_PASSWORD não pode estar vazio.': 'ALI_PASSWORD cannot be empty.',
  'SESSION_SECRET deve conter no mínimo 32 caracteres.':
    'SESSION_SECRET must contain at least 32 characters.',
  'SESSION_SECRET_OLD deve conter no mínimo 32 caracteres.':
    'SESSION_SECRET_OLD must contain at least 32 characters.',
  'TASK_PAUSE_MAX_MS deve ser >= TASK_PAUSE_MIN_MS.':
    'TASK_PAUSE_MAX_MS must be >= TASK_PAUSE_MIN_MS.',
  'ACCOUNT_DELAY_MAX_MS deve ser >= ACCOUNT_DELAY_MIN_MS.':
    'ACCOUNT_DELAY_MAX_MS must be >= ACCOUNT_DELAY_MIN_MS.',
  'START_DELAY_MAX_MS deve ser >= START_DELAY_MIN_MS.':
    'START_DELAY_MAX_MS must be >= START_DELAY_MIN_MS.',
  'TELEGRAM_BOT_TOKEN é obrigatório e deve ter formato válido (/^\\d+:[\\w-]{30,}$/) quando TELEGRAM_ENABLED=true.':
    'TELEGRAM_BOT_TOKEN is required and must have a valid format (/^\\d+:[\\w-]{30,}$/) when TELEGRAM_ENABLED=true.',
  'TELEGRAM_CHAT_ID é obrigatório quando TELEGRAM_ENABLED=true.':
    'TELEGRAM_CHAT_ID is required when TELEGRAM_ENABLED=true.',
  'HEARTBEAT_URL é obrigatória e deve ser uma URL válida (http/https) quando HEARTBEAT_ENABLED=true.':
    'HEARTBEAT_URL is required and must be a valid URL (http/https) when HEARTBEAT_ENABLED=true.',
  "HEARTBEAT_URL deve usar https:// (o token do dead man's switch não deve trafegar em claro). http:// é aceito apenas para localhost ou com ALLOW_PRIVATE_WEBHOOKS=true.":
    "HEARTBEAT_URL must use https:// (the dead man's switch token must not travel in cleartext). http:// is accepted only for localhost or with ALLOW_PRIVATE_WEBHOOKS=true.",
  'NOTIFY_WEBHOOK_URL deve ser uma URL válida começando com http:// ou https://.':
    'NOTIFY_WEBHOOK_URL must be a valid URL starting with http:// or https://.',
  'NOTIFY_WEBHOOK_URL deve usar https:// (o webhook não deve trafegar em claro). http:// é aceito apenas para localhost ou com ALLOW_PRIVATE_WEBHOOKS=true.':
    'NOTIFY_WEBHOOK_URL must use https:// (the webhook must not travel in cleartext). http:// is accepted only for localhost or with ALLOW_PRIVATE_WEBHOOKS=true.',
  'SESSION_SECRET é obrigatório (>= 32 caracteres) quando ENCRYPT_LOCAL_SESSION=true (padrão): sem ele a sessão NÃO é persistida. Defina SESSION_SECRET ou use ENCRYPT_LOCAL_SESSION=false explicitamente.':
    'SESSION_SECRET is required (>= 32 characters) when ENCRYPT_LOCAL_SESSION=true (default): without it the session is NOT persisted. Set SESSION_SECRET or explicitly use ENCRYPT_LOCAL_SESSION=false.',
  'Falha na validação das variáveis de configuração em credentials.env.':
    'Failed to validate the configuration variables in credentials.env.',

  // Relatórios/status de tarefas
  '{value} moedas': '{value} coins',
  'Requer pedido entregue elegível para avaliação':
    'Requires a delivered order eligible for review',
  'Requer interação direta no App AliExpress (minigame/quiz)':
    'Requires direct interaction in the AliExpress app (minigame/quiz)',
  'Exclusiva do App AliExpress (requer rega no app móvel)':
    'AliExpress app exclusive (requires watering in the mobile app)',
  'Desativada (tarefas que exigem o app desligadas)': 'Disabled (app-only tasks disabled)',

  // 2FA / terminal
  '>> Digite o código de 6 dígitos enviado para seu e-mail/SMS: ':
    '>> Enter the 6-digit code sent to your email/SMS: ',
  'Tempo esgotado ({seconds}s) aguardando o código 2FA.':
    'Timed out ({seconds}s) waiting for the 2FA code.',
  'TOKEN CRIPTOGRAFADO (v3)': 'ENCRYPTED TOKEN (v3)',
  'Execução não-interativa detectada (sem TTY). O AliExpress solicitou verificação de código 2FA.\nSolução: Execute localmente em terminal interativo (./run_all.sh), resolva o desafio, e use "node export_session.js" / "node import_session.js" para transferir a sessão autenticada para o servidor.':
    'Non-interactive execution detected (no TTY). AliExpress requested 2FA code verification.\nSolution: Run locally in an interactive terminal (./run_all.sh), solve the challenge, and use "node export_session.js" / "node import_session.js" to transfer the authenticated session to the server.'
};
