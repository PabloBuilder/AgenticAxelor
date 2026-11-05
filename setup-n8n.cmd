@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo              Configuration n8n Alter-SI (CLI)
echo =======================================================
echo.
echo Dans n8n, vous pouvez recuperer l'URL du serveur MCP et le token
echo via : Parametres ^> MCP au niveau de l'instance ^> Connecter un client ^> Cle API.
echo.

set /p "INPUT_URL=Entrez l'URL n8n (ex: https://.../mcp-server/http ou https://n8n...) : "

if "%INPUT_URL%"=="" (
    echo [ERREUR] Aucune URL fournie. Operation annulee.
    pause
    exit /b 1
)

:: S'assurer que l'URL se termine par /mcp-server/http si non specifie
echo %INPUT_URL% | findstr /i "/mcp-server/http" >nul
if errorlevel 1 (
    :: Enlever le slash de fin si present
    if "%INPUT_URL:~-1%"=="/" set "INPUT_URL=%INPUT_URL:~0,-1%"
    set "MCP_URL=%INPUT_URL%/mcp-server/http"
) else (
    set "MCP_URL=%INPUT_URL%"
)

echo.
echo Veuillez coller votre cle / token API n8n :
set /p "TOKEN=Token API : "

if "%TOKEN%"=="" (
    echo [ERREUR] Aucun token fourni. Operation annulee.
    pause
    exit /b 1
)

echo.
echo [1/3] Enregistrement des variables d'environnement utilisateur...
setx N8N_MCP_URL "%MCP_URL%" >nul
setx N8N_MCP_TOKEN "%TOKEN%" >nul
setx N8N_BASE_URL "%INPUT_URL%" >nul
setx N8N_API_KEY "%TOKEN%" >nul

set "N8N_MCP_URL=%MCP_URL%"
set "N8N_MCP_TOKEN=%TOKEN%"
set "N8N_BASE_URL=%INPUT_URL%"
set "N8N_API_KEY=%TOKEN%"

echo [OK] Variables N8N_MCP_URL et N8N_MCP_TOKEN enregistrees.

echo.
echo [2/3] Configuration du binaire CLI n8n-axi dans Pi...
copy /y "%~dp0scripts\n8n-axi.mjs" "%USERPROFILE%\.pi\agent\bin\n8n-axi.mjs" >nul
echo @echo off > "%USERPROFILE%\.pi\agent\bin\n8n-axi.cmd"
echo node "%USERPROFILE%\.pi\agent\bin\n8n-axi.mjs" %%* >> "%USERPROFILE%\.pi\agent\bin\n8n-axi.cmd"
echo [OK] n8n-axi disponible dans le PATH.

echo.
echo [3/3] Test de connexion n8n...
node "%~dp0scripts\n8n-axi.mjs" workflows list --limit 3

echo.
echo =======================================================
echo   Configuration terminee !
echo =======================================================
pause
