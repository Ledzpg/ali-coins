@echo off
rem Helper de idioma para scripts .bat (PT-BR padrao, EN opcional).
rem Uso: call "%~dp0libs\i18n\scripts.bat" msg "Texto PT" "Text EN"
rem      call "%~dp0libs\i18n\scripts.bat" err "Erro PT" "Error EN"
rem A variavel ALI_LANG deve ser definida pelo chamador (bloco de deteccao no script).
setlocal
if /i "%~1"=="msg" goto ali_msg
if /i "%~1"=="err" goto ali_err
exit /b 1

:ali_msg
shift
if /i "%ALI_LANG%"=="en" goto ali_msg_en
echo %~1
exit /b 0

:ali_msg_en
echo %~2
exit /b 0

:ali_err
shift
if /i "%ALI_LANG%"=="en" goto ali_err_en
>&2 echo %~1
exit /b 0

:ali_err_en
>&2 echo %~2
exit /b 0
