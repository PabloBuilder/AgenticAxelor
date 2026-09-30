@echo off
setlocal
cd /d "%~dp0"

echo Checking AgenticAxelor Bridge at 127.0.0.1:3210...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:3210/api/status' -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 }; exit 1 } catch { exit 1 }" >nul 2>&1

if not errorlevel 1 (
  echo AgenticAxelor Bridge is already running.
  pause
  exit /b 0
)

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm was not found. Install Node.js and npm, then try again.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing project dependencies...
  call npm ci
  if errorlevel 1 (
    echo ERROR: Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting AgenticAxelor Bridge...
echo Keep this window open while using the extension. Press Ctrl+C to stop.
call npm run bridge

echo AgenticAxelor Bridge stopped.
pause