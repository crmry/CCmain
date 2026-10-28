@echo off
title Citizen Charter Builder Web Server
cd /d "%~dp0"

REM Dedicated Port: 6767 (ASCII 'CC' for Citizen Charter) - Immune to XAMPP, Apache, Node, Vite, Tomcat conflicts
REM To override the port, uncomment and change the line below:
REM set PORT=6767

echo ================================================================
echo   Citizen Charter Builder Server (Standalone - No XAMPP)
echo   Corazon Locsin Montelibano Memorial Regional Hospital (CLMMRH)
echo ================================================================
echo.

REM 0. Automatically close any previous running instance of this server
echo Checking for existing or background Citizen Charter processes...
call "%~dp0stop-server.bat" --nopause
timeout /t 1 /nobreak >nul 2>nul
echo.

REM 1. Prioritize bundled patched Node.js LTS in bin\node.exe if compatible
if exist "%~dp0bin\node.exe" (
    "%~dp0bin\node.exe" -v >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo Starting server with bundled Node.js LTS on Port 6767...
        echo (Port 80 is left 100%% free for XAMPP / Apache)
        "%~dp0bin\node.exe" "%~dp0server.js"
        goto done
    ) else (
        echo [INFO] Bundled Node.js is not compatible with this Windows architecture. Checking system runtimes...
    )
)

REM 2. Check if Node.js is available on system PATH
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting server with system Node.js on Port 6767...
    node "%~dp0server.js"
    goto done
)

REM 3. Check if Node.js in Antigravity IDE scratch exists
if exist "%USERPROFILE%\.gemini\antigravity-ide\scratch\nodejs\node.exe" (
    echo Starting server with IDE Node.js on Port 6767...
    "%USERPROFILE%\.gemini\antigravity-ide\scratch\nodejs\node.exe" "%~dp0server.js"
    goto done
)

REM 4. Fallback to Python if Node.js is not present
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting server with Python on Port 6767...
    python "%~dp0server.py"
    goto done
)

echo [ERROR] Neither Node.js nor Python was found on this system!
echo Please install Node.js or Python to run this server without XAMPP.
pause

:done
pause
