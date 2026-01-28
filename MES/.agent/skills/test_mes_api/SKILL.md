---
name: Test MES API
description: Run a comprehensive test suite against all MES API endpoints to verify system health and functionality.
---

# Test MES API Skill

This skill allows you to run a full regression test against the running MES backend.

## Usage
- `test api`
- `run api tests`
- `verify backend`

## Instructions
1.  **Check Environment**: Ensure the backend is running (either Docker or Local) on `http://localhost:8008`.
2.  **Run Test Script**: Execute the python test script `scripts/test_api_full.py`.
3.  **Report**: Summarize the pass/fail results to the user.

**Script (`scripts/test_api_full.py`):**
(This script should already exist or be created to ping endpoints like /health, /parts, /orders, etc.)
