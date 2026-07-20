@echo off
title PadelLens - demo launcher
cd /d "%~dp0\05_App\PadelLens"
echo [1/3] Installing requirements (first run only takes a minute)...
python -m pip install -r requirements.txt --quiet
echo [2/3] Building the SQLite database...
python build_db.py
echo [3/3] Starting PadelLens - your browser will open at http://localhost:8501
python -m streamlit run Dashboard.py
pause
