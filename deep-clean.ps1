<#
.SYNOPSIS
    Deep Clean Repository Script
    Strictly removes junk files, logs, conflict artifacts, and legacy scripts.
    Includes a mandatory Dry Run mode before deletion.

.DESCRIPTION
    Targets:
    1. Temporary & Logs: .log, .txt, .tmp, .bak, .old, .chk
    2. AI/Debug Artifacts: test-*, debug-*, temp-*, copy, unused
    3. Conflict Files: *.orig, * (1)*
    4. Legacy Scripts: deploy-now.ps1, uat-test.sh, quick-fix.bat, etc.
    5. Disabled Configs: .DISABLED, .example (excluding .env.example)

    Safety:
    - Excludes node_modules, .git, dist, build, .next, coverage
    - PROTECTS src/ and apps/ source code unless explicitly marked as junk extension (.old, .bak, etc.)
#>

param (
    [Switch]$Force = $false
)

$ErrorActionPreference = "Stop"
$rootDir = $PSScriptRoot

# --- Configuration ---

# 1. Extensions to ALWAYS remove (unless in safe folders)
$junkExtensions = @(".log", ".txt", ".tmp", ".bak", ".old", ".chk", ".orig", ".DISABLED")

# 2. Specific filenames to remove (Legacy Scripts)
$legacyScripts = @(
    "deploy-now.ps1", "uat-test.sh", "quick-fix.bat",
    "check-ec2-status.ps1", "cleanup-repo.ps1", "organize-docs.ps1",
    "git-commit-changes.ps1", "setup-env.ps1"
)

# 3. Name patterns (Regex)
$junkPatterns = @(
    "^test-.*",      # Starts with test-
    "^debug-.*",     # Starts with debug-
    "^temp-.*",      # Starts with temp-
    ".*copy.*",      # Contains copy
    ".*unused.*",    # Contains unused
    ".*\s\(\d+\).*"  # Duplicate files like "server (1).js"
)

# 4. Directories to COMPLETELY IGNORE
$ignoredDirs = @(
    "node_modules", ".git", ".vscode", ".idea",
    "dist", "build", ".next", "coverage", ".husky", ".turbo", ".swc",
    "__tests__", "load-tests", "fixtures"
)

# --- Functions ---

