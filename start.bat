@echo off
echo Starting SyncPlayer...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
start /b bun run dev
cd backend
start /b uv run uvicorn main:app --reload --port 8000