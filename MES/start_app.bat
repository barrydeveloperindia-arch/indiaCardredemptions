
@echo off
echo Starting Englabs MES Environment...

:: Start Docker Containers
echo Starting Docker Containers...
docker-compose up -d

:: Check if Docker started successfully
if %ERRORLEVEL% NEQ 0 (
    echo Docker failed to start. Please check your docker installation.
    pause
    exit /b
)

:: Wait for services (simple pause)
echo Waiting for services to initialize...
timeout /t 5 /nobreak >nul

:: Open Application in Default Browser
echo Launching Application...
start http://localhost:5173

echo.
echo Englabs MES is running. 
echo You can minimize this window.
pause
