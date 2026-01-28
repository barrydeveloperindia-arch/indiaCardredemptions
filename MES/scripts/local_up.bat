@echo off
echo [ENV] Stopping Docker containers...
docker-compose down

echo [ENV] Starting Backend (Local)...
start "MES Backend" cmd /k "python src/main.py"

echo [ENV] Starting Frontend (Local)...
cd src/frontend
start "MES Frontend" cmd /k "npm run dev"

echo [ENV] Done! Access at http://localhost:5173
