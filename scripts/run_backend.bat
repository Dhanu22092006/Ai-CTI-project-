@echo off
echo ========================================================
echo Starting CTI Platform Backend API on http://127.0.0.1:8000
echo Swagger Documentation available at http://127.0.0.1:8000/docs
echo ========================================================
set PYTHONPATH=%~dp0..\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause

