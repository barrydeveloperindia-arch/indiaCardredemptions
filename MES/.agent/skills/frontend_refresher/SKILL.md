---
name: UI Sync Enforcer
description: Forces the MES Frontend to apply latest code changes by restarting the container. Use this when the user reports "UI not updating".
commands:
  - name: force_refresh
    description: Restarts the frontend container to clear stale cache/workers.
    usage: python .agent/skills/frontend_refresher/scripts/refresh.py
---

# UI Sync Enforcer

## Purpose
On Windows Docker integration, file changes in the `src/frontend` directory are sometimes not detected immediately.
**Upgrade (Jan 29 2026):** We have enabled `usePolling` in `vite.config.js`. This should fix the issue permanently.
However, if the UI still freezes, use this skill to Force Restart.

## Usage
When the user says "UI didn't update" or "I still see the old page", RUN THIS SKILL.

## Implementation
It simply runs: `docker restart englabs_frontend`
This forces the dev server to restart and rebuild the bundle from the fresh files.
