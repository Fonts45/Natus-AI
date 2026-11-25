@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Instale o Node.js 24 ou superior e abra este arquivo novamente.
  pause
  exit /b 1
)
set "NATUS_PORT=8790"
set "NATUS_URL=http://127.0.0.1:8790/"
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing $env:NATUS_URL -TimeoutSec 2; if ($r.Content -like '*<title>Natus | ChatBoot</title>*') { exit 0 } } catch {}; exit 1"
if not errorlevel 1 (
  start "" "%NATUS_URL%"
  exit /b 0
)
echo Mantenha esta janela aberta enquanto usa o ChatBoot.
node "%~dp0server.mjs" --demo --open
pause

