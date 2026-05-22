# Master Implementation Checklist & TDD Blueprint
**Date:** May 22, 2026
**Standard Execution Rule**: All features must follow strict Test-Driven Development (TDD). No production code should be written until corresponding Jest tests are defined and failing.

---

## 📅 Implementation Task Checklist

- [x] **Task 1: Core Static Databases Setup** (JSON Rules)
- [x] **Task 2: Transfer Matrix Calculation Engine**
- [x] **Task 3: Hotel Arbitrage & Point Sales Engine**
- [x] **Task 4: Insights Hub Spend Recalculator & MCC Checker**
- [x] **Task 5: Secure Local PDF Statement Parser**
- [x] **Task 6: Duffel Travel API Cash Pricing Fetcher**
- [x] **Task 7: AI Concierge RAG Context Constructor**
- [x] **Task 8: Light-Theme UI Components Assembly** (Visual Screens)
- [x] **Task 9: PDF Sandbox & Security Sanitization** (On-device file security check)
- [x] **Task 10: Local Matrix Offline Cache Fallback** (Robust offline use)
- [x] **Task 11: Global Error Boundary & API Fallbacks** (Duffel/Gemini recovery)
- [x] **Task 12: Secure Dotenv Configuration Management** (API keys security)

---

## 🧪 TDD Blueprints for Each Task

### Task 1: Core Static Databases Setup
*   **Target File**: `src/constants/transferMatrix.json`
*   **Test File**: `src/__tests__/databaseValidation.test.ts`
*   **TDD Blueprint**:
    *   **Arrange**: Load JSON configuration tables.
    *   **Act**: Assert key structures exist (e.g. check Axis Atlas mappings).
    *   **Assert (Fails First)**: Fails if files are empty, missing keys, or contain invalid coefficients.
    *   **Pass Condition**: Standard JSON structure matching the Indian transfer ratios database schema.

### Task 2: Transfer Matrix Calculation Engine
*   **Target File**: `src/utils/matrixEngine.ts`
*   **Test File**: `src/__tests__/matrixEngine.test.ts`
*   **TDD Blueprint**:
    *   **Arrange**: Mock a user card wallet containing Amex Plat Travel and HDFC Infinia.
    *   **Act**: Call `getTransferRatio('amex_mr', 'marriott_bonvoy')`.
    *   **Assert (Fails First)**: Fails since `matrixEngine.ts` has no functions.
    *   **Pass Condition**: Write the `getTransferRatio` lookup function to fetch and map the matching JSON nodes.

### Task 3: Hotel Arbitrage & Point Sales Engine
*   **Target File**: `src/utils/arbitrageCalculator.ts`
*   **Test File**: `src/__tests__/arbitrageCalculator.test.ts`
*   **TDD Blueprint**:
    *   **Arrange**: Input parameters: Cash Price (INR 30,000), Points Cost (15,000 Marriott), Transfer Ratio (Axis Edge Miles to Marriott 5:4).
    *   **Act**: Run `calculateVpp(30000, 15000, 1.25)`.
    *   **Assert (Fails First)**: Fails because calculation is undefined or yields wrong numbers.
    *   **Pass Condition**: Write the math division and multiplier overrides to calculate the precise value per point (VPP).

### Task 4: Insights Hub Spend Recalculator & MCC Checker
*   **Target File**: `src/utils/mccChecker.ts`
*   **Test File**: `src/__tests__/mccChecker.test.ts`
*   **TDD Blueprint**:
    *   **Arrange**: Pass merchant descriptor `"Zomato"` and target card `"hdfc_infinia"`.
    *   **Act**: Query `getCardMultiplier('Zomato', 'hdfc_infinia')`.
    *   **Assert (Fails First)**: Fails to find merchant mappings or returns default rates.
    *   **Pass Condition**: Implement a search lookup (e.g. Trie or filter) over the MCC database matching descriptor rules to multiplier multipliers.

### Task 5: Secure Local PDF Statement Parser
*   **Target File**: `src/utils/pdfParser.ts`
*   **Test File**: `src/__tests__/pdfParser.test.ts`
*   **TDD Blueprint**:
    *   **Arrange**: Load mock statement text blocks containing standard billing summary tables.
    *   **Act**: Run `parseInfiniaStatement(rawText)`.
    *   **Assert (Fails First)**: Fails due to unhandled regex parsing or missing values.
    *   **Pass Condition**: Implement matching regex logic for reward ledger summary lines to extract `Points Earned` and `Total Spends`.

