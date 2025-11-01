param(
    [switch]$Execute,
    [string[]]$AdditionalDirs = @()
)

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptRoot/.. | Out-Null

$defaultTargets = @(
    '.next',
    'dist',
    'out',
    'coverage',
    'tmp',
    'temp',
    'apps/admin-portal/.next',
    'apps/farmer-portal/.next',
    'apps/certificate-portal/.next',
    'apps/frontend/.next',
    'apps/backend/build'
)

$targets = $defaultTargets + $AdditionalDirs | Where-Object { $_ -and $_.Trim() -ne '' } | Select-Object -Unique

if (-not $Execute) {
    Write-Host 'Dry run only. Use -Execute to remove directories.' -ForegroundColor Yellow
    Write-Host ''
}

foreach ($target in $targets) {
    $fullPath = Join-Path -Path (Get-Location) -ChildPath $target

    if (-not (Test-Path $fullPath)) {
        Write-Host "[skip] $target (not found)" -ForegroundColor DarkGray
        continue
    }

    if (-not $Execute) {
        Write-Host "[plan] would remove $target" -ForegroundColor Cyan
        continue
    }

    try {
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
        Write-Host "[done] removed $target" -ForegroundColor Green
    }
    catch {
        Write-Host "[fail] $target -> $_" -ForegroundColor Red
    }
}

if (-not $Execute) {
    Write-Host ''
    Write-Host 'Nothing was deleted. Re-run with -Execute after reviewing the plan.' -ForegroundColor Yellow
}
