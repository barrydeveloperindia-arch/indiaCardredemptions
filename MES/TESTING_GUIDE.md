# Comprehensive Testing Guide: Englabs MES

This document outlines the testing procedures to verify the stability and functionality of the MES application after any modifications.

## 1. System Health Check
**Objective**: Ensure the backend API and frontend are running and accessible.

- [ ] **Backend Status**:
  - Run: `curl http://localhost:8008/api/health`
  - Expected: `{"status": "MES System Online", "auth_mode": "JWT"}`
- [ ] **Frontend Status**:
  - Open: `http://localhost:5173` in a browser.
  - Expected: The application loads without white-screen or console errors.

## 2. Desktop Bridge (System Router)
**Objective**: Verify the connection between GOKU Assistant and local desktop applications.

- [ ] **Queue Command Checks**:
  - Run: `curl -X POST http://localhost:8008/api/system/command -H "Content-Type: application/json" -d '{"app": "excel"}'`
  - Expected: `{"status": "Queued", "queue_length": N}`
- [ ] **Poll Command Checks**:
  - Run: `curl http://localhost:8008/api/system/poll-commands`
  - Expected: `{"commands": [{"app": "excel", ...}]}` (if queued previously) or `{"commands": []}`.
- [ ] **Integration Test**:
  - In Frontend: Ask GOKU "Open Excel".
  - Expected: Chat confirmation "Command sent..." and Desktop Launcher logs `[Launcher] Opening excel...`.

## 3. Agile Scheduler
**Objective**: Ensure the Gantt chart retrieves data and the auto-scheduling engine works.

- [ ] **Get Gantt Data**:
  - Run: `curl http://localhost:8008/api/scheduling/gantt`
  - Expected: JSON object with `timeline_start`, `machines`, and `jobs` arrays.
- [ ] **Auto Schedule Trigger**:
  - Run: `curl -X POST http://localhost:8008/api/scheduling/jobs/auto-schedule`
  - Expected: `{"scheduled": N, "log": [...]}`

## 4. Shop Floor Digital Twin
**Objective**: Verify machine status monitoring.

- [ ] **Summary Endpoint**:
  - Run: `curl http://localhost:8008/api/shop-floor-summary`
  - Expected: List of machines with `status` and `temp`.

## 5. AI Assistant (GOKU)
**Objective**: Verify Gemini API integration.

- [ ] **Basic Query**:
  - Run: `python test_ai_connection.py` (if available) or use the curl command below:
  - `curl -X POST http://localhost:8008/api/ai/ask -H "Content-Type: application/json" -d '{"message": "Hello", "provider": "gemini"}'`
  - Expected: `{"response": "..."}` containing a response from GOKU.

## 6. Part Analysis & Storage
- [ ] **Storage Access**:
  - Visit `http://localhost:8008/storage/` (may return 404 if no index, but files should be accessible if path known).
  - Verify `app.mount("/storage", ...)` is active in `main.py`.

## Quick Validation Script
Use the following Python script to run a quick health check on all endpoints:

```python
import requests

BASE_URL = "http://localhost:8008"

endpoints = [
    ("/api/health", "GET"),
    ("/api/shop-floor-summary", "GET"),
    ("/api/scheduling/gantt", "GET"),
    ("/api/system/poll-commands", "GET")
]

print("--- System Validation ---")
for path, method in endpoints:
    try:
        if method == "GET":
            res = requests.get(f"{BASE_URL}{path}")
        print(f"[{res.status_code}] {path}")
    except Exception as e:
        print(f"[FAIL] {path}: {e}")
```
