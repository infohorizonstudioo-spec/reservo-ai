@echo off
title AGENTE-CLINICA
cd /d C:\Users\krush\reservo-ai
git checkout feature/clinica
echo.
echo =========================================
echo  AGENTE CLINICA - INICIANDO...
echo =========================================
echo.
powershell -Command "Get-Content '.agent-setup\prompts\clinica.txt' -Raw | & 'C:\Users\krush\.local\bin\claude.exe' -p --dangerously-skip-permissions"
echo.
echo =========================================
echo  AGENTE CLINICA - TERMINADO
echo =========================================
pause
