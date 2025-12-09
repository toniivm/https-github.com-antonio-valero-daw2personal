@echo off
REM SpotMap - Docker Configuration Validation Test
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   SpotMap - Docker Configuration Validation Test
echo ============================================================
echo.

set /a passed=0
set /a total=8

REM Test 1: Docker installation
echo [1/8] Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker is installed
    set /a passed+=1
) else (
    echo [ERROR] Docker not found
)

REM Test 2: Docker Compose
echo [2/8] Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker Compose is installed
    set /a passed+=1
) else (
    echo [ERROR] Docker Compose not found
)

REM Test 3: docker-compose.yml
echo [3/8] Checking docker-compose.yml...
if exist docker-compose.yml (
    echo [OK] docker-compose.yml exists
    set /a passed+=1
) else (
    echo [ERROR] docker-compose.yml not found
)

REM Test 4: Dockerfile
echo [4/8] Checking Dockerfile...
if exist Dockerfile (
    echo [OK] Dockerfile exists
    set /a passed+=1
) else (
    echo [ERROR] Dockerfile not found
)

REM Test 5: .env.docker
echo [5/8] Checking .env.docker...
if exist .env.docker (
    echo [OK] .env.docker exists
    set /a passed+=1
) else (
    echo [ERROR] .env.docker not found
)

REM Test 6: Docker directory
echo [6/8] Checking docker/ directory...
if exist docker\nginx.conf (
    echo [OK] docker configuration files exist
    set /a passed+=1
) else (
    echo [ERROR] docker configuration files not found
)

REM Test 7: Automation scripts
echo [7/8] Checking automation scripts...
if exist docker-setup.sh (
    echo [OK] docker-setup.sh exists
    set /a passed+=1
) else (
    echo [ERROR] docker-setup.sh not found
)

REM Test 8: Documentation
echo [8/8] Checking DOCKER.md...
if exist DOCKER.md (
    echo [OK] DOCKER.md exists
    set /a passed+=1
) else (
    echo [WARNING] DOCKER.md not found
)

echo.
echo ============================================================
echo   TEST RESULTS: %passed%/%total% passed
echo ============================================================
echo.

if %passed% geq 7 (
    echo [SUCCESS] Docker configuration is valid!
    echo.
    echo Next steps:
    echo   1. Start Docker Desktop
    echo   2. Run: ./docker-setup.sh
    echo   3. Access: http://localhost:8080
    echo.
    exit /b 0
) else (
    echo [FAILED] Some tests failed. Please review the errors above.
    exit /b 1
)
