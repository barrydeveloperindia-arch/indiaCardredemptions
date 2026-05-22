# 🤖 AGENT BOOTSTRAP INSTRUCTIONS

**Hello Antigravity Agent!** If you are reading this, the user has just initialized a new session in this directory to build the `indiaCardRedemptions` (The Points Array) mobile application.

## Your Immediate Tasks:
1. Read `docs/reference/features.md` to understand the full scope, MVP, and Phase 1-4 roadmap.
2. Read `MASTER_PROMPT.md` to see exactly what the user wants you to build first (React Native with Expo).
3. Review `docs/reference/loyalty_matrix_reference.md` to understand the hardcoded business logic required for Indian credit card transfer ratios.
4. Read `docs/reference/redemption_strategy.md`, `docs/reference/user_loyalty_balances.md`, and `docs/reference/comparative_loyalty_analysis.md` to absorb the user's specific point balances and upcoming trips (London, Swiss, China, Vietnam).

**Do NOT start writing code until you have read all these files.** Once you have read them, confirm with the user and execute Phase 1 (Initializing the Expo app and building the static JSON database). **CRITICAL:** You must follow a strict TDD (Test-Driven Development) pipeline. Write Jest tests for all matrix logic before building the UI!
