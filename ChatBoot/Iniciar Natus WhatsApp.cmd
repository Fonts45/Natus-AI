@echo off
cd /d "%~dp0"
if not exist "meta.local.env" (
  echo Copie meta.example.env para meta.local.env e preencha os dados da Meta.
  pause
  exit /b 1
)
node --env-file=meta.local.env server.mjs
pause
