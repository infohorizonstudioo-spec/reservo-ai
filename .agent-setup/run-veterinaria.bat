@echo off
title AGENTE-VETERINARIA
cd /d C:\Users\krush\reservo-ai
git checkout feature/veterinaria
echo.
echo =========================================
echo  AGENTE VETERINARIA - INICIANDO...
echo =========================================
echo.
powershell -Command "Get-Content '.agent-setup\prompts\veterinaria.txt' -Raw | & 'C:\Users\krush\.local\bin\claude.exe' -p --dangerously-skip-permissions"
echo.
echo =========================================
echo  AGENTE VETERINARIA - TERMINADO
echo =========================================
pause
