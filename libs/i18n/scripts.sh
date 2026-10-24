#!/usr/bin/env bash
# Helper de idioma para scripts .sh (PT-BR padrão, EN opcional).
#
# Ordem de precedência:
#   1. --lang=xx / --lang xx nos argumentos do script
#   2. APP_LANGUAGE / BOT_LANGUAGE no ambiente
#   3. APP_LANGUAGE em credentials.env (na raiz do projeto)
#   4. pt-BR
#
# Uso:
#   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
#   . "$SCRIPT_DIR/libs/i18n/scripts.sh"
#   ali_msg "Texto em português" "Text in English"
#   ali_err "Erro em português" "Error in English"

ALI_LANG="${APP_LANGUAGE:-${BOT_LANGUAGE:-}}"

# --lang nos argumentos (sem consumir/alterar "$@"). Aceita --lang=en e --lang en.
_ali_prev_arg=""
for _ali_arg in "$@"; do
  if [ "$_ali_prev_arg" = "--lang" ]; then
    ALI_LANG="$_ali_arg"
  fi
  case "$_ali_arg" in
    --lang=*) ALI_LANG="${_ali_arg#*=}" ;;
  esac
  _ali_prev_arg="$_ali_arg"
done
unset _ali_prev_arg _ali_arg

if [ -z "$ALI_LANG" ] && [ -n "${SCRIPT_DIR:-}" ] && [ -f "$SCRIPT_DIR/credentials.env" ]; then
  ALI_LANG="$(
    sed -n 's/^[[:space:]]*APP_LANGUAGE[[:space:]]*=[[:space:]]*//p' "$SCRIPT_DIR/credentials.env" |
      tail -n 1 |
      tr -d '\r' |
      sed 's/^["'\'']//; s/["'\'']$//'
  )"
fi

case "$(printf '%s' "$ALI_LANG" | tr '[:upper:]' '[:lower:]')" in
  en | en-* | english | ingles | inglês) ALI_LANG="en" ;;
  *) ALI_LANG="pt" ;;
esac
# Filhos (Node/docker) também podem consultar ALI_LANG, se necessário.
export ALI_LANG

# Imprime a mensagem no idioma selecionado.
ali_msg() {
  if [ "$ALI_LANG" = "en" ]; then
    printf '%s\n' "$2"
  else
    printf '%s\n' "$1"
  fi
}

# Imprime a mensagem de erro no idioma selecionado (stderr).
ali_err() {
  if [ "$ALI_LANG" = "en" ]; then
    printf '%s\n' "$2" >&2
  else
    printf '%s\n' "$1" >&2
  fi
}

# Igual a ali_msg, mas interpreta escapes (\n, \t) como `echo -e`.
ali_msg_e() {
  if [ "$ALI_LANG" = "en" ]; then
    printf '%b\n' "$2"
  else
    printf '%b\n' "$1"
  fi
}
