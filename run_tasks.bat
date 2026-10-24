@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

REM Idioma dos scripts: APP_LANGUAGE, credentials.env ou --lang=...
set "ALI_LANG=%APP_LANGUAGE%"
if not defined ALI_LANG if defined BOT_LANGUAGE set "ALI_LANG=%BOT_LANGUAGE%"
if not defined ALI_LANG if exist "%~dp0credentials.env" for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0credentials.env") do if /i "%%A"=="APP_LANGUAGE" set "ALI_LANG=%%~B"
echo %* | findstr /i /r /c:"--lang en" /c:"--lang=en" >nul && set "ALI_LANG=en"
echo %* | findstr /i /r /c:"--lang pt" /c:"--lang=pt" >nul && set "ALI_LANG=pt"
if /i "%ALI_LANG%"=="en" (set "ALI_LANG=en") else (set "ALI_LANG=pt")

REM Protecao contra OOM Killer fora do container: mesma folga de heap do Dockerfile.
if not defined NODE_OPTIONS set "NODE_OPTIONS=--max-old-space-size=256"

REM Cache de bytecode V8 (Node 22+): arranque mais rapido (pasta no TEMP do usuario).
if not defined NODE_COMPILE_CACHE set "NODE_COMPILE_CACHE=%TEMP%\ali-coins-compile-cache"

node "%~dp0do_tasks.js" %*
set EXIT_CODE=%ERRORLEVEL%

if %EXIT_CODE% NEQ 0 (
    echo.
    call "%~dp0libs\i18n\scripts.bat" msg "[ERRO] Execucao finalizada com codigo de erro %EXIT_CODE%." "[ERROR] Execution finished with error code %EXIT_CODE%."
    echo %cmdcmdline% | findstr /i /c:"%~nx0" >nul
    if not errorlevel 1 pause
)

exit /b %EXIT_CODE%
