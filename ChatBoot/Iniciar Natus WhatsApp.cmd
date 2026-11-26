@echo off
cd /d "%~dp0"
if not exist "dados-locais\meta.local.env" (
  echo Copie config\meta.example.env para dados-locais\meta.local.env e preencha os dados da Meta.
  pause
  exit /b 1
)
node --env-file=dados-locais\meta.local.env server.mjs
pause
