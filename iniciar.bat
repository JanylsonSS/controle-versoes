@echo off
REM Sobe o Promav com dois cliques, sem precisar abrir o terminal.
REM Se o aplicativo ainda nao foi compilado nesta maquina, compila antes.

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   O Node.js nao esta instalado neste computador.
  echo   Baixe a versao LTS em https://nodejs.org, instale, e
  echo   depois de dois cliques neste arquivo de novo.
  echo.
  pause
  exit /b 1
)

if not exist "dist\index.html" (
  echo O aplicativo ainda nao foi compilado nesta maquina. Preparando...
  if not exist "frontend\node_modules" (
    echo   1/2: baixando as dependencias do aplicativo ^(so na primeira vez^)...
    call npm --prefix frontend install --no-fund --no-audit
    if errorlevel 1 (
      echo.
      echo   Nao deu para baixar as dependencias. Tem internet nesta maquina?
      pause
      exit /b 1
    )
  )
  echo   2/2: compilando o aplicativo...
  call npm run app:build
  if errorlevel 1 (
    echo.
    echo   A compilacao falhou. Chame quem mantem o sistema.
    pause
    exit /b 1
  )
)

node servidor.js

echo.
echo   O sistema parou. Se foi sem querer, de dois cliques aqui de novo.
pause
