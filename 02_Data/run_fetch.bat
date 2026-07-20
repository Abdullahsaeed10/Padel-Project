@echo off
title PadelLens real-data fetch (padelapi.org)
cd /d "%~dp0"
echo Starting fetch - this takes 10-15 minutes (rate-limit friendly)...
python fetch_padelapi.py
echo.
echo Finished. You can close this window.
pause
