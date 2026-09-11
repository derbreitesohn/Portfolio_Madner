@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:3000/museum after the server is ready.
echo Keep this window open while using the museum. Press Ctrl+C to stop.
call npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
pause
