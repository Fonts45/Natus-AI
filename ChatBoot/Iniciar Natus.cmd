@echo off
setlocal
cd /d "%~dp0" || exit /b 1
set "NATUS_URL=http://127.0.0.1:8790/interface/"
set "NATUS_NODE="
for /f "delims=" %%I in ('powershell.exe -NoProfile -Command "$paths = @((Get-Command node.exe -ErrorAction SilentlyContinue).Source, (Join-Path $env:ProgramFiles 'nodejs\node.exe')); $paths += @(Get-AppxPackage -Name 'OpenAI.CodexPrimaryRuntime*' -ErrorAction SilentlyContinue | Sort-Object Version -Descending | ForEach-Object { Join-Path $_.InstallLocation 'dependencies\node\bin\node.exe' }); foreach ($path in $paths) { if ($path -and (Test-Path -LiteralPath $path -PathType Leaf) -and (Get-Item -LiteralPath $path).VersionInfo.FileMajorPart -ge 24) { $path; break } }"') do set "NATUS_NODE=%%I"
if not defined NATUS_NODE (
  echo O Node.js 24 ou superior nao foi localizado.
  pause
  exit /b 1
)
echo Abrindo o ChatBoot...
"%NATUS_NODE%" "%~dp0iniciar-natus.mjs"
if errorlevel 1 (
  pause
  exit /b 1
)
start "" "%NATUS_URL%"

