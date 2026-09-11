@echo off
cd /d "%~dp0"
set "PORT=4187"
node serve.js
pause
