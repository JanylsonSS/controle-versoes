@echo off
REM Atalho para subir o sistema no Windows sem precisar abrir o terminal.
REM Basta dar dois cliques neste arquivo.

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   O Node.js nao esta instalado neste computador.
  echo.
  echo   Baixe a versao LTS em https://nodejs.org, instale, e
  echo   depois de dois cliques neste arquivo de novo.
  echo.
  pause
  exit /b 1
)

node servidor.js

echo.
echo   O sistema parou. Se foi sem querer, de dois cliques aqui de novo.
pause
