@echo off
title Open Windows Firewall Port 6767 for Citizen Charter
cd /d "%~dp0"

echo ================================================================
echo   Citizen Charter Builder - Firewall Configuration
echo   Allows LAN access on dedicated Port 6767
echo ================================================================
echo.

net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [NOTE] Administrator permissions required to modify Firewall rules.
    echo Right-click this file and select "Run as administrator".
    echo.
    pause
    exit /b 1
)

echo Adding incoming firewall rule for TCP Port 6767...
netsh advfirewall firewall delete rule name="Citizen Charter Builder (Port 6767)" >nul 2>&1
netsh advfirewall firewall add rule name="Citizen Charter Builder (Port 6767)" dir=in action=allow protocol=TCP localport=6767 >nul

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Windows Defender Firewall rule added successfully!
    echo Other computers on the network can now access:
    echo   http://172.16.x.x:6767/CCmain/main.html
) else (
    echo [ERROR] Failed to add firewall rule. Please check Windows permissions.
)

echo.
pause
