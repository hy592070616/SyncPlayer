#!/bin/bash
echo "Starting SyncPlayer..."
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"

# Run both in background using uv for Python
bun run dev &
cd backend && uv run uvicorn main:app --reload --port 8000 &
wait