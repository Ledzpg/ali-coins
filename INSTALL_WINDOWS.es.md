# Guía detallada de instalación en Windows (Windows 10 y Windows 11)

> 🌐 **Idiomas:** [Português](INSTALL_WINDOWS.md) | [English](INSTALL_WINDOWS.en.md) | [Español](INSTALL_WINDOWS.es.md)

> ℹ️ Traducción al español de la documentación canónica en portugués. En caso de divergencia, prevalece la versión en portugués.

Este manual describe el proceso completo paso a paso para instalar, configurar y ejecutar **AliExpress Coin Collector & Task Runner** en sistemas **Windows 10** y **Windows 11** (64 bits), mediante el símbolo del sistema (CMD) o PowerShell.

---

## Índice

1. [Requisitos mínimos](#1-requisitos-mínimos)
2. [Método A: Instalación automática (`setup_windows.bat` o `setup_windows.ps1`)](#2-método-a-instalación-automática-setup_windowsbat-o-setup_windowsps1)
3. [Método B: Instalación manual paso a paso](#3-método-b-instalación-manual-paso-a-paso)
   - [Paso 1: Instalación de Node.js 22 LTS](#paso-1-instalación-de-nodejs-22-lts)
   - [Paso 2: Descargar o clonar el proyecto](#paso-2-descargar-o-clonar-el-proyecto)
   - [Paso 3: Permitir la ejecución de scripts en PowerShell (si corresponde)](#paso-3-permitir-la-ejecución-de-scripts-en-powershell-si-corresponde)
   - [Paso 4: Instalar dependencias npm](#paso-4-instalar-dependencias-npm)
   - [Paso 5: Instalar el navegador Chromium de Playwright](#paso-5-instalar-el-navegador-chromium-de-playwright)
   - [Paso 6: Prueba de validación de Chromium](#paso-6-prueba-de-validación-de-chromium)
   - [Paso 7: Configurar credenciales y cifrado](#paso-7-configurar-credenciales-y-cifrado)
   - [Paso 8: Primera ejecución](#paso-8-primera-ejecución)
4. [Exportación e importación de sesión autenticada](#4-exportación-e-importación-de-sesión-autenticada)
5. [Programación automática diaria (Task Scheduler)](#5-programación-automática-diaria-task-scheduler)
   - [Opción 1: Creación automática mediante PowerShell (1 comando)](#opción-1-creación-automática-mediante-powershell-1-comando)
   - [Opción 2: Creación manual mediante interfaz gráfica](#opción-2-creación-manual-mediante-interfaz-gráfica)
6. [Resolución de problemas frecuentes en Windows](#6-resolución-de-problemas-frecuentes-en-windows)

---

## 1. Requisitos mínimos

- **Sistema operativo:** Windows 10 (versión 1809 o superior) o Windows 11 (64 bits).
- **Terminal:** símbolo del sistema (`cmd.exe`), PowerShell (`powershell.exe`) o Windows Terminal.
- **Node.js:** versión 22 LTS o superior (`node >= 22`).
- **Privilegios:** usuario estándar (se necesita administrador solo para instalar paquetes globales o cambiar las políticas de ejecución).

---

## 2. Método A: Instalación automática (`setup_windows.bat` o `setup_windows.ps1`)

El proyecto incluye instaladores automatizados que comprueban la versión de Node.js, ejecutan `npm install`, instalan el binario de Chromium, generan la plantilla `credentials.env` y validan el funcionamiento headless del navegador.

### Opción 1: Mediante el símbolo del sistema o doble clic (CMD)

1. Abre la carpeta del proyecto en el **Explorador de archivos**.
2. Haz doble clic en el archivo **`setup_windows.bat`** (o ejecuta `setup_windows.bat` en CMD).
3. Espera a que finalice con el mensaje `INSTALACAO CONCLUIDA COM SUCESSO!`.

### Opción 2: Mediante PowerShell

Abre la terminal de PowerShell en la carpeta del proyecto y ejecuta:

```powershell
.\setup_windows.ps1
```

> Si PowerShell muestra un error de ejecución de scripts deshabilitada, ejecuta antes:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

Al final, configura tus credenciales en `credentials.env` y ejecuta `run_all.bat` (o `.\run_all.ps1`).

---

## 3. Método B: Instalación manual paso a paso

### Paso 1: Instalación de Node.js 22 LTS

El proyecto requiere **Node.js 22 o superior**.

#### Opción 1: Mediante el gestor de paquetes de Windows (`winget`)

```cmd
winget install OpenJS.NodeJS.LTS
```

#### Opción 2: Mediante Chocolatey

```cmd
choco install nodejs-lts
```

#### Opción 3: Desde el sitio oficial (instalador .msi)

1. Accede a: [https://nodejs.org/](https://nodejs.org/).
2. Descarga la versión recomendada **22 LTS** (instalador `.msi` para Windows x64).
3. Ejecuta el instalador manteniendo las opciones predeterminadas (asegúrate de que **"Add to PATH"** esté seleccionado).
4. Cierra y vuelve a abrir la terminal para recargar el `PATH`.

#### Validar la instalación:

```cmd
node -v
npm -v
```

_(El comando `node -v` debe mostrar `v22.x.x` o superior, y `npm -v` debe mostrar la versión 10 o superior)._

---

### Paso 2: Descargar o clonar el proyecto

#### Mediante Git:

```cmd
git clone https://github.com/edlabh/ali-coins.git
cd ali-coins
```

#### O mediante descarga ZIP:

1. En GitHub, haz clic en **Code** > **Download ZIP**.
2. Extrae el archivo ZIP en una carpeta (ejemplo: `C:\Users\TuUsuario\ali-coins`).
3. Abre la terminal en esa carpeta.

---

### Paso 3: Permitir la ejecución de scripts en PowerShell (si corresponde)

Si vas a usar PowerShell y recibes un aviso de scripts deshabilitados:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Paso 4: Instalar dependencias npm

En la raíz de la carpeta del proyecto:

```cmd
npm install
```

Esto instalará las dependencias necesarias (`playwright`, `zod`, `pino`, `commander`, etc.).

---

### Paso 5: Instalar el navegador Chromium de Playwright

Playwright gestiona el navegador de forma aislada en `%USERPROFILE%\AppData\Local\ms-playwright`.

Ejecuta:

```cmd
npx playwright install chromium
```

> En instalaciones limpias de Windows o máquinas virtuales sin paquetes de runtime C++, puede ser necesario instalar Microsoft Visual C++ Redistributable:
>
> ```cmd
> winget install Microsoft.VCRedist.2015+.x64
> ```

---

### Paso 6: Prueba de validación de Chromium

Para confirmar que Chromium se inicia en modo headless:

- **En el símbolo del sistema (CMD):**

  ```cmd
  node -e "const { chromium } = require('playwright'); chromium.launch({ headless: true }).then(b => b.close()).then(() => console.log('Chromium OK!')).catch(e => { console.error(e); process.exit(1); })"
  ```

- **En PowerShell:**
  ```powershell
  node -e "const { chromium } = require('playwright'); chromium.launch({ headless: true }).then(b => b.close()).then(() => console.log('Chromium OK!')).catch(e => { console.error(e); process.exit(1); })"
  ```

Si la salida muestra `Chromium OK!`, tu entorno está listo.

---

### Paso 7: Configurar credenciales y cifrado

1. Crea el archivo `credentials.env` a partir de la plantilla de ejemplo:
   - **En CMD:**
     ```cmd
     copy credentials.env.example credentials.env
     ```
   - **En PowerShell:**
     ```powershell
     Copy-Item credentials.env.example credentials.env
     ```

2. Abre el archivo en el Bloc de notas:

   ```cmd
   notepad credentials.env
   ```

3. Rellena la configuración principal:

   ```env
   # Credenciales de AliExpress
   # Mantenlas siempre entre comillas dobles. Las contraseñas con #, espacios o ! sin comillas
   # se truncan silenciosamente. Ej.: ALI_PASSWORD="abc#123!"
   ALI_USER="tu_email_o_telefono"
   ALI_PASSWORD="tu_contrasena"

   # Soporte multicuenta secuencial (opcional - hasta 20 cuentas):
   # ALI_USER_2="segunda_cuenta@email.com"
   # ALI_PASSWORD_2="contrasena_de_la_segunda_cuenta"

   # Clave de cifrado AES-256-GCM para at-rest y exportación (mínimo 32 caracteres)
   # Cómo generarla usando Node.js en Windows: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   SESSION_SECRET="tu_clave_secreta_con_al_menos_32_caracteres"

   # Cifrado local at-rest de la sesión en disco (session.json.enc)
   ENCRYPT_LOCAL_SESSION=true

   # Identificador del equipo en los mensajes de Telegram (opcional)
   # NOTIFY_HOST_LABEL="mi-escritorio-windows"

   # Dead Man's Switch / Uptime Heartbeat (opcional, ej.: Healthchecks.io)
   # HEARTBEAT_URL="https://hc-ping.com/tu-uuid"

   # Seguridad de destinos externos (SSRF): webhook y heartbeat bloquean por defecto
   # direcciones loopback/privadas (127.0.0.1, 10.x, 192.168.x, 169.254.169.254, ::1 etc.)
   # En pruebas locales, habilita destinos privados explícitamente:
   # ALLOW_PRIVATE_WEBHOOKS=true
   ```

   _Guarda el archivo (`Ctrl + S`) y cierra el Bloc de notas._

#### Cómo generar la clave de 32 caracteres (`SESSION_SECRET`):

Puedes obtener tu clave criptográfica mediante cualquiera de los siguientes métodos:

- **Opción 1 (recomendada en Windows - Node.js nativo, sin OpenSSL):**
  Como Node.js ya está instalado en tu sistema, ejecuta directamente en CMD o PowerShell:
  ```cmd
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
  Esto generará al instante una clave aleatoria criptográficamente segura de 32 bytes en Base64 (44 caracteres) lista para pegar en `credentials.env`.
- **Opción 2 (mediante el script de 1 clic):**
  Ejecuta la utilidad generadora de claves incluida en la raíz del proyecto:
  - En el símbolo del sistema (CMD): `generate_secret.bat`
  - En PowerShell: `.\generate_secret.ps1`
- **Opción 3 (mediante OpenSSL - si está instalado en el sistema o en Git for Windows):**
  Si ya tienes OpenSSL instalado en el sistema o Git for Windows, ejecuta en la terminal:
  ```cmd
  openssl rand -base64 32
  ```
- **Opción 4 (generación automática por el instalador):**
  Si utilizaste el instalador `setup_windows.bat` o `setup_windows.ps1` (Método A), la clave `SESSION_SECRET` de 32 caracteres ya se generó y configuró automáticamente en tu archivo `credentials.env`.

---

### Paso 8: Primera ejecución

- **Modo unificado (recomendado - check-in diario + tareas):**
  - En CMD: `run_all.bat`
  - En PowerShell: `.\run_all.ps1`
  - Mediante npm: `npm start`

- **Solo check-in:**
  - En CMD: `run.bat`
  - En PowerShell: `.\run.ps1`

- **Solo tareas:**
  - En CMD: `run_tasks.bat`
  - En PowerShell: `.\run_tasks.ps1`

---

## 4. Exportación e importación de sesión autenticada

Si tu login en AliExpress encuentra un Slide Captcha o quieres transferir la sesión entre computadoras sin exponer credenciales:

### Exportar la sesión cifrada (AES-256-GCM v2):

- **Cuenta única o predeterminada:**
  ```cmd
  node export_session.js
  ```
- **Exportar todas las cuentas (multicuenta):**
  ```cmd
  node export_session.js --all
  ```
- **Exportar solo una cuenta específica:**
  ```cmd
  node export_session.js --account=2
  ```

Los tokens cifrados se guardarán en `session_token.txt` (Cuenta 1), `session_token_2.txt` (Cuenta 2), etc.

### Importar la sesión cifrada:

- **Importar todas las cuentas a la vez:**
  ```cmd
  node import_session.js --all
  ```
- **Importar una cuenta individual (símbolo del sistema - CMD):**
  ```cmd
  node import_session.js --from-file=session_token.txt
  node import_session.js --from-file=session_token_2.txt
  ```
- **Importar una cuenta individual (PowerShell):**
  ```powershell
  Get-Content session_token.txt | node import_session.js
  Get-Content session_token_2.txt | node import_session.js
  ```

> El importador realiza **enrutamiento automático inteligente**: identifica a qué cuenta pertenece el token y lo guarda en los archivos aislados correspondientes (`session.json.enc` para la Cuenta 1, `session_<hash>.json.enc` para las demás), sin sobrescribir nunca otras cuentas.

---

## 5. Programación automática diaria (Task Scheduler)

> **Consejo — retraso aleatorio portátil:** el Programador de tareas de Windows tiene su propio retraso, pero
> no es portátil. Con `START_DELAY_MIN_MS`/`START_DELAY_MAX_MS` en `credentials.env`
> (ej.: `0` y `3540000` para hasta ~59 min) el comportamiento es el mismo en cualquier sistema,
> **no retrasa en `--dry-run`** y puede omitirse con `--no-delay`. En Windows, recuerda
> que el "límite de tiempo" de la tarea cuenta el retraso; la tolerancia del heartbeat debe ser >= al techo.

### Opción 1: Creación automática mediante PowerShell (1 comando)

Abre PowerShell en la carpeta del proyecto y ejecuta (ejemplo para ejecutar a diario a las **08:00**):

```powershell
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument '/c set "NODE_OPTIONS=--max-old-space-size=256" && set "NODE_COMPILE_CACHE=%TEMP%\ali-coins-compile-cache" && run_all.bat >> coins_daily.log 2>&1' -WorkingDirectory "$PWD"
$trigger = New-ScheduledTaskTrigger -Daily -At 8:00AM
Register-ScheduledTask -TaskName "AliExpressCoinsCollector" -Action $action -Trigger $trigger -Description "Recogida diaria de monedas de AliExpress"
```

---

### Opción 2: Creación manual mediante interfaz gráfica

1. Pulsa `Win + R`, escribe `taskschd.msc` y haz clic en **OK**.
2. En el menú de la derecha, haz clic en **Crear tarea básica...**.
3. **Nombre:** escribe `AliExpress Coins Collector` y haz clic en **Siguiente**.
4. **Desencadenador:** selecciona **Diariamente** y define la hora de ejecución deseada (ej.: `08:00:00`).
5. **Acción:** selecciona **Iniciar un programa**.
6. **Configuración de la acción:**
   - **Programa/script:** `cmd.exe`
   - **Agregar argumentos (opcional):** `/c run_all.bat >> coins_daily.log 2>&1`
   - **Iniciar en (opcional):** ruta completa de la carpeta del proyecto (ejemplo: `C:\Users\TuUsuario\ali-coins`).
7. Haz clic en **Siguiente** y luego en **Finalizar**.

---

## 6. Resolución de problemas frecuentes en Windows

### A. `'node' o 'npm' no se reconoce como un comando interno o externo`

- **Causa:** Node.js no se agregó a la variable de entorno `PATH` o la terminal se abrió antes de que finalizara la instalación.
- **Solución:** cierra todas las ventanas de terminal y abre una nueva. Si persiste, reinicia el equipo.

### B. `Error al inicializar Chromium: MSVCP140.dll / VCRUNTIME140.dll ausente`

- **Causa:** los entornos Windows sin Microsoft Visual C++ Redistributable instalado no pueden cargar las dependencias de compilación de Chromium headless.
- **Solución:** ejecuta en la terminal:
  ```cmd
  winget install Microsoft.VCRedist.2015+.x64
  ```

### C. `No se puede cargar el archivo ... porque la ejecución de scripts está deshabilitada en este sistema`

- **Causa:** política de restricción predeterminada de PowerShell (`ExecutionPolicy Restricted`).
- **Solución:** ejecuta en PowerShell:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### D. Ejecutar `setup_windows.bat` como Administrador cambia el directorio de trabajo

- **Causa:** por defecto, Windows establece `C:\Windows\System32` como directorio de trabajo al elegir "Ejecutar como Administrador".
- **Solución:** `setup_windows.bat` ya incluye el comando de anclaje `cd /d "%~dp0"` para garantizar que las dependencias se instalen siempre en la carpeta correcta del proyecto.

### E. Alerta de Windows Defender / SmartScreen

- **Causa:** como Playwright abre un proceso de navegador en segundo plano con control de eventos, los antivirus estrictos pueden mostrar una alerta en la primera ejecución.
- **Solución:** haz clic en **"Más información"** y luego en **"Ejecutar de todos modos"**.

### F. Error de rutas largas (`Filename too long` / MAX_PATH)

- **Causa:** Windows limita las rutas de archivos a 260 caracteres por defecto.
- **Solución:** habilita rutas largas en PowerShell (como Administrador):
  ```powershell
  New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
  ```

### G. Caracteres extraños o emojis rotos en los logs (Mojibake / codificación)

- **Causa:** por defecto, las terminales clásicas de Windows (CMD y PowerShell 5.1) utilizan páginas de código heredadas (CP850 o CP437), que no renderizan de forma nativa cadenas UTF-8 ni emojis como `🪙`, `💰`, `⏱️`, `✅`, `🚨`.
- **Solución:**
  - Utiliza los scripts incluidos (`run_all.bat` o `.\run_all.ps1`), que configuran automáticamente la página de código UTF-8 (`chcp 65001`) y las codificaciones de consola.
  - Si prefieres ejecutar comandos `node` manualmente en una terminal abierta, ejecuta antes:
    - En el símbolo del sistema (CMD): `chcp 65001`
    - En PowerShell: `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; chcp 65001 > $null`
  - También recomendamos usar **Windows Terminal** (nativo en Windows 11 o instalable mediante `winget install Microsoft.WindowsTerminal`), que tiene soporte moderno y renderizado completo de emojis por defecto.
- **Archivo de log con acentos rotos:** en **PowerShell 5.1**, redirigir con `>`/`>>`
  guarda el archivo en **UTF-16LE** (parece "roto" en herramientas que esperan UTF-8). Prefiere:
  - **CMD (recomendado, genera UTF-8):** `run_all.bat >> coins_daily.log 2>&1`
  - **PowerShell (fuerza UTF-8):** `.\run_all.ps1 2>&1 | Out-File -FilePath coins_daily.log -Append -Encoding utf8`
  - Para **visualizar** el log, usa el Bloc de notas o VS Code (detectan UTF-8). En CMD, `type coins_daily.log` puede mostrarse incorrectamente si la página de código no está en 65001.

### H. Optimización para entornos con poca memoria RAM (1 GB a 2 GB o máquinas virtuales Windows)

Si ejecutas la automatización en máquinas virtuales Windows compactas o computadoras con poca memoria disponible:

1. **Memoria virtual (archivo de paginación - Pagefile):**
   - Asegúrate de que Windows tenga un archivo de paginación habilitado y administrado por el sistema (o fijado en al menos 2 GB).
   - Verifícalo en: **Configuración > Sistema > Acerca de > Configuración avanzada del sistema > Avanzado > Rendimiento (Configuración) > Avanzado > Memoria virtual**.

2. **Flags de bajo consumo de Chromium nativas:**
   - `browser.js` ya aplica por defecto los argumentos `--disable-gpu`, `--disable-software-rasterizer`, `--renderer-process-limit=1`, `--js-flags=--max-old-space-size=128`, `--disk-cache-size=10485760` y `ALLOW_MEDIA=false` en ejecuciones mediante `run_all.bat` y `run_all.ps1`.

3. **Límite de heap de Node.js (`NODE_OPTIONS`):**
   - Para forzar al Garbage Collector de Node.js a mantener un consumo compacto (256 MB):
     - En el símbolo del sistema (CMD):
       ```cmd
       set "NODE_OPTIONS=--max-old-space-size=256" && set "NODE_COMPILE_CACHE=%TEMP%\ali-coins-compile-cache" && run_all.bat
       ```
     - En PowerShell:
       ```powershell
       $env:NODE_OPTIONS = "--max-old-space-size=256"
       $env:NODE_COMPILE_CACHE = Join-Path $env:TEMP "ali-coins-compile-cache"
       .\run_all.ps1
       ```

   > Los scripts `run_all.bat`/`run.ps1`/`run_tasks.*` ya definen `NODE_OPTIONS` y `NODE_COMPILE_CACHE` (caché de bytecode V8 en `%TEMP%`) automáticamente.

4. **Reducir el coste criptográfico de `scrypt`:**
   - En `credentials.env`, configura `SCRYPT_N=32768` (o `16384`) para limitar el pico de derivación de clave de ~134 MB a ~33 MB durante la lectura/escritura de la sesión `.enc`.
