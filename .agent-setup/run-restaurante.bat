@echo off
title AGENTE-RESTAURANTE
cd /d C:\Users\krush\reservo-ai
git checkout feature/restaurante
echo.
echo =========================================
echo  AGENTE RESTAURANTE - INICIANDO...
echo =========================================
echo.
powershell -Command "Get-Content '.agent-setup\prompts\restaurante.txt' -Raw | & 'C:\Users\krush\.local\bin\claude.exe' -p --dangerously-skip-permissions"
echo.
echo =========================================
echo  AGENTE RESTAURANTE - TERMINADO
echo =========================================
pause
