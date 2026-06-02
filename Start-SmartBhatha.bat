@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title Smart Bhatha ERP

echo.
echo  Smart Bhatha ERP - Starting...
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install LTS from https://nodejs.org/
  pause
  exit /b 1
)

where docker >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker not found. Install Docker Desktop from https://www.docker.com/products/docker-desktop/
  pause
  exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
  echo Docker is not running. Starting Docker Desktop...
  if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
    start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
  ) else (
    echo [ERROR] Start Docker Desktop manually, then run this file again.
    pause
    exit /b 1
  )
  echo Waiting for Docker ^(about 20 seconds^)...
  timeout /t 20 /nobreak >nul
)

echo [1/3] Starting PostgreSQL...
docker compose up -d postgres
if errorlevel 1 (
  echo [ERROR] Could not start database. Is Docker Desktop running?
  pause
  exit /b 1
)
timeout /t 5 /nobreak >nul

if not exist "node_modules\" (
  echo First run: installing dependencies...
  call npm install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)

if not exist ".env" (
  echo Creating .env from .env.example...
  copy /Y .env.example .env >nul
  echo Run scripts\setup-db.ps1 once if you have not set up the database yet.
)

echo [2/3] Starting web server ^(keep the server window open^)...
start "Smart Bhatha ERP Server" cmd /k "cd /d "%~dp0" && npm run dev"

echo [3/3] Opening app...
timeout /t 8 /nobreak >nul

set "APP_URL=http://localhost:3000"

where msedge >nul 2>&1
if not errorlevel 1 (
  start "" msedge --app=%APP_URL%
  goto opened
)

where chrome >nul 2>&1
if not errorlevel 1 (
  start "" chrome --app=%APP_URL%
  goto opened
)

start "" %APP_URL%

:opened
echo.
echo  Done. Login: admin@bhatha.pk / admin123
echo.
echo  Tip: In Edge use menu ... - Apps - Install this site as an app
echo       Then pin Smart Brick to your taskbar.
echo.
echo  First time? Run:  powershell -ExecutionPolicy Bypass -File scripts\setup-db.ps1
echo.
pause
endlocal
