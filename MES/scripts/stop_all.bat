@echo off
echo [ENV] Stopping ALL services...
docker-compose down
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM uvicorn.exe /T 2>nul
echo [ENV] All services stopped.
