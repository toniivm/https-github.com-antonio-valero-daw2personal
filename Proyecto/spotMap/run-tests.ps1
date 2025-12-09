# Script para instalar Composer y ejecutar tests
Write-Host ""
Write-Host "SETUP DE TESTS - SpotMap" -ForegroundColor Cyan
Write-Host ""

$phpPath = "C:\xampp\php\php.exe"
$composerUrl = "https://getcomposer.org/download/latest-stable/composer.phar"
$backendPath = "c:\xampp\htdocs\https-github.com-antonio-valero-daw2personal\Proyecto\spotMap\backend"

# 1. Verificar PHP
Write-Host "1. Verificando PHP..." -ForegroundColor Yellow
if (Test-Path $phpPath) {
    Write-Host "   PHP encontrado" -ForegroundColor Green
    & $phpPath --version | Select-String "PHP"
} else {
    Write-Host "   PHP no encontrado" -ForegroundColor Red
    exit 1
}

# 2. Descargar Composer si no existe
Write-Host ""
Write-Host "2. Instalando Composer..." -ForegroundColor Yellow
$composerPhar = Join-Path $backendPath "composer.phar"

if (-not (Test-Path $composerPhar)) {
    Write-Host "   Descargando composer.phar..."
    Invoke-WebRequest -Uri $composerUrl -OutFile $composerPhar
    Write-Host "   Composer descargado" -ForegroundColor Green
} else {
    Write-Host "   Composer ya existe" -ForegroundColor Green
}

# 3. Instalar dependencias
Write-Host ""
Write-Host "3. Instalando dependencias (PHPUnit)..." -ForegroundColor Yellow
Push-Location $backendPath
& $phpPath $composerPhar install --no-interaction
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "   Error instalando dependencias" -ForegroundColor Red
}
Pop-Location

# 4. Ejecutar tests
Write-Host ""
Write-Host "4. Ejecutando tests..." -ForegroundColor Yellow
Write-Host ""
Push-Location $backendPath
& $phpPath "vendor/phpunit/phpunit/phpunit" --testdox --colors=always
$exitCode = $LASTEXITCODE
Pop-Location

# Resumen
Write-Host ""
Write-Host "============================================================"
if ($exitCode -eq 0) {
    Write-Host "TODOS LOS TESTS PASARON" -ForegroundColor Green
} else {
    Write-Host "ALGUNOS TESTS FALLARON" -ForegroundColor Yellow
}
Write-Host "============================================================"
Write-Host ""
Write-Host "Para ejecutar tests nuevamente:"
Write-Host "   cd backend"
Write-Host "   php vendor/phpunit/phpunit/phpunit --testdox"
Write-Host ""
