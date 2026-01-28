@echo off
echo [ENV] Stopping local services...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM uvicorn.exe /T 2>nul

echo [ENV] Starting Docker containers...
docker-compose up -d --build

echo [ENV] Waiting for health check...
timeout /t 10
echo [ENV] Done! Access at http://localhost:5173
