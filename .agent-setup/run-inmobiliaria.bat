@echo off
title AGENTE-INMOBILIARIA
cd /d C:\Users\krush\reservo-ai
git checkout feature/inmobiliaria
echo.
echo =========================================
echo  AGENTE INMOBILIARIA - INICIANDO...
echo =========================================
echo.
powershell -Command "Get-Content '.agent-setup\prompts\inmobiliaria.txt' -Raw | & 'C:\Users\krush\.local\bin\claude.exe' -p --dangerously-skip-permissions"
echo.
echo =========================================
echo  AGENTE INMOBILIARIA - TERMINADO
echo =========================================
pause
