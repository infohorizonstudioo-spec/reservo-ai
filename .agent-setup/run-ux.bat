@echo off
title AGENTE-UX-GLOBAL
cd /d C:\Users\krush\reservo-ai
git checkout feature/ux-global
echo.
echo =========================================
echo  AGENTE UX GLOBAL - TRABAJANDO...
echo =========================================
echo.
C:\Users\krush\.local\bin\claude.exe --dangerously-skip-permissions < .agent-setup\prompts\ux-global.txt
echo.
echo =========================================
echo  AGENTE UX GLOBAL - TERMINADO
echo =========================================
pause
