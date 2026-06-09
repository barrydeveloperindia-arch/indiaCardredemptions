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

---

## 🎨 6. Visual Asset Compilation & QA Pipeline

To maintain the luxury brand standard across marketing and editorial slides, the programmatic asset generation pipeline must enforce the following rules:

-   **Opaque Slide Outputs (RGBA to RGB conversion)**: Discard the alpha channel when saving final PNG slide outputs (`img.convert("RGB").save(...)`). Discarding transparency ensures that third-party image viewers do not render checkerboard grids through transparent background sections.
-   **Layer Overlays (Alpha Compositing)**: Never use standard `img.paste` with transparent masks on RGBA canvases, as it overwrites the destination's alpha channel. Use `Image.alpha_composite` with a temporary canvas to correctly blend glows, shadows, and motifs.
-   **Boundary Edge-Fade (120px margin)**: Apply a quadratic boundary fade to the margins of the motif assets. This fades all hard canvas boundaries (such as bottom floor reflections or side crops) to zero alpha, allowing 3D models to merge naturally with the slide background.
-   **Official Logo Assets**: Always use `updated_brand_logo.png` as the monogram. Run `remove_black_background` to remove its black box before pasting.
-   **Header Text Protection**: Shrink long titles dynamically to $46$pt (from $64$pt) when length exceeds 24 characters to prevent logo overlaps.
-   **VQA Automated Gate**: `scripts/test_image_blending.py` executes before commits to verify:
    *   $\ge 8000$ feathered pixels at motif boundaries.
    *   100% opacity in final slides.

---

## 🎬 7. Video Reels Rendering & Remotion Integration (June 2026 Update)

To support automated high-fidelity short-form video generation, the project includes a Remotion-based rendering subsystem:

-   **Remotion Subsystem ([`remotion-reel/`](file:///c:/Users/SAM/Documents/Antigravity/indiaCardredemptions/remotion-reel/))**: A React-based video compilation framework configured to render `.mp4` reel files.
-   **Asset Pre-generation ([`scripts/generate_reel_assets.py`](file:///c:/Users/SAM/Documents/Antigravity/indiaCardredemptions/indiaCardRedemptions/scripts/generate_reel_assets.py))**: A Python script that compiles high-resolution background assets, titles, and mathematical overlays tailored for a 9:16 aspect ratio. It keys out backgrounds, feathers borders, and places visual components in `/public` for Remotion to consume.
-   **Execution Sequence**:
    1. Run `python scripts/generate_reel_assets.py` to prepare the static graphics and configuration timing sheets.
    2. Run `npx remotion render` inside the `remotion-reel/` directory to generate the final video file (`out.mp4`).


