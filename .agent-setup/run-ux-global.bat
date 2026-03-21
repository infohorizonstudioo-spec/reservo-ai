@echo off
title AGENTE-UX-GLOBAL
cd /d C:\Users\krush\reservo-ai
git checkout feature/ux-global
echo.
echo =========================================
echo  AGENTE UX GLOBAL - INICIANDO...
echo =========================================
echo.
powershell -Command "Get-Content '.agent-setup\prompts\ux-global.txt' -Raw | & 'C:\Users\krush\.local\bin\claude.exe' -p --dangerously-skip-permissions"
echo.
echo =========================================
echo  AGENTE UX GLOBAL - TERMINADO
echo =========================================
pause
