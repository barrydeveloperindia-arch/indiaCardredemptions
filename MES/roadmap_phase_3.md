# Phase 3: Production Readiness & Functional Depth

The Core Architecture, Auth, and UI are stable. The next phase focuses on **Operational Depth**.

## 1. Inventory Management (New Module)
**Goal**: Track raw materials (PLA, Steel, Coolant) and deduct usage automatically.
- **Database**: Add `InventoryItem` and `MaterialTransaction` tables.
- **Logic**: Update `complete_job` to decrement inventory.
- **UI**: Add "Inventory" tab to Shop Floor or Financials.

## 2. Operator Controls (Manufacturing Execution)
**Goal**: Allow valid Shop Floor Operators to control machines via the UI.
- **UI**: Add "Start", "Pause", "Emergency Stop" buttons to the `ShopFloor` machine cards.
- **Backend**: Create API endpoints `POST /machines/{id}/control`.
- **Logic**: Wire these actions to the `OpcUaManager` (writing to PLC tags).

## 3. Advanced Dispatching Logic
**Goal**: Replace the random/mock dispatching with a deterministic algorithm.
- **Logic**: Implement "Earliest Due Date" (EDD) or "First Come First Served" (FCFS) ranking.
- **Agent**: Enhance `DispatchAgent` to respect Machine Capabilities (e.g. "Only CNC-001 can do Steel").

## 4. Production Database
**Goal**: Migrate from SQLite to PostgreSQL.
- **Infrastructure**: Ensure `docker-compose` spins up Postgres.
- **Config**: Update `DATABASE_URL` to point to the container.

**Recommendation**: Start with **1. Inventory Management** as it connects Manufacturing to Financials (Module D).
