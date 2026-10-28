@echo off
title Create Citizen Charter Desktop Shortcut
cd /d "%~dp0"

echo ================================================================
echo   Creating Citizen Charter Desktop Shortcut...
echo ================================================================
echo.

set "SHORTCUT_PATH=%USERPROFILE%\Desktop\Citizen Charter Builder.url"

echo [InternetShortcut] > "%SHORTCUT_PATH%"
echo URL=http://localhost:6767/CCmain/main.html >> "%SHORTCUT_PATH%"
echo IconIndex=13 >> "%SHORTCUT_PATH%"
echo IconFile=%SystemRoot%\system32\shell32.dll >> "%SHORTCUT_PATH%"

if exist "%SHORTCUT_PATH%" (
    echo [OK] Shortcut created successfully on your Desktop:
    echo      %SHORTCUT_PATH%
    echo.
    echo Double-clicking that icon will immediately open:
    echo http://localhost:6767/CCmain/main.html
) else (
    echo [ERROR] Could not create desktop shortcut.
)

echo.
pause
