param(
    [switch]$SkipE2E,
    [switch]$SkipFrontendVue,
    [switch]$SkipBackend
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Run-Step {
    param(
        [string]$Name,
        [scriptblock]$Action
    )

    Write-Host "`n==> $Name" -ForegroundColor Cyan
    & $Action
    if ($LASTEXITCODE -ne 0) {
        throw "Step failed: $Name (exit code $LASTEXITCODE)"
    }
    Write-Host "OK: $Name" -ForegroundColor Green
}

function Resolve-PhpExecutable {
    $cmd = Get-Command php -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $candidates = @(
        'D:\Escritorio\xampp\php\php.exe',
        'C:\xampp\php\php.exe',
        'D:\xampp\php\php.exe',
        'C:\Program Files\xampp\php\php.exe'
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    return $null
}

if (-not $SkipE2E) {
    Run-Step -Name 'Frontend install deps' -Action {
        Set-Location "$root\frontend"
        npm install
    }

    Run-Step -Name 'Frontend smoke desktop' -Action {
        Set-Location "$root\frontend"
        npx playwright test e2e/smoke.spec.js --project=desktop-chromium --reporter=list --workers=1 --retries=1
    }

    Run-Step -Name 'Frontend smoke mobile' -Action {
        Set-Location "$root\frontend"
        npx playwright test e2e/smoke.spec.js --project=mobile-chromium --reporter=list --workers=1 --retries=1
    }
}

if (-not $SkipFrontendVue) {
    Run-Step -Name 'Frontend Vue install deps' -Action {
        Set-Location "$root\frontend-vue"
        npm install
    }

    Run-Step -Name 'Frontend Vue lint' -Action {
        Set-Location "$root\frontend-vue"
        npm run lint
    }

    Run-Step -Name 'Frontend Vue tests' -Action {
        Set-Location "$root\frontend-vue"
        npm run test
    }

    Run-Step -Name 'Frontend Vue build' -Action {
        Set-Location "$root\frontend-vue"
        npm run build
    }
}

if (-not $SkipBackend) {
    $phpExe = Resolve-PhpExecutable
    if (-not $phpExe) {
        Write-Warning 'PHP executable not found (PATH/XAMPP). Skipping backend PHPUnit.'
    } else {
        Run-Step -Name "Backend phpunit ($phpExe)" -Action {
            Set-Location "$root\backend"
            if (-not (Test-Path 'vendor\bin\phpunit')) {
                throw 'vendor/bin/phpunit not found. Run composer install in backend/ first.'
            }
            & $phpExe -d extension=sqlite3 vendor/bin/phpunit
        }
    }
}

Set-Location $root
Write-Host "`nQuality gate completed." -ForegroundColor Green
