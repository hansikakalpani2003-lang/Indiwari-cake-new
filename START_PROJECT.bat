@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing project dependencies...
  call npm install
  if errorlevel 1 pause & exit /b 1
)
echo Starting Indiwari Cake frontend and backend...
call npm run dev
pause
