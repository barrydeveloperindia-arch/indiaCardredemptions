---
name: Environment Manager
description: Manage the MES environment, allowing the user to easily switch between Docker and Local setups using simple commands like "docker up" and "local up".
---

# Environment Manager Skill

This skill allows you to control the MES development environment.

## Usage

You can use the following commands (or similar natural language requests):
- `docker up` / `run docker`: Starts the full Dockerized stack (Frontend, Backend, DB, Converter).
- `local up` / `run local`: Stops Docker and starts the application locally (Python Backend + Vite Frontend) using local SQLite.
- `stop all`: Stops both Docker and local processes.

## Instructions

### 1. Docker Up ("Run in Docker")
To start the environment in Docker:
1.  **Stop Local Processes**: Kill any running `uvicorn`, `python`, or `node` processes to free up ports 8008 and 5173.
2.  **Ensure Docker is Running**: Check if Docker Desktop is reachable. If not, ask the user to start it.
3.  **Run Docker Compose**: Execute `docker-compose up -d --build`.
4.  **Verify Health**: Check `curl http://localhost:8008/api/health` to confirm the backend is up.

**Script (`scripts/docker_up.bat`):**
```bat
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
```

### 2. Local Up ("Run Locally")
To start the environment locally (Host Machine):
1.  **Stop Docker**: Run `docker-compose down`.
2.  **Start Backend**: Run `python src/main.py` (or `uvicorn src.main:app --reload --port 8008`) in a new terminal/background.
3.  **Start Frontend**: Navigate to `src/frontend` and run `npm run dev` in a new terminal/background.
4.  **Note**: This mode uses the LOCAL SQLite database (`mes.db`) and local `storage/` folder directly.

**Script (`scripts/local_up.bat`):**
```bat
@echo off
echo [ENV] Stopping Docker containers...
docker-compose down

echo [ENV] Starting Backend (Local)...
start "MES Backend" cmd /k "python src/main.py"

echo [ENV] Starting Frontend (Local)...
cd src/frontend
start "MES Frontend" cmd /k "npm run dev"

echo [ENV] Done! Access at http://localhost:5173
```

### 3. Stop All
To stop everything:
**Script (`scripts/stop_all.bat`):**
```bat
@echo off
echo [ENV] Stopping ALL services...
docker-compose down
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM uvicorn.exe /T 2>nul
echo [ENV] All services stopped.
```
