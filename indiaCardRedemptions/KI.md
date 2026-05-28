# 🧠 Local Knowledge Item (KI): The Indian Points Array

This localized Knowledge Item serves as the master reference for future development, design, and travel arbitrage engineering within the `indiaCardRedemptions` repository.

---

## 📌 Metadata
*   **Domain:** Credit Card Reward Tracking, Arbitrage Calculators, and Travel Redemption Routing
*   **Repository:** `barrydeveloperindia-arch/indiaCardredemptions` (indiaCardRedemptions)
*   **Key Modules:** `src/components/WalletCard.tsx`, `src/components/ArbitrageCalculator.tsx`, `src/components/OfflineBanner.tsx`

---

## 🎨 1. Premium Obsidian-Gold UI System

To maintain the high-fidelity **Dark Luxury** aesthetic, all interface modifications must adhere to these tokens and components:

-   **Color Palette**:
    *   `theme.colors.gold`: `#D4AF37` (used for active borders, accents, primary buttons, and premium badges).
    *   `theme.colors.background`: `#090A0F` (Obsidian-dark base).
-   **Metallic Overlay**: Cards (`WalletCard`) utilize linear gradient overlays and holographic chip simulations to display loyalty reward levels.
-   **Milestone Badges**: Dynamic status indicators (e.g. unlocking Taj Vouchers at ₹7L+ annual spends) must use the gold accent border and transparent blur fills.

---

## 🧮 2. Points Arbitrage & RpP Calculator Engine

The calculator determines the profitability of swiping cards vs paying cash or burning miles:

-   **Rupee-per-Point (RpP)**:
    $$\text{RpP Yield} = \frac{\text{Cash Ticket Value} - \text{Out-of-Pocket Taxes/Surcharges}}{\text{Points Required}}$$
-   **Arbitrage Thresholds**:
    *   $\text{Yield} \ge 1.0$: Classified as **`ELITE ARBITRAGE`** (highlighted in gold in UI).
    *   $\text{Yield} < 1.0$: Standard value (blue/grey accents).

---

## ✈️ 3. Post-Devaluation Transfer Routing Matrix (May 2026 Update)

Following major devaluations (e.g., Axis removing direct transfers to Marriott and Qatar Airways on April 2, 2026), these routes bypass restrictions:

-   **The Qatar-Avios Bridge**: Transfer Axis EDGE points to **British Airways Executive Club** (Group A, 5:4 Burgundy ratio). Link the BA account to the **Qatar Airways Privilege Club** and move Avios instantly at a **1:1 ratio**.
-   **The Star Alliance Bypass**: Transfer HSBC Premier points (1:1 ratio) or Axis EDGE points (5:4 ratio) to **Air Canada Aeroplan** to book Star Alliance flights (e.g., Air India) without paying heavy carrier surcharges.

---

## 📅 4. DEL ➔ LHR May & June Close-In Booking Playbook

Specific strategies for booking flights from Delhi (DEL) to London (LHR) during the peak May-June season:

-   **The Late May Peak**: The UK school half-term week (May 22–31) triggers peak season miles pricing (e.g., Virgin Atlantic jumps to 60k points roundtrip) and doubles cash pricing (frequently exceeding ₹90,000).
-   **T-4 close-in award seat releases**:
    *   **Aeroplan**: Book nonstop Air India Business class for **70,000 Aeroplan points** (saves 20,000 points compared to Air India's native 90,000 points rate) with only ~₹4,500 in taxes.
    *   **Virgin Atlantic**: Search T-3 days to T-1 day for last-minute Upper Class space at **47,500 points** (transferable from Amex).
    *   **Air India Direct (Economy)**: Use the native Flying Returns balance (**35,000 points** one-way) to bypass the CAD $39 partner fee and secure a cheap nonstop.

---

## 🔌 5. Offline App Core & Jest Testing Resilience

To avoid compilation errors during automated Jest checks and headless test environments:

-   **No Native Network Packages**: Avoid standard native net utilities that bind to OS modules. Use the custom local checker (`OfflineBanner` + local API ping test) to safely monitor connection status.
-   **Mocking native UI components**: Ensure that any linear gradients, blur elements, or OS-native alerts are mocked in `src/__tests__/uiComponents.test.tsx` using Jest fake timers and module stubs.
