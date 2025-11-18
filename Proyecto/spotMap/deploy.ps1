<#
  deploy.ps1 - Script de despliegue automatizado para SpotMap
  Uso:
    powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -Environment dev
    .\deploy.ps1 -Environment production
    .\deploy.ps1 -Rollback
#>

[CmdletBinding()]
param(
  [Parameter()][ValidateSet('dev','staging','production')][string]$Environment = 'dev',
  [Parameter()][switch]$SkipChecks,
  [Parameter()][switch]$Rollback
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info    { param([string]$Msg) Write-Host $Msg -ForegroundColor Cyan }
function Write-Success { param([string]$Msg) Write-Host $Msg -ForegroundColor Green }
function Write-Warn    { param([string]$Msg) Write-Host $Msg -ForegroundColor Yellow }
function Write-Fail    { param([string]$Msg) Write-Host $Msg -ForegroundColor Red }

Write-Info    "=== SpotMap Deployment Script ==="
Write-Info    "Environment: $Environment"
Write-Info    "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host    ""

if ($Rollback) {
  Write-Warn "Iniciando rollback..."
  if (Test-Path '.deployment-backup') {
    docker-compose down 2>$null | Out-Null
    if (Test-Path 'backend/vendor') { Remove-Item -Recurse -Force 'backend/vendor' }
    Copy-Item -Recurse '.deployment-backup/*' . -Force 2>$null | Out-Null
    Write-Success "Rollback completado"
  } else {
    Write-Fail "No hay backup disponible (.deployment-backup)"
    exit 1
  }
  exit 0
}

if (-not $SkipChecks) {
  Write-Info "Pre-flight checks..."
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Write-Fail 'Docker no encontrado'; exit 1 }
  if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) { Write-Fail 'Docker Compose no encontrado'; exit 1 }
  if (-not (Test-Path 'backend/.env')) { Write-Fail 'backend/.env no existe'; exit 1 }
  if (-not (Test-Path 'frontend/js/supabaseConfig.js')) { Write-Fail 'frontend/js/supabaseConfig.js no existe'; exit 1 }
  Write-Success '✓ Checks OK'
  Write-Host ''
}

Write-Info 'Creando backup sencillo...'
if (Test-Path '.deployment-backup') { Remove-Item -Recurse -Force '.deployment-backup' }
New-Item -ItemType Directory '.deployment-backup' | Out-Null
Copy-Item 'backend/.env' '.deployment-backup/' -ErrorAction SilentlyContinue
Copy-Item 'frontend/js/supabaseConfig.js' '.deployment-backup/' -ErrorAction SilentlyContinue
Write-Success '✓ Backup listo'
Write-Host ''

Write-Info 'Construyendo imagen...'
if ($Environment -eq 'production') { docker-compose --profile production build } else { docker-compose build }
if ($LASTEXITCODE -ne 0) { Write-Fail 'Error en build'; exit 1 }
Write-Success '✓ Build OK'
Write-Host ''

Write-Info 'Deteniendo contenedores previos...'
docker-compose down 2>$null | Out-Null
Write-Success '✓ Detenidos'
Write-Host ''

Write-Info 'Arrancando contenedores...'
if ($Environment -eq 'production') { docker-compose --profile production up -d } else { docker-compose up -d spotmap-web }
if ($LASTEXITCODE -ne 0) { Write-Fail 'Fallo al iniciar contenedores'; exit 1 }
Write-Success '✓ Contenedores arriba'
Write-Host ''

Write-Info 'Health check (api.php?health)...'
${healthy} = $false
for ($i=1; $i -le 30; $i++) {
  try {
    $r = Invoke-WebRequest -Uri 'http://localhost:8080/backend/public/api.php?health' -TimeoutSec 5 -Method GET
    if ($r.StatusCode -eq 200) { $healthy = $true; break }
  } catch { }
  Start-Sleep -Seconds 2
}

if (-not $healthy) {
  Write-Fail 'Health check falló tras 60s'
  Write-Warn 'Ver logs: docker-compose logs -f'
  exit 1
}
Write-Success '✓ Service healthy'
Write-Host ''

Write-Success '=== Deployment Complete ==='
Write-Info    'URL:   http://localhost:8080'
Write-Info    'Health: http://localhost:8080/backend/public/api.php?health'
Write-Host    ''
Write-Info    'Comandos útiles:'
Write-Info    '  Logs:     docker-compose logs -f'
Write-Info    '  Estado:   docker-compose ps'
Write-Info    '  Detener:  docker-compose down'
Write-Info    '  Rollback: .\deploy.ps1 -Rollback'
Write-Host ''
