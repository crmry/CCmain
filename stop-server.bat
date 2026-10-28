@echo off
title Stop Citizen Charter Builder Web Server
cd /d "%~dp0"

echo ================================================================
echo   Stopping Citizen Charter Server...
echo ================================================================
echo.

REM 1. Primary: Use comprehensive PowerShell cleanup (targets ports, bundled node, and scripts)
where powershell >nul 2>nul
if %ERRORLEVEL% equ 0 (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0cleanup-processes.ps1"
)

REM 2. Secondary fallback: Pure Windows CMD / taskkill (works on all Windows versions)
for %%p in (6767 8899 6768) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p 2^>nul') do (
        if not "%%a"=="0" (
            echo   [CMD FALLBACK] Closing residual process PID: %%a on Port %%p...
            taskkill /F /T /PID %%a >nul 2>nul
        )
    )
)

echo.
echo Server stop sequence completed. Dedicated ports are free.
if not "%~1"=="--nopause" pause