### Task 6: Duffel Travel API Cash Pricing Fetcher
*   **Target File**: `src/utils/travelApi.ts`
*   **Test File**: `src/__tests__/travelApi.test.ts`
*   **TDD Blueprint**:
    *   **Arrange**: Setup mock axios adapters simulating Duffel search payload returns.
    *   **Act**: Call `searchCashFlights('BOM', 'LHR', '2026-10-15')`.
    *   **Assert (Fails First)**: Fails as API responses are unmapped or throw errors.
    *   **Pass Condition**: Write the Axios call and data normalization mappings to extract the cheapest flight offer price.

### Task 7: AI Concierge RAG Context Constructor
*   **Target File**: `src/utils/aiHandler.ts`
*   **Test File**: `src/__tests__/aiHandler.test.ts`
*   **TDD Blueprint**:
    *   **Arrange**: Load user wallet state (40,000 points) and target itinerary search parameter ("London").
    *   **Act**: Run `buildRagPayload(walletState, transferMatrix, 'London')`.
    *   **Assert (Fails First)**: Fails to construct system prompts or inject matrices correctly.
    *   **Pass Condition**: Implement string template logic generating system prompts containing balances and direct transfer ratios for the LLM.

### Task 8: Light-Theme UI Components Assembly
*   **Target File**: `src/components/WalletCard.tsx`, `src/components/MilestoneProgress.tsx`
*   **Test File**: `src/__tests__/uiComponents.test.tsx`
*   **TDD Blueprint**:
    *   **Arrange**: Render component with progress set to `0.5`.
    *   **Act**: Scrape the rendered element using `@testing-library/react-native`.
    *   **Assert (Fails First)**: Fails as the custom components are missing or fail assertions.
    *   **Pass Condition**: Create the React Native component structure utilizing light-theme shadow styles and silver/navy colors.

### Task 9: PDF Sandbox & Security Sanitization
*   **Target File**: `src/utils/pdfSanitizer.ts`
*   **Test File**: `src/__tests__/pdfSanitizer.test.ts`
*   **TDD Blueprint**:
    *   **Arrange**: Setup malicious test PDFs containing script injections or oversized structures.
    *   **Act**: Call `sanitizePdfFile(pdfBlob)`.
    *   **Assert (Fails First)**: Fails because unsafe files bypass initial check or crash the runtime.
    *   **Pass Condition**: Implement file size bounds checking and verify page structure matches valid PDF formats before running parser.

### Task 10: Local Matrix Offline Cache Fallback
*   **Target File**: `src/utils/offlineCache.ts`
*   **Test File**: `src/__tests__/offlineCache.test.ts`
*   **TDD Blueprint**:
    *   **Arrange**: Simulate network failure scenario.
    *   **Act**: Call `getMatrixWithOfflineFallback()`.
    *   **Assert (Fails First)**: Fails because app is offline and no local state is populated.
    *   **Pass Condition**: Cache the default JSON matrix locally inside AsyncStorage and return it if network fetch fails.

### Task 11: Global Error Boundary & API Fallbacks
*   **Target File**: `src/components/ErrorBoundary.tsx`
*   **Test File**: `src/__tests__/errorBoundary.test.tsx`
*   **TDD Blueprint**:
    *   **Arrange**: Render a mock component that throws a runtime error.
    *   **Act**: Scrape the error screen rendering.
    *   **Assert (Fails First)**: Fails as the app crashes outright instead of showing a recovery UI.
    *   **Pass Condition**: Implement React Class Component `componentDidCatch` to log errors and render a recovery screen in corporate silver.

### Task 12: Secure Dotenv Configuration Management
*   **Target File**: `src/utils/envConfig.ts`
*   **Test File**: `src/__tests__/envConfig.test.ts`
*   **TDD Blueprint**:
    *   **Arrange**: Check values for API credentials.
    *   **Act**: Call `getApiCredentials()`.
    *   **Assert (Fails First)**: Fails because keys are exposed in plaintext codebase.
    *   **Pass Condition**: Use React Native dotenv configurations (`babel-plugin-inline-dotenv`) to compile variables securely.
