# SpotMap Frontend Tests - Setup & Execution
# Script PowerShell para instalar dependencias y ejecutar tests Jest

param(
    [switch]$Install,
    [switch]$Coverage,
    [switch]$Watch,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   SpotMap - Frontend Tests (Jest)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio frontend
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (-not (Test-Path $frontendPath)) {
    Write-Host "[ERROR] No se encuentra el directorio frontend" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath
Write-Host "[INFO] Directorio: $frontendPath" -ForegroundColor Yellow

# Verificar Node.js
Write-Host "[CHECK] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js no encontrado. Instalar desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Instalar dependencias si se especifica -Install o no existe node_modules
if ($Install -or -not (Test-Path "node_modules")) {
    Write-Host "[INSTALL] Instalando dependencias con npm..." -ForegroundColor Cyan
    Write-Host ""
    
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Fallo la instalación de dependencias" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "[OK] Dependencias instaladas correctamente" -ForegroundColor Green
    Write-Host ""
}

# Verificar que Jest está instalado
if (-not (Test-Path "node_modules/jest")) {
    Write-Host "[ERROR] Jest no está instalado. Ejecuta con -Install" -ForegroundColor Red
    exit 1
}

# Ejecutar tests con diferentes modos
Write-Host "[RUN] Ejecutando tests..." -ForegroundColor Cyan
Write-Host ""

if ($Coverage) {
    Write-Host "[MODE] Coverage report" -ForegroundColor Yellow
    npm run test:coverage
} elseif ($Watch) {
    Write-Host "[MODE] Watch mode (Ctrl+C para salir)" -ForegroundColor Yellow
    npm run test:watch
} elseif ($Verbose) {
    Write-Host "[MODE] Verbose output" -ForegroundColor Yellow
    npm run test:verbose
} else {
    Write-Host "[MODE] Standard run" -ForegroundColor Yellow
    npm test
}

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "   ✓ TESTS FRONTEND COMPLETADOS" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
} else {
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "   ✗ TESTS FRONTEND FALLARON" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
}

Write-Host ""
Write-Host "Comandos disponibles:" -ForegroundColor Cyan
Write-Host "  .\run-frontend-tests.ps1 -Install    # Instalar dependencias" -ForegroundColor Gray
Write-Host "  .\run-frontend-tests.ps1             # Ejecutar tests" -ForegroundColor Gray
Write-Host "  .\run-frontend-tests.ps1 -Coverage   # Con reporte de coverage" -ForegroundColor Gray
Write-Host "  .\run-frontend-tests.ps1 -Watch      # Modo watch (auto-rerun)" -ForegroundColor Gray
Write-Host "  .\run-frontend-tests.ps1 -Verbose    # Output detallado" -ForegroundColor Gray
Write-Host ""

exit $exitCode
