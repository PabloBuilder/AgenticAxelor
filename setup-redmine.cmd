@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo          Configuration Redmine Alter-SI (CLI)
echo =======================================================
echo.

set "DEFAULT_REDMINE_URL=https://redmine.alter-si.fr"

set /p "INPUT_URL=Entrez l'URL Redmine [%DEFAULT_REDMINE_URL%] : "
if "%INPUT_URL%"=="" set "INPUT_URL=%DEFAULT_REDMINE_URL%"

echo.
echo Veuillez coller votre cle API Redmine (obtenue sur %INPUT_URL%/my/api_key) :
set /p "API_KEY=Cle API : "

if "%API_KEY%"=="" (
    echo [ERREUR] Aucune cle API fournie. Operation annulee.
    pause
    exit /b 1
)

echo.
echo [1/3] Enregistrement des variables d'environnement utilisateur...
setx REDMINE_URL "%INPUT_URL%" >nul
setx REDMINE_API_KEY "%API_KEY%" >nul

:: Definir dans la session courante pour le test immediat
set "REDMINE_URL=%INPUT_URL%"
set "REDMINE_API_KEY=%API_KEY%"

echo [OK] Variables REDMINE_URL et REDMINE_API_KEY enregistrees.

echo.
echo [2/3] Test d'authentification aupres de %REDMINE_URL%...
for /f "delims=" %%i in ('curl -s -f -H "X-Redmine-API-Key: %REDMINE_API_KEY%" "%REDMINE_URL%/users/current.json"') do set "USER_JSON=%%i"

if "%USER_JSON%"=="" (
    echo [ERREUR] Impossible de s'authentifier. Verifiez votre cle API ou l'acces reseau/VPN a %REDMINE_URL%.
    pause
    exit /b 1
)

echo [SUCCES] Authentification Redmine validee !
echo.

echo [3/3] Deploiement du CLI redmine-axi dans le PATH Pi...
node "%~dp0scripts\deploy-redmine-axi.cjs"

echo.
echo =======================================================
echo   Configuration terminee avec succes !
echo   Vous pouvez fermer cette fenetre.
echo =======================================================
pause
