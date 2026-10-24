# Guía detallada de instalación en Linux (Ubuntu 22.04 LTS / 24.04 LTS y Debian)

> 🌐 **Idiomas:** [Português](INSTALL_LINUX.md) | [English](INSTALL_LINUX.en.md) | [Español](INSTALL_LINUX.es.md)

> ℹ️ Traducción al español de la documentación canónica en portugués. En caso de divergencia, prevalece la versión en portugués.

Este manual fue creado para guiarte paso a paso en la instalación completa de **AliExpress Coin Collector & Task Runner** en cualquier entorno Linux, desde escritorios hasta servidores en la nube headless (como Oracle Cloud, AWS EC2, DigitalOcean, Google Cloud, etc.).

---

## Índice

1. [Requisitos mínimos](#1-requisitos-mínimos)
2. [Método A: Instalación automática (recomendado - 1 comando)](#2-método-a-instalación-automática-recomendado---1-comando)
3. [Método B: Instalación manual detallada paso a paso](#3-método-b-instalación-manual-detallada-paso-a-paso)
   - [Paso 1: Limpieza de versiones antiguas de Node.js](#paso-1-limpieza-de-versiones-antiguas-de-nodejs)
   - [Paso 2: Instalación de Node.js 22 LTS](#paso-2-instalación-de-nodejs-22-lts)
   - [Paso 3: Clonar el proyecto y permisos](#paso-3-clonar-el-proyecto-y-permisos)
   - [Paso 4: Instalación de las dependencias npm](#paso-4-instalación-de-las-dependencias-npm)
   - [Paso 5: Instalación de Chromium y dependencias nativas del SO](#paso-5-instalación-de-chromium-y-dependencias-nativas-del-so)
   - [Paso 6: Validación rápida de Chromium](#paso-6-validación-rápida-de-chromium)
   - [Paso 7: Configuración de credenciales](#paso-7-configuración-de-credenciales)
   - [Paso 8: Primera ejecución](#paso-8-primera-ejecución)
4. [Configuración de la programación diaria (Crontab)](#4-configuración-de-la-programación-diaria-crontab)
5. [Resolución de problemas frecuentes (Troubleshooting)](#5-resolución-de-problemas-frecuentes-troubleshooting)

---

## 1. Requisitos mínimos

- **Distribución:** Ubuntu 20.04 LTS, Ubuntu 22.04 LTS, Ubuntu 24.04 LTS o Debian 11/12 (arquitectura x86_64 o ARM64/aarch64).
- **Node.js:** versión 22 LTS o superior (`node >= 22`).
- **Recursos de hardware:** mínimo 1 vCPU y 1 GB de RAM (para servidores con 1 GB de RAM o menos, se recomienda activar 1 GB o 2 GB de memoria Swap).
- **Acceso:** privilegios `sudo` para instalar las bibliotecas del sistema.

---

## 2. Método A: Instalación automática (recomendado - 1 comando)

Si ya clonaste el repositorio, simplemente ejecuta el script automatizado incluido en la raíz del proyecto:

```bash
cd ali-coins
chmod +x setup_linux.sh
./setup_linux.sh
```

El instalador automático realiza por sí solo:

1. Instalación de utilidades del sistema (`curl`, `git`, `ca-certificates`, `gnupg`);
2. Instalación de **Node.js 22 LTS** si el sistema no lo tiene o tiene una versión inferior a la 22;
3. Ejecución de `npm install`;
4. Descarga del navegador Chromium mediante Playwright;
5. Instalación de todas las bibliotecas nativas del SO específicas para tu distribución;
6. Configuración de los permisos de ejecución de los scripts `.sh`;
7. Creación del archivo de configuración `credentials.env` con generación automática y preconfiguración de la clave `SESSION_SECRET` (AES-256).

Tras finalizar, solo edita tus credenciales con `nano credentials.env` (la clave criptográfica ya viene preconfigurada) y ejecuta `./run_all.sh`.

---

## 3. Método B: Instalación manual detallada paso a paso

Sigue los pasos a continuación si quieres control total sobre cada paquete instalado en tu sistema operativo.

### Paso 1: Limpieza de versiones antiguas de Node.js

En Ubuntu 22.04 LTS estándar, el repositorio de Canonical instala Node.js `v12.22.9`. El proyecto y Playwright requieren **Node.js 22 LTS o superior**. Si ya instalaste el paquete estándar de apt anteriormente, elimínalo primero:

```bash
sudo apt-get remove -y nodejs npm
sudo apt-get autoremove -y
```

### Paso 2: Instalación de Node.js 22 LTS

#### Opción 1: Mediante el repositorio oficial de NodeSource (recomendado para servidores/VPS)

Instala el binario estable más reciente de Node.js 22 LTS y el npm actualizado:

```bash
# 1. Actualizar el índice de apt e instalar los requisitos previos
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg git

# 2. Descargar y registrar el repositorio oficial de NodeSource para Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# 3. Instalar Node.js y npm
sudo apt-get install -y nodejs

# 4. Validar que la instalación fue correcta (debe mostrar v22.x.x y npm 10+)
node -v
npm -v
```

#### Opción 2: Mediante NVM (Node Version Manager)

Si prefieres gestionar versiones en el espacio de usuario sin instalar paquetes globales en el sistema:

```bash
# Descargar e instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Cargar NVM en la sesión actual
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar y fijar Node.js 22 LTS
nvm install 22
nvm use 22
nvm alias default 22
```

### Paso 3: Clonar el proyecto y permisos

```bash
git clone https://github.com/edlabh/ali-coins.git
cd ali-coins
chmod +x *.sh
```

### Paso 4: Instalación de las dependencias npm

En la raíz de la carpeta `ali-coins`:

```bash
npm install
```

Esto instalará la versión fijada de Playwright declarada en `package.json` (`^1.48.0`).

### Paso 5: Instalación de Chromium y dependencias nativas del SO

Playwright gestiona sus navegadores de forma aislada en el directorio `~/.cache/ms-playwright/`.

1. **Descargar el binario de Chromium:**

   ```bash
   npx playwright install chromium
   ```

2. **Instalar las dependencias del sistema:**
   Incluso ejecutando en modo headless (sin interfaz gráfica), Chromium depende de varias bibliotecas nativas de decodificación de imagen, audio, red y renderizado X11.

   - **Método oficial automatizado de Playwright (el más sencillo):**

     ```bash
     sudo npx playwright install-deps chromium
     ```

   - **Método manual mediante apt-get:**
     Si prefieres instalar paquete por paquete o estás personalizando una imagen Docker/minimalista:

     **Para Ubuntu 22.04 LTS (Jammy) y Debian 11/12:**

     ```bash
     sudo apt-get update && sudo apt-get install -y \
       libasound2 \
       libatk-bridge2.0-0 \
       libatk1.0-0 \
       libatspi2.0-0 \
       libcairo2 \
       libcups2 \
       libdbus-1-3 \
       libdrm2 \
       libgbm1 \
       libglib2.0-0 \
       libnspr4 \
       libnss3 \
       libpango-1.0-0 \
       libx11-6 \
       libxcb1 \
       libxcomposite1 \
       libxdamage1 \
       libxext6 \
       libxfixes3 \
       libxkbcommon0 \
       libxrandr2 \
       fonts-liberation \
       fonts-noto-color-emoji
     ```

     **Para Ubuntu 24.04 LTS (Noble):**
     _(Nota: en Ubuntu 24.04, varios paquetes fueron renombrados con el sufijo `t64` debido a la transición de 64 bits del kernel Linux):_

     ```bash
     sudo apt-get update && sudo apt-get install -y \
       libasound2t64 \
       libatk-bridge2.0-0t64 \
       libatk1.0-0t64 \
       libatspi2.0-0t64 \
       libcairo2 \
       libcups2t64 \
       libdbus-1-3 \
       libdrm2 \
       libgbm1 \
       libglib2.0-0t64 \
       libnspr4 \
       libnss3 \
       libpango-1.0-0 \
       libx11-6 \
       libxcb1 \
       libxcomposite1 \
       libxdamage1 \
       libxext6 \
       libxfixes3 \
       libxkbcommon0 \
       libxrandr2 \
       fonts-liberation \
       fonts-noto-color-emoji
     ```

### Paso 6: Validación rápida de Chromium

Para tener la certeza del 100 % de que el navegador se inicia perfectamente sin errores de bibliotecas dinámicas ausentes:

```bash
node -e "const { chromium } = require('playwright'); (async () => { const b = await chromium.launch({ headless: true }); console.log('✅ Chromium iniciado con éxito en Linux!'); await b.close(); })();"
```

Si el comando imprime `✅ Chromium iniciado con éxito en Linux!`, tu entorno está 100 % listo.

### Paso 7: Configuración de credenciales

1. Copia el archivo de ejemplo y restringe los permisos a tu usuario (`0o600`):

   ```bash
   cp credentials.env.example credentials.env
   chmod 600 credentials.env
   ```

2. Abre el archivo en tu editor preferido (`nano credentials.env`):

   ```env
   # Credenciales de AliExpress (obligatorias)
   # Mantenlas siempre entre comillas dobles. Las contraseñas con #, espacios o ! sin comillas
   # se truncan silenciosamente. Ej.: ALI_PASSWORD="abc#123!"
   ALI_USER="tu_email_o_telefono"
   ALI_PASSWORD="tu_contrasena_de_aliexpress"

   # Soporte multicuenta secuencial (opcional - hasta 20 cuentas):
   # ALI_USER_2="segunda_cuenta@email.com"
   # ALI_PASSWORD_2="contrasena_de_la_segunda_cuenta"

   # Cifrado local at-rest en disco (session.json.enc) y exportación (mínimo 32 caracteres)
   # Genera con: openssl rand -base64 32
   SESSION_SECRET="tu_clave_secreta_con_al_menos_32_caracteres"
   ENCRYPT_LOCAL_SESSION=true

   # Rotación suave de claves criptográficas (opcional):
   # SESSION_SECRET_OLD="clave_antigua_durante_la_rotacion"

   # Identificador del host en Telegram (opcional, útil para servidores / contenedores Docker):
   # NOTIFY_HOST_LABEL="mi-servidor-vps"

   # Dead Man's Switch / Monitoreo de Uptime (Heartbeat) (opcional, ej.: Healthchecks.io):
   # HEARTBEAT_URL="https://hc-ping.com/tu-uuid-aqui"

   # Seguridad de destinos externos (SSRF): webhook y heartbeat bloquean por defecto
   # direcciones loopback/privadas (127.0.0.1, 10.x, 192.168.x, 169.254.169.254, ::1 etc.).
   # En pruebas locales, habilita destinos privados explícitamente:
   # ALLOW_PRIVATE_WEBHOOKS=true

   # Rendimiento y navegador:
   ALLOW_MEDIA=false
   HEADLESS=true
   LOG_LEVEL=info

   # Desactivar la sandbox de Chromium si es necesario (ej.: Ubuntu 24.04 sin AppArmor personalizado):
   # NO_SANDBOX=false
   ```

   Asegúrate también de que cualquier archivo de sesión creado tenga acceso restringido:

   ```bash
   chmod 600 session* session_token.txt 2>/dev/null || true
   ```

### Paso 8: Primera ejecución

Ejecuta el modo unificado para realizar el check-in diario y todas las tareas en secuencia:

```bash
./run_all.sh
# o:
npm start
```

---

## 4. Configuración de la programación diaria (Crontab)

> **Consejo — retraso aleatorio portátil:** en lugar de aleatorizar en el propio cron
> (`sleep $(shuf ...)`), usa `START_DELAY_MIN_MS`/`START_DELAY_MAX_MS` en `credentials.env`
> (ej.: `0` y `3540000` para un inicio en hasta ~59 min). Funciona igual en Linux, macOS,
> Windows y Docker, **no retrasa en `--dry-run`** y puede omitirse con `--no-delay`.
> La tolerancia del heartbeat debe ser mayor o igual al techo del retraso.

Para garantizar que tus monedas se recojan a diario sin intervención manual, configura `cron`.

### El problema clásico de Cron en Linux

El daemon `cron` ejecuta tareas con un entorno mínimo donde la variable `$PATH` contiene solo `/usr/bin:/bin`. Si instalaste Node mediante `/usr/local/bin` o NVM, cron fallará silenciosamente con el error `node: command not found`.

### Cómo configurarlo correctamente:

1. Abre la edición del crontab de tu usuario:

   ```bash
   crontab -e
   ```

2. Añade la definición explícita de `SHELL` y `PATH` al inicio, seguida de la línea del programador (ejemplo para ejecutar todos los días a las 08:00):

   ```cron
   SHELL=/bin/bash
   PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

   0 8 * * * cd /ruta/completa/a/ali-coins && ./run_all.sh >> coins_daily.log 2>&1
   ```

   > Sustituye `/ruta/completa/a/ali-coins` por el directorio real obtenido ejecutando `pwd` dentro de la carpeta del proyecto.

3. Para revisar los logs de las ejecuciones automáticas en cualquier momento:
   ```bash
   tail -n 50 coins_daily.log
   ```

---

## 5. Resolución de problemas frecuentes (Troubleshooting)

### A. Error: `E: Unable to locate package libasound2t64`

- **Causa:** este error ocurre al intentar instalar un paquete exclusivo de Ubuntu 24.04 en sistemas Ubuntu 22.04 o Debian.
- **Solución:** en Ubuntu 22.04 LTS, instala `libasound2` (sin el sufijo `t64`).

### B. Error: `Host system is missing dependencies to run browsers`

- **Causa:** faltan bibliotecas nativas de C/C++ requeridas por Chromium.
- **Cómo diagnosticar exactamente qué bibliotecas faltan:**
  Ejecuta el comando `ldd` en el binario de Chromium descargado por Playwright:
  ```bash
  ldd ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome | grep "not found"
  ```
- **Solución:** ejecuta `sudo npx playwright install-deps chromium` o instala los paquetes listados en el [Paso 5](#paso-5-instalación-de-chromium-y-dependencias-nativas-del-so).

### C. Error: `SyntaxError: Unexpected token '?'` o fallo de npm

- **Causa:** estás usando una versión heredada de Node.js (como la versión 12 predeterminada de Ubuntu 22.04).
- **Solución:** sigue el [Paso 2](#paso-2-instalación-de-nodejs-22-lts) para instalar **Node.js 22 LTS**.

### D. Servidores con poca memoria RAM (VPS de 512 MB o 1 GB - ejecución nativa o Docker)

En servidores con 1 GB de RAM (como instancias gratuitas de Oracle Cloud, AWS t2/t3.micro o DigitalOcean), el navegador Chromium o el proceso Node.js pueden ser terminados por el kernel Linux (_Out of Memory Killer - Exit Code 137_) si la memoria se agota durante la carga de páginas pesadas.

El proyecto incluye optimizaciones de bajo consumo que funcionan **tanto de forma nativa en el host como dentro de contenedores Docker**:

1. **Activar memoria Swap de 2 GB en el host (esencial):**

   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

   Valida con `free -h` que la línea `Swap:` muestre ~2.0Gi.

2. **Flags de bajo consumo de Chromium (activadas por defecto):**
   `browser.js` ya aplica automáticamente argumentos de reducción de huella en cualquier ejecución (`./run_all.sh`, `npm start` o Docker):
   - `--disable-gpu` y `--disable-software-rasterizer` (evita el pipeline de rasterización por software);
   - `--renderer-process-limit=1` (restringe a 1 proceso de renderización);
   - `--js-flags=--max-old-space-size=128` (limita el heap V8 interno de Chromium a 128 MB);
   - `--disk-cache-size=10485760` (limita la caché a 10 MB);
   - Bloqueo de medios pesados (`ALLOW_MEDIA=false`).
     _(Si deseas desactivarlo en máquinas con mucha memoria, define `CHROMIUM_LOW_MEMORY=false`)._

3. **Limitar el heap de Node.js fuera de Docker (`NODE_OPTIONS`):**
   Para forzar al Garbage Collector de Node.js a recoger basura antes de alcanzar el límite de RAM del servidor:
   - **En la terminal:**
     ```bash
     export NODE_OPTIONS="--max-old-space-size=256"
     ./run_all.sh
     ```
   - **En Crontab (`crontab -e`):**
     ```cron
     NODE_OPTIONS="--max-old-space-size=256"
     0 8 * * * cd /home/ubuntu/ali-coins && ./run_all.sh >> cron.log 2>&1
     ```

   > Los scripts `run_all.sh`/`run.sh`/`run_tasks.sh` ya definen `NODE_OPTIONS` y `NODE_COMPILE_CACHE` (caché de bytecode V8 en `/tmp/ali-coins-compile-cache-$UID`) automáticamente — las líneas anteriores son útiles al llamar a `node` directamente.

4. **Reducir el coste criptográfico de `scrypt`:**
   En `credentials.env`, define:

   ```env
   SCRYPT_N=32768
   ```

   Esto reduce el pico instantáneo de memoria de la derivación de clave de ~134 MB a solo ~33 MB (o `16384` a ~16 MB), manteniendo el cifrado AES-256-GCM 100 % seguro.

5. **En contenedores Docker:**
   Si ejecutas mediante Docker, la imagen ya incluye `NODE_OPTIONS="--max-old-space-size=256"` y `NODE_COMPILE_CACHE=/tmp/node-compile-cache`. Al ejecutar el contenedor, añade los límites de cgroups:
   ```bash
   docker run --rm --init --pids-limit=256 \
     --shm-size=256m \
     --memory=768m --memory-swap=1536m \
     -v "$PWD/credentials.env:/app/credentials.env:ro" \
     -v "$PWD/session.json.enc:/app/session.json.enc" \
     ali-coins:latest
   ```
   Alternativa declarativa: el `docker-compose.yml` del repositorio ya incluye los mismos límites de shm, tmpfs, memoria y seguridad (`docker compose up`).

### E. Servidores en la nube (Oracle Cloud, AWS, VPS): desafío de captcha o bloqueo en el login

- **Causa:** AliExpress implementa un riguroso control anti-bot (Baxia). Cuando un intento de login (usuario y contraseña) parte de una IP de datacenter/nube (como Oracle Cloud, AWS o DigitalOcean), AliExpress casi siempre bloquea el envío mostrando un Slide Captcha de alta precisión o solicitando un código de confirmación 2FA por email/SMS.
- **Cómo resolverlo con exportación/importación cifrada (AES-256-GCM):**
  1. En tu computadora local (donde la IP residencial no está bloqueada):
     ```bash
     export SESSION_SECRET="tu_clave_ultra_secreta_con_mas_de_32_caracteres"
     node export_session.js
     ```
  2. En el servidor en la nube (Oracle Cloud / VPS), dentro de la carpeta `ali-coins`, importa de forma segura:
     ```bash
     export SESSION_SECRET="tu_clave_ultra_secreta_con_mas_de_32_caracteres"
     node import_session.js < session_token.txt
     ```
  3. ¡Listo! Los archivos `session.json` y `session_meta.json` se guardarán con permisos restringidos `0o600` y `./run_all.sh` se ejecutará a diario en la nube sin necesidad de volver a hacer login durante semanas o meses.

### F. Directorio de caché de los navegadores (`PLAYWRIGHT_BROWSERS_PATH`)

- Por defecto, Playwright instala los binarios de Chromium en `~/.cache/ms-playwright`.
- En entornos de servidor o contenedores con múltiples usuarios / volúmenes dedicados, puedes personalizar la ubicación definiendo:
  ```bash
  export PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers
  npx playwright install chromium
  ```
  Esto permite reutilizar la descarga del navegador entre distintas instancias o contenedores sin volver a descargarlo.

### G. Ubuntu 23.10 y Ubuntu 24.04 LTS: bloqueo de la sandbox de Chromium mediante AppArmor (user namespaces restringidos)

#### Qué es y por qué ocurre

A partir de **Ubuntu 23.10** y consolidado como política de seguridad predeterminada en **Ubuntu 24.04 LTS (Noble Numbat)**, el kernel de Ubuntu bloquea por defecto la creación de _unprivileged user namespaces_ (`CLONE_NEWUSER`) para aplicaciones que no tengan un perfil explícito de AppArmor (`kernel.apparmor_restrict_unprivileged_userns = 1`).

El navegador Chromium (utilizado por Playwright) requiere la capacidad de crear user namespaces para inicializar su mecanismo de aislamiento de procesos (_sandbox de seguridad en capas_ / Layer-1 Sandbox).

Como Playwright descarga el binario de Chromium en el directorio personal del usuario (`~/.cache/ms-playwright/chromium-.../chrome-linux/chrome`) en lugar de instalarlo como un paquete `.deb` registrado en el sistema, el kernel intercepta y deniega la llamada al sistema con un error `EPERM` (`apparmor="DENIED" operation="userns_create"`).

**Síntomas y mensajes de error típicos:**

```text
[FATAL:zygote_host_impl_linux.cc(117)] No usable sandbox! Update your kernel or see https://chromium.googlesource.com/chromium/src/+/main/docs/linux/sandboxing.md for more information.
```

o

```text
browserType.launch: Failed to launch the browser process!
```

---

#### Soluciones disponibles

Existen **3 soluciones** posibles. Elige la que mejor se adapte a tu entorno:

---

#### Solución 1: Crear un perfil AppArmor para Playwright (recomendada / mantiene la seguridad activa)

Esta es la solución recomendada por Canonical y el equipo de Playwright, ya que **mantiene activa la protección del sistema** y autoriza específicamente a los binarios de Chromium gestionados por Playwright a utilizar user namespaces.

1. Crea el archivo de perfil `/etc/apparmor.d/playwright-chrome`:

   ```bash
   sudo tee /etc/apparmor.d/playwright-chrome << 'EOF'
   # Perfil AppArmor para el Chromium de Playwright (Ubuntu 23.10 / 24.04 LTS)
   abi <abi/4.0>,
   include <tunables/global>

   profile playwright-chrome /**/.cache/ms-playwright/**/chrome flags=(unconfined) {
     userns,

     include if exists <local/playwright-chrome>
   }
   EOF
   ```

2. Carga el nuevo perfil en AppArmor:

   ```bash
   sudo apparmor_parser -r /etc/apparmor.d/playwright-chrome
   ```

   _(o alternativamente recarga el servicio: `sudo systemctl reload apparmor`)_

3. ¡Listo! Chromium ahora se iniciará normalmente con la sandbox completa activada, sin necesidad de `--no-sandbox`.

---

#### Solución 2: Desactivar la restricción de user namespaces del kernel mediante sysctl (ajuste global del host)

Si tu host remoto es un servidor dedicado o un VPS bajo tu control y prefieres restaurar el comportamiento predeterminado de versiones anteriores de Ubuntu (22.04 LTS, Debian 11/12, etc.):

- **Temporal (inmediato, dura hasta el próximo reinicio):**

  ```bash
  sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
  ```

- **Permanente (persiste tras reiniciar el servidor):**
  ```bash
  echo "kernel.apparmor_restrict_unprivileged_userns = 0" | sudo tee /etc/sysctl.d/60-apparmor-namespace.conf
  sudo sysctl --system
  ```

---

#### Solución 3: Desactivar la sandbox de Chromium en la aplicación (`NO_SANDBOX=true`)

Si estás en un entorno donde **no tienes privilegios `sudo`** para modificar `/etc/apparmor.d` o parámetros del kernel mediante `sysctl` (por ejemplo, hosting compartido, contenedores restringidos o instancias corporativas gestionadas):

1. Añade la variable a tu `credentials.env`:
   ```env
   NO_SANDBOX=true
   ```
   O ejecútalo directamente en la terminal / crontab:
   ```bash
   NO_SANDBOX=true ./run_all.sh
   ```

> [!WARNING]
> **Aviso de seguridad:** la opción `NO_SANDBOX=true` indica a Playwright que pase las flags `--no-sandbox` y `--disable-setuid-sandbox` a Chromium, desactivando la sandbox de aislamiento de procesos del navegador. Como este proyecto accede estrictamente a las páginas oficiales de AliExpress para la recogida de monedas y tareas diarias, el riesgo práctico es mínimo en servidores dedicados. Sin embargo, en entornos multiusuario se recomienda priorizar la **Solución 1**.
