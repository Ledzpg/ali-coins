# Guía detallada de instalación en macOS (Apple Silicon e Intel)

> 🌐 **Idiomas:** [Português](INSTALL_MACOS.md) | [English](INSTALL_MACOS.en.md) | [Español](INSTALL_MACOS.es.md)

> ℹ️ Traducción al español de la documentación canónica en portugués. En caso de divergencia, prevalece la versión en portugués.

Este manual describe el proceso completo paso a paso para instalar, configurar y ejecutar **AliExpress Coin Collector & Task Runner** en **macOS** (macOS 12 Monterey, 13 Ventura, 14 Sonoma y 15 Sequoia), compatible de forma nativa con procesadores **Apple Silicon (M1, M2, M3 y M4)** y Macs con procesador **Intel**.

---

## Índice

1. [Requisitos mínimos](#1-requisitos-mínimos)
2. [Método A: Instalación automática (`setup_macos.sh`)](#2-método-a-instalación-automática-setup_macossh)
3. [Método B: Instalación manual paso a paso](#3-método-b-instalación-manual-paso-a-paso)
   - [Paso 1: Instalación de Node.js 22 LTS](#paso-1-instalación-de-nodejs-22-lts)
   - [Paso 2: Descargar o clonar el proyecto y permisos](#paso-2-descargar-o-clonar-el-proyecto-y-permisos)
   - [Paso 3: Instalar dependencias npm](#paso-3-instalar-dependencias-npm)
   - [Paso 4: Instalar el navegador Chromium de Playwright](#paso-4-instalar-el-navegador-chromium-de-playwright)
   - [Paso 5: Prueba de validación de Chromium](#paso-5-prueba-de-validación-de-chromium)
   - [Paso 6: Configurar credenciales](#paso-6-configurar-credenciales)
   - [Paso 7: Primera ejecución](#paso-7-primera-ejecución)
4. [Programación automática diaria en macOS](#4-programación-automática-diaria-en-macos)
   - [Opción 1: Mediante Cron (la más simple)](#opción-1-mediante-cron-la-más-simple)
   - [Opción 2: Mediante Launchd (nativo y recomendado en macOS)](#opción-2-mediante-launchd-nativo-y-recomendado-en-macos)
5. [Resolución de problemas frecuentes en macOS](#5-resolución-de-problemas-frecuentes-en-macos)

---

## 1. Requisitos mínimos

- **Sistema:** macOS 12 (Monterey) o superior.
- **Procesador:** Apple Silicon (M1/M2/M3/M4 - ARM64) o Intel (x86_64).
- **Terminal:** aplicación Terminal de macOS o iTerm2.
- **Node.js:** versión 22 LTS o superior (`node >= 22`).

---

## 2. Método A: Instalación automática (`setup_macos.sh`)

El proyecto incluye un script que detecta tu arquitectura (Apple Silicon o Intel), instala **Node.js** mediante Homebrew si es necesario, descarga el binario nativo de Chromium, concede permisos de ejecución y prepara tu archivo de credenciales con generación automática y preconfiguración de la clave `SESSION_SECRET` (AES-256):

```bash
cd ali-coins
chmod +x setup_macos.sh
./setup_macos.sh
```

Tras la ejecución, configura tu email/contraseña con `nano credentials.env` (la clave criptográfica ya viene preconfigurada) e inicia la recogida con `./run_all.sh`.

---

## 3. Método B: Instalación manual paso a paso

### Paso 1: Instalación de Node.js 22 LTS

El proyecto necesita **Node.js 22 o superior**.

#### Opción 1: Mediante Homebrew (recomendado para macOS)

Homebrew es el gestor de paquetes estándar de la comunidad para macOS.

1. Si aún no tienes Homebrew instalado, instálalo con:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

   _(En Apple Silicon, sigue la instrucción que se muestra al final de la instalación para añadir Homebrew al PATH en tu `~/.zprofile`)_:

   ```bash
   echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
   eval "$(/opt/homebrew/bin/brew shellenv)"
   ```

2. Instala Node.js:
   ```bash
   brew install node
   ```

#### Opción 2: Desde el sitio oficial (paquete .pkg)

1. Accede a: [https://nodejs.org/](https://nodejs.org/).
2. Descarga la versión recomendada **22 LTS** (instalador `.pkg` para macOS).
3. Abre el archivo `.pkg` y sigue los pasos del asistente de instalación de Apple.

#### Opción 3: Mediante NVM (Node Version Manager)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zshrc
nvm install 22
nvm use 22
```

#### Validar la instalación:

Abre la **Terminal** y confirma las versiones:

```bash
node -v
npm -v
```

_(Debe mostrar `v22.x.x` o superior y npm versión 10 o superior)._

---

### Paso 2: Descargar o clonar el proyecto y permisos

Abre la Terminal y clona el repositorio:

```bash
git clone https://github.com/edlabh/ali-coins.git
cd ali-coins
chmod +x *.sh
```

---

### Paso 3: Instalar dependencias npm

En la carpeta del proyecto, instala las dependencias declaradas en `package.json`:

```bash
npm install
```

---

### Paso 4: Instalar el navegador Chromium de Playwright

Playwright identifica automáticamente la arquitectura de tu procesador y descarga la versión compilada de forma nativa para **Apple Silicon (arm64)** o **Intel (x64)**:

```bash
npx playwright install chromium
```

> **Nota para macOS:** a diferencia de Linux, Chromium en macOS es totalmente autocontenido y no requiere instalar paquetes externos del sistema mediante root/sudo.

---

### Paso 5: Prueba de validación de Chromium

Ejecuta la prueba rápida para confirmar que Chromium se abre perfectamente en segundo plano:

```bash
node -e "const { chromium } = require('playwright'); (async () => { const b = await chromium.launch({ headless: true }); console.log('¡Chromium OK en macOS!'); await b.close(); })();"
```

Si se muestra el mensaje `¡Chromium OK en macOS!`, el navegador está 100 % funcional.

---

### Paso 6: Configurar credenciales

1. Crea el archivo `credentials.env` a partir de la plantilla y restringe los permisos:

   ```bash
   cp credentials.env.example credentials.env
   chmod 600 credentials.env
   ```

2. Abre el archivo en tu editor preferido (`nano credentials.env` o `open -e credentials.env`):

   ```env
   # Credenciales de AliExpress (obligatorias)
   # Mantenlas siempre entre comillas dobles. Las contraseñas con #, espacios o ! sin comillas
   # se truncan silenciosamente. Ej.: ALI_PASSWORD="abc#123!"
   ALI_USER="tu_email_o_telefono"
   ALI_PASSWORD="tu_contrasena"

   # Soporte multicuenta secuencial (opcional - hasta 20 cuentas):
   # ALI_USER_2="segunda_cuenta@email.com"
   # ALI_PASSWORD_2="contrasena_de_la_segunda_cuenta"

   # Cifrado local at-rest en disco (session.json.enc) y exportación (mínimo 32 caracteres)
   # Genera en la terminal con: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   SESSION_SECRET="tu_clave_secreta_con_al_menos_32_caracteres"
   ENCRYPT_LOCAL_SESSION=true

   # Identificador del host en Telegram (opcional, útil para varias computadoras):
   # NOTIFY_HOST_LABEL="mi-macbook-pro"

   # Dead Man's Switch / Uptime Heartbeat (opcional, ej.: Healthchecks.io):
   # HEARTBEAT_URL="https://hc-ping.com/tu-uuid-aqui"

   # Seguridad de destinos externos (SSRF): webhook y heartbeat bloquean por defecto
   # direcciones loopback/privadas (127.0.0.1, 10.x, 192.168.x, 169.254.169.254, ::1 etc.).
   # En pruebas locales, habilita destinos privados explícitamente:
   # ALLOW_PRIVATE_WEBHOOKS=true

   # Rendimiento y navegador:
   ALLOW_MEDIA=false
   HEADLESS=true
   LOG_LEVEL=info
   ```

   Asegúrate también de que todos los archivos de sesión tengan permiso restringido:

   ```bash
   chmod 600 session* session_token.txt 2>/dev/null || true
   ```

---

### Paso 7: Primera ejecución

- **Modo unificado (recomendado - check-in diario + tareas):**
  ```bash
  ./run_all.sh
  # o mediante npm:
  npm start
  ```
- **Solo check-in diario:** `./run.sh`
- **Solo tareas:** `./run_tasks.sh`

---

## 4. Programación automática diaria en macOS

> **Consejo — retraso aleatorio portátil:** `cron` y `launchd` no tienen un retraso aleatorio propio.
> Usa `START_DELAY_MIN_MS`/`START_DELAY_MAX_MS` en `credentials.env` (ej.: `0` y `3540000`
> para hasta ~59 min) — vale para macOS, Linux, Windows y Docker, **no retrasa en `--dry-run`**
> y puede omitirse con `--no-delay`. La tolerancia del heartbeat debe ser >= al techo del retraso.

### Opción 1: Mediante Cron (la más simple)

1. Abre la edición del crontab en la Terminal:
   ```bash
   crontab -e
   ```
2. Añade las líneas siguientes para ejecutar todos los días a las 08:00 (ajusta la ruta de la carpeta):
   ```cron
   SHELL=/bin/zsh
   PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
   NODE_OPTIONS="--max-old-space-size=256"

   0 8 * * * cd /ruta/completa/a/ali-coins && ./run_all.sh >> coins_daily.log 2>&1
   ```

> ⚠️ **Importante en macOS Ventura/Sonoma/Sequoia:** el sistema de seguridad de Apple exige permiso de acceso a archivos para la utilidad cron. Si la ejecución no escribe logs, accede a:
> **Ajustes del Sistema > Privacidad y Seguridad > Acceso total al disco** y habilita la aplicación **Terminal** y `/usr/sbin/cron`.

---

### Opción 2: Mediante Launchd (nativo y recomendado en macOS)

`launchd` es el subsistema nativo de macOS para programar tareas en segundo plano. Tiene la gran ventaja de ejecutar tareas pendientes incluso si el equipo está en reposo en el momento exacto del disparo.

1. Crea el archivo de definición del agente de inicio:

   ```bash
   mkdir -p ~/Library/LaunchAgents
   nano ~/Library/LaunchAgents/com.alicoins.collector.plist
   ```

2. Pega el contenido siguiente (sustituye `/Users/TU_USUARIO/ali-coins` por la ruta real de la carpeta del proyecto):

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.alicoins.collector</string>
       <key>EnvironmentVariables</key>
       <dict>
           <key>NODE_OPTIONS</key>
           <string>--max-old-space-size=256</string>
           <key>NODE_COMPILE_CACHE</key>
           <string>/tmp/ali-coins-compile-cache</string>
       </dict>
       <key>ProgramArguments</key>
       <array>
           <string>/bin/zsh</string>
           <string>-c</string>
           <string>cd /Users/TU_USUARIO/ali-coins && ./run_all.sh >> coins_daily.log 2>&1</string>
       </array>
       <key>StartCalendarInterval</key>
       <dict>
           <key>Hour</key>
           <integer>8</integer>
           <key>Minute</key>
           <integer>0</integer>
       </dict>
       <key>StandardErrorPath</key>
       <string>/Users/TU_USUARIO/ali-coins/launchd_err.log</string>
       <key>StandardOutPath</key>
       <string>/Users/TU_USUARIO/ali-coins/launchd_out.log</string>
   </dict>
   </plist>
   ```

3. Carga el agente en el sistema:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.alicoins.collector.plist
   ```

---

## 5. Resolución de problemas frecuentes en macOS

### A. `zsh: command not found: node` o `npm`

- **Causa:** Homebrew o Node.js se instalaron, pero su directorio bin no está en el `PATH` del shell `zsh`.
- **Solución:** añade la línea correspondiente en tu `~/.zshrc`:
  - **Apple Silicon:** `export PATH="/opt/homebrew/bin:$PATH"`
  - **Intel:** `export PATH="/usr/local/bin:$PATH"`
    Después, ejecuta `source ~/.zshrc`.

### B. `zsh: permission denied: ./run_all.sh`

- **Causa:** el script no tiene el bit de ejecución habilitado.
- **Solución:** ejecuta `chmod +x *.sh` dentro de la carpeta del proyecto.

### C. Alerta de seguridad de macOS (Gatekeeper / desarrollador no identificado)

- **Causa:** en algunas versiones de macOS, el binario de Chromium descargado por Playwright puede solicitar una confirmación de seguridad.
- **Solución:** ve a **Ajustes del Sistema > Privacidad y Seguridad**, desplázate hasta la sección "Seguridad" y haz clic en **Permitir de todos modos** si hay algún aviso relacionado con Chromium.

### D. Optimización de recursos y bajo consumo de memoria (Macs con poca RAM o VMs)

Si ejecutas la automatización en máquinas virtuales macOS o Macs cuyos recursos de memoria se comparten con otras apps pesadas:

1. **Flags de bajo consumo de Chromium nativas:**
   `browser.js` ya activa por defecto flags de ahorro de memoria (`--disable-gpu`, `--disable-software-rasterizer`, `--renderer-process-limit=1`, `--js-flags=--max-old-space-size=128`, `--disk-cache-size=10485760` y `ALLOW_MEDIA=false`). Funcionan automáticamente mediante `./run_all.sh` o `npm start`.

2. **Límite de heap de Node.js (`NODE_OPTIONS`):**
   Para forzar al Garbage Collector de Node.js a mantener el heap compacto:

   ```bash
   export NODE_OPTIONS="--max-old-space-size=256"
   ./run_all.sh
   ```

   > Los scripts `run_all.sh`/`run.sh`/`run_tasks.sh` ya definen `NODE_OPTIONS` y `NODE_COMPILE_CACHE` (caché de bytecode V8 en `/tmp/ali-coins-compile-cache-$UID`) automáticamente — las líneas anteriores son útiles al llamar a `node` directamente.

3. **Coste criptográfico de `scrypt`:**
   En `credentials.env`, configura `SCRYPT_N=32768` (o `16384`) para limitar el pico de derivación de clave de ~134 MB a ~33 MB durante la carga de la sesión.

---
