@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
set "PORT=8765"

set "PID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do (
  if not defined PID set "PID=%%p"
)

if not defined PID (
  echo   本地服务当前没有运行。
  ping -n 4 127.0.0.1 >nul
  exit /b 0
)

taskkill /PID %PID% /F >nul 2>nul
echo   已停止本地服务（PID %PID%）。
echo   下次要用，双击"启动.bat"。
ping -n 4 127.0.0.1 >nul
