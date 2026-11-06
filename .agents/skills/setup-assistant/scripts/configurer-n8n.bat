@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0configure-connector.ps1" -Connector N8n
set "EXIT_CODE=%ERRORLEVEL%"
pause
exit /b %EXIT_CODE%