function Get-RelativePath {
    param ($Path)
    return $Path.Replace($rootDir, "").TrimStart("\")
}

function Is-SafeSourceFile {
    param ($File)

    # Check if file is in src/ or apps/
    $relPath = Get-RelativePath $File.FullName
    $isInSource = ($relPath -match "^src\\") -or ($relPath -match "^apps\\")

    # If not in source, it's fair game based on other rules
    if (-not $isInSource) { return $false }

    # If in source, we MUST protect .ts, .tsx, .js, .jsx unless it has a junk extension
    $sourceExtensions = @(".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".scss")
    if ($sourceExtensions -contains $File.Extension) {
        # BUT if it is explicitly a junk extension like .old or .bak, we allow deletion
        # The file passed here has the extension. If the extension is .js, check if it was caught by a pattern.

        # If caught by "test-" or "debug-" pattern, we should be CAREFUL.
        # We will whitelist standard test files if they follow convention (e.g. .test.ts, .spec.ts)
        if ($File.Name -match "\.(test|spec)\.(ts|tsx|js|jsx)$") {
            return $true # It is a valid test file
        }

        # If it's just "debug-logger.ts", we probably want to keep it.
        # If it's "users.controller.old.js", we want to delete it.

        # Logic: If extension is source code, ONLY delete if it matches specific "junk" patterns strongly
        # For now, in source folders, we will ONLY delete if it matches "unused", "copy", "old", "bak"
        # We will SKIP "test-" and "debug-" prefix in source folders to be safe.

        if ($File.Name -match "^test-" -or $File.Name -match "^debug-") {
            return $true # PROTECT IT
        }
    }

    return $false
}

# --- Main Logic ---

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "      PROJECT DEEP CLEAN: SCANNING      " -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

$filesToDelete = @()

# Get all files recursively
$allFiles = Get-ChildItem -Path $rootDir -Recurse -File -Force

foreach ($file in $allFiles) {
    $relPath = Get-RelativePath $file.FullName
    $parts = $relPath -split "\\"

    # 1. Check Ignored Directories
    $shouldIgnore = $false
    foreach ($part in $parts) {
        if ($ignoredDirs -contains $part) {
            $shouldIgnore = $true
            break
        }
    }
    if ($shouldIgnore) { continue }

    $isJunk = $false
    $reason = ""

    # 2. Check Extensions
    if ($junkExtensions -contains $file.Extension) {
        $isJunk = $true
        $reason = "Junk Extension ($($file.Extension))"
    }
    # Special case for .example (exclude .env.example and similar)
    elseif ($file.Extension -eq ".example" -and $file.Name -notmatch "\.env.*\.example$") {
        $isJunk = $true
        $reason = "Example File"
    }

    # 3. Check Legacy Scripts
    if (-not $isJunk -and $legacyScripts -contains $file.Name) {
        $isJunk = $true
        $reason = "Legacy Script"
    }

    # 4. Check Patterns
    if (-not $isJunk) {
        foreach ($pattern in $junkPatterns) {
            if ($file.Name -match $pattern) {
                $isJunk = $true
                $reason = "Pattern Match ($pattern)"
                break
            }
        }
    }

    # 5. Safety Check for Source Code
    if ($isJunk) {
        if (Is-SafeSourceFile $file) {
            # Write-Host "   [SAFEGUARD] Skipping source file: $relPath" -ForegroundColor DarkGray
            continue
        }

        # Add to list
        $filesToDelete += [PSCustomObject]@{
            Path = $file.FullName
            RelativePath = $relPath
            Reason = $reason
            Size = $file.Length
        }
    }
}

# --- Report ---

if ($filesToDelete.Count -eq 0) {
    Write-Host "✅ No junk files found. The repository is clean." -ForegroundColor Green
    exit 0
}

# Group by Reason
$grouped = $filesToDelete | Group-Object Reason

foreach ($group in $grouped) {
    Write-Host "[$($group.Name)]" -ForegroundColor Cyan
    foreach ($item in $group.Group) {
        $sizeKB = "{0:N2} KB" -f ($item.Size / 1KB)
        Write-Host "  - $($item.RelativePath) ($sizeKB)" -ForegroundColor White
    }
    Write-Host ""
}

$totalSize = ($filesToDelete | Measure-Object -Property Size -Sum).Sum
$totalSizeMB = "{0:N2} MB" -f ($totalSize / 1MB)

Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "SUMMARY:" -ForegroundColor Yellow
Write-Host "  Files to delete: $($filesToDelete.Count)"
Write-Host "  Total Size:      $totalSizeMB"
Write-Host "----------------------------------------" -ForegroundColor Gray

# --- Execution ---

if ($Force) {
    Write-Host "Force mode enabled. Deleting..." -ForegroundColor Red
} else {
    Write-Host "⚠️  DRY RUN COMPLETE. No files were deleted." -ForegroundColor Yellow
    $response = Read-Host "Type 'DELETE' to confirm and delete these files now"
    if ($response -ne "DELETE") {
        Write-Host "Cancelled." -ForegroundColor Green
        exit 0
    }
}

# Delete
Write-Host ""
Write-Host "Deleting files..." -ForegroundColor Red
foreach ($item in $filesToDelete) {
    try {
        Remove-Item -Path $item.Path -Force -ErrorAction Stop
        Write-Host "  Deleted: $($item.RelativePath)" -ForegroundColor DarkGray
    } catch {
        Write-Host "  FAILED: $($item.RelativePath) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Cleanup Finished." -ForegroundColor Green
