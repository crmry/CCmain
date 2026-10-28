@echo off
title Setup Auto-Start for Citizen Charter Server
cd /d "%~dp0"

echo ================================================================
echo   Configure Auto-Start (Runs automatically in background)
echo   Corazon Locsin Montelibano Memorial Regional Hospital (CLMMRH)
echo ================================================================
echo.

set "VBS_PATH=%~dp0run-hidden.vbs"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT=%STARTUP_FOLDER%\CitizenCharterServer.lnk"

echo [1/2] Creating Windows Startup shortcut...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = 'wscript.exe'; $s.Arguments = '\"%VBS_PATH%\"'; $s.WorkingDirectory = '%~dp0'; $s.Save()" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Auto-start shortcut placed in Startup folder:
    echo      %SHORTCUT%
) else (
    echo [WARNING] Could not create startup shortcut.
)

echo.
echo [2/2] Registering Task Scheduler task (CitizenCharterServer)...
schtasks /create /tn "CitizenCharterServer" /tr "wscript.exe \"%VBS_PATH%\"" /sc onlogon /f >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Task Scheduler task created successfully!
) else (
    echo [INFO] Standard user task configured via Startup folder.
)

echo.
echo ================================================================
echo Setup Complete! The server will now automatically start whenever
echo this computer starts or a user logs in.
echo ================================================================
echo.
pause
