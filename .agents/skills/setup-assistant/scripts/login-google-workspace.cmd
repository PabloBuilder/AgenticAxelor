@echo off
setlocal
set "GOOSE="
where goose >nul 2>&1 && set "GOOSE=goose"
if not defined GOOSE if exist "%USERPROFILE%\.local\bin\goose.exe" set "GOOSE=%USERPROFILE%\.local\bin\goose.exe"
if not defined GOOSE (
    echo Goose CLI introuvable. Ouvrez les parametres Extensions de Goose Desktop.
    pause
    exit /b 1
)
echo Dans Goose, configurez l'extension MCP Google Workspace et son autorisation.
echo Utilisez uniquement une adresse validee par votre administrateur.
call "%GOOSE%" configure
set "EXIT_CODE=%ERRORLEVEL%"
if not "%EXIT_CODE%"=="0" echo Configuration Goose interrompue ou en echec.
if "%EXIT_CODE%"=="0" echo Verifiez ensuite la connexion avec une lecture autorisee.
pause
exit /b %EXIT_CODE%
