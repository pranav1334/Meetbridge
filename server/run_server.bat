@echo off
REM Start the MeetBridge backend using the local Python virtual environment.
cd /d "%~dp0"
call venv\Scripts\activate
python -m uvicorn main:app --reload
