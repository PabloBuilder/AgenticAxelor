@echo off
setlocal
set "CLI=%~dp0..\..\..\..\node_modules\n8n-axi\bin\n8n-axi.js"
if not exist "%CLI%" (
    echo CLI MCP n8n introuvable. Executez npm install dans le projet. 1>&2
    exit /b 1
)
node "%CLI%" %*
exit /b %ERRORLEVEL%
