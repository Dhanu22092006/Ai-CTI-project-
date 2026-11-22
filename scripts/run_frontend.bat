@echo off
echo ========================================================
echo Starting CTI Platform Frontend on http://localhost:5173
echo ========================================================
cd /d %~dp0..\frontend
npm run dev
pause

