# Helper de idioma para scripts .ps1 (PT-BR padrao, EN opcional).
#
# Uso:
#   $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
#   . (Join-Path $ScriptDir "libs/i18n/scripts.ps1")
#   Initialize-AliLanguage -Root $ScriptDir -Arguments $args
#   Write-AliMsg "Texto em portugues" "Text in English"
#   Write-AliMsg "Texto" "Text" -ForegroundColor Cyan
#   Write-AliError "Erro" "Error"

$script:AliLang = 'pt'

function Initialize-AliLanguage {
    param(
        [string]$Root = (Get-Location).Path,
        [string[]]$Arguments = @()
    )
    $lang = $env:APP_LANGUAGE
    if (-not $lang) { $lang = $env:BOT_LANGUAGE }

    for ($i = 0; $i -lt $Arguments.Count; $i++) {
        if ($Arguments[$i] -match '^--lang=(.+)$') {
            $lang = $Matches[1]
        } elseif ($Arguments[$i] -eq '--lang' -and ($i + 1) -lt $Arguments.Count) {
            $lang = $Arguments[$i + 1]
        }
    }

    $envFile = Join-Path $Root 'credentials.env'
    if (-not $lang -and (Test-Path -LiteralPath $envFile)) {
        foreach ($line in Get-Content -LiteralPath $envFile -ErrorAction SilentlyContinue) {
            if ($line -match '^\s*APP_LANGUAGE\s*=\s*(.+?)\s*$') {
                $lang = $Matches[1].Trim('"').Trim("'")
            }
        }
    }

    if ($lang -match '^(?i:en)(-|$)|english|inglês|ingles') {
        $script:AliLang = 'en'
    } else {
        $script:AliLang = 'pt'
    }
    # Filhos (Node) também podem consultar ALI_LANG.
    $env:ALI_LANG = $script:AliLang
}

function Get-AliMsg {
    param([string]$Pt, [string]$En)
    if ($script:AliLang -eq 'en') { return $En }
    return $Pt
}

function Write-AliMsg {
    param(
        [string]$Pt,
        [string]$En,
        [string]$ForegroundColor = ''
    )
    $message = Get-AliMsg -Pt $Pt -En $En
    if ($ForegroundColor) {
        Write-Host $message -ForegroundColor $ForegroundColor
    } else {
        Write-Host $message
    }
}

function Write-AliError {
    param([string]$Pt, [string]$En)
    Write-Error (Get-AliMsg -Pt $Pt -En $En)
}
