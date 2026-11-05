@echo off
echo =======================================================
echo     Connexion Google Workspace Alter-SI (MCP OAuth)
echo =======================================================
echo.
echo Une fenetre de navigateur va s'ouvrir pour vous connecter
echo avec votre compte Google Alter-SI.
echo.
call "%USERPROFILE%\.pi\agent\bin\pi.cmd" mcp login google-workspace
echo.
pause
