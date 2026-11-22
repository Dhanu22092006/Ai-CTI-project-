@echo off
echo ========================================================
echo Launching AI-Powered CTI Correlation Platform
echo ========================================================
start "CTI Backend (FastAPI)" cmd /k "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "CTI Frontend (Vite/React)" cmd /k "%~dp0run_frontend.bat"
echo Applications launched in separate windows!
echo Backend:  http://127.0.0.1:8000/docs
echo Frontend: http://localhost:5173

