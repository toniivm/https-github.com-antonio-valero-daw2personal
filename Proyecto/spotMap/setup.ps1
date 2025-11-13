# spotMap - Quick Setup Script (Windows PowerShell)
# Uso: powershell -ExecutionPolicy Bypass -File .\setup.ps1

param(
    [ValidateSet('local', 'planetscale')]
    [string]$Mode = 'local'
)

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      spotMap - Quick Setup Script (Windows)               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendPath = Join-Path $scriptPath 'backend'
$envFile = Join-Path $backendPath '.env'
$envExample = Join-Path $backendPath '.env.example'

# ===== Step 1: Verificar requisitos =====
Write-Host "[1] Verificando requisitos..." -ForegroundColor Yellow
$phpExe = 'php'
try {
    $phpVersion = & $phpExe -v 2>&1 | Select-Object -First 1
    Write-Host "  ✓ PHP encontrado: $phpVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ PHP no encontrado. Asegúrate de que PHP está en el PATH." -ForegroundColor Red
    exit 1
}

# ===== Step 2: Crear .env si no existe =====
Write-Host "`n[2] Configurando archivo .env..." -ForegroundColor Yellow
if (Test-Path $envFile) {
    Write-Host "  ✓ $envFile ya existe" -ForegroundColor Green
} else {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "  ✓ Creado $envFile desde .env.example" -ForegroundColor Green
        
        if ($Mode -eq 'planetscale') {
            Write-Host "`n  ⚠ Modo PlanetScale seleccionado" -ForegroundColor Yellow
            Write-Host "    Edita el archivo $envFile con tus credenciales de PlanetScale:" -ForegroundColor Cyan
            Write-Host "    DB_HOST=<tu-host>.connect.psdb.cloud" -ForegroundColor Gray
            Write-Host "    DB_USERNAME=<tu-usuario>" -ForegroundColor Gray
            Write-Host "    DB_PASSWORD=<tu-contraseña>" -ForegroundColor Gray
            Write-Host "`n    Luego continúa con 'php backend/migrate.php up'" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  ✗ No se encontró .env.example" -ForegroundColor Red
        exit 1
    }
}

# ===== Step 3: Ejecutar verificación =====
Write-Host "`n[3] Ejecutando verificación de instalación..." -ForegroundColor Yellow
& $phpExe (Join-Path $backendPath 'check.php')

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n✗ Verificación falló. Revisa los errores arriba." -ForegroundColor Red
    exit 1
}

# ===== Step 4: Ejecutar migraciones =====
Write-Host "`n[4] Ejecutando migraciones..." -ForegroundColor Yellow
$response = Read-Host "¿Ejecutar migraciones? (s/n)"
if ($response -eq 's' -or $response -eq 'S' -or $response -eq 'yes') {
    & $phpExe (Join-Path $backendPath 'migrate.php') up
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n  ✓ Migraciones completadas" -ForegroundColor Green
    } else {
        Write-Host "`n  ✗ Error en migraciones" -ForegroundColor Red
    }
}

# ===== Final Info =====
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓  INSTALACIÓN COMPLETADA                               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Abre el navegador en:" -ForegroundColor White
Write-Host "     http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html" -ForegroundColor Gray
Write-Host "`n  2. Prueba el endpoint de estado:" -ForegroundColor White
Write-Host "     http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/index.php/api/status" -ForegroundColor Gray

Write-Host "`nPara más información:" -ForegroundColor Cyan
Write-Host "  - backend/SETUP.md" -ForegroundColor Gray
Write-Host "  - README.md" -ForegroundColor Gray
Write-Host "`n"
