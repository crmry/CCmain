# cleanup-processes.ps1
# Reliably closes any running instance of Citizen Charter Builder (Node.js/Python/WScript)
# and frees dedicated ports 6767, 8899, 6768 without affecting XAMPP or other system services.

$ErrorActionPreference = 'SilentlyContinue'

$targetPorts = @(6767, 8899, 6768)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
$scriptDirEscaped = [regex]::Escape($scriptDir)

$killedCount = 0
$pidsToKill = [System.Collections.Generic.HashSet[int]]::new()

# 1. Collect PIDs listening on Citizen Charter dedicated ports
foreach ($port in $targetPorts) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $conns) {
            if ($conn.OwningProcess -and $conn.OwningProcess -gt 4) {
                [void]$pidsToKill.Add([int]$conn.OwningProcess)
            }
        }
    } catch {
        # Fallback if Get-NetTCPConnection is unavailable on older Windows
    }
}

# 2. Collect PIDs by Process ExecutablePath or CommandLine matching this folder or server script
try {
    $processes = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue
    foreach ($proc in $processes) {
        $name = [string]$proc.Name
        $execPath = [string]$proc.ExecutablePath
        $cmdLine = [string]$proc.CommandLine
        $pid = [int]$proc.ProcessId

        if ($pid -le 4) { continue }

        # Match bundled node.exe in this application's bin folder
        if ($execPath -like "$scriptDir\bin\node.exe" -or $execPath -like "*\CCmain\bin\node.exe") {
            [void]$pidsToKill.Add($pid)
            continue
        }

        # Match node, python, or wscript running this application's scripts
        if ($name -in @('node.exe', 'python.exe', 'pythonw.exe', 'wscript.exe')) {
            if ($cmdLine -match 'server\.js' -or $cmdLine -match 'server\.py' -or $cmdLine -match 'run-hidden\.vbs' -or $cmdLine -match $scriptDirEscaped) {
                [void]$pidsToKill.Add($pid)
            }
        }
    }
} catch {
    # Silently continue to fallback
}

# 3. Terminate identified processes
foreach ($targetPid in $pidsToKill) {
    try {
        $p = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
        if ($p) {
            $pName = $p.ProcessName
            Stop-Process -Id $targetPid -Force -ErrorAction SilentlyContinue
            Write-Host "  [STOPPED] Terminated existing process: $pName (PID $targetPid)"
            $killedCount++
        }
    } catch {
        # Ignore errors if process already exited
    }
}

if ($killedCount -eq 0) {
    Write-Host "  [CLEAN] No existing Citizen Charter processes found."
} else {
    Write-Host "  [CLEAN] Successfully cleared $killedCount previous process(es)."
    # Brief pause to ensure OS socket release
    Start-Sleep -Milliseconds 600
}
