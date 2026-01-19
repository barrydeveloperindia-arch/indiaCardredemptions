# Phase 3: Production Readiness & Functional Depth [COMPLETED]

The Core Architecture, Auth, and UI are stable. The next phase focuses on **Operational Depth**.

## 1. Inventory Management (New Module) [DONE]
**Goal**: Track raw materials (PLA, Steel, Coolant) and deduct usage automatically.
- [x] **Database**: Add `InventoryItem` and `MaterialTransaction` tables.
- [x] **Logic**: Update `complete_job` to decrement inventory.
- [x] **UI**: Add "Inventory" tab to Shop Floor or Financials.

## 2. Operator Controls (Manufacturing Execution) [DONE]
**Goal**: Allow valid Shop Floor Operators to control machines via the UI.
- [x] **UI**: Add "Start", "Pause", "Emergency Stop" buttons to the `ShopFloor` machine cards.
- [x] **Backend**: Create API endpoints `POST /machines/{id}/control`.
- [x] **Logic**: Wire these actions to the `OpcUaManager` (writing to PLC tags).

## 3. Advanced Dispatching Logic [DONE]
**Goal**: Replace the random/mock dispatching with a deterministic algorithm.
- [x] **Logic**: Implement "Earliest Due Date" (EDD) or "First Come First Served" (FCFS) ranking.
- [x] **Agent**: Enhance `DispatchAgent` to respect Machine Capabilities (e.g. "Only CNC-001 can do Steel").

## 4. Production Database [DONE]
**Goal**: Migrate from SQLite to PostgreSQL.
- [x] **Infrastructure**: Ensure `docker-compose` spins up Postgres.
- [x] **Config**: Update `DATABASE_URL` to point to the container.

**Recommendation**: Start with **Phase 4: Optimization & Intelligence** (See `enhancement_plan.md`).
