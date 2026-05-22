# 🎨 The Points Array - Android UI Refurbish Master Checklist

This document serves as the official implementation plan and checklist for refurbishing the visual interface of "The Points Array" into a high-fidelity **Dark Luxury (Obsidian-Gold)** design system.

---

## 📅 Phase 1: Global Theme & Assets Refactoring
*   [ ] **Task 1.1: Design Tokens Refactor**  
    *   **Target File**: `src/constants/theme.ts`  
    *   **Action**: Change light and dark theme presets to match deep obsidian backgrounds (`#090A0F`), dark metal cards (`#14161F`), gold accents (`#D4AF37`), white primary text (`#F3F4F6`), and silver-gray secondary text (`#9CA3AF`).
*   [ ] **Task 1.2: Global Background Asset Swap**  
    *   **Target Files**: `src/app/index.tsx`, `src/app/explore.tsx`, `src/app/insights.tsx`, `src/app/intel.tsx`, `src/app/deals.tsx`, `src/app/concierge.tsx`  
    *   **Action**: Swap all occurrences of `minimalist_white_luxury_bg.png` with the new generated `dark_luxury_bg.png`. Set image opacity and background tints to harmonize elements.
*   [ ] **Task 1.3: Navigation & System Overrides**  
    *   **Target File**: `src/app/_layout.tsx`  
    *   **Action**: Update default theme configuration hooks and add a dark-theme Status Bar overlay configuration to prevent white-bar visual clipping on physical Android devices.

---

## 🛠️ Phase 2: Custom Premium Component Refactoring
*   [ ] **Task 2.1: Metallic Wallet Card Cards**  
    *   **Target File**: `src/components/WalletCard.tsx`  
    *   **Action**: Redesign credit card visuals to render with premium metallic gradient finishes, fine gold-border parameters, holographic chip simulation boxes, and aligned VISA/AMEX issuer badges.
*   [ ] **Task 2.2: Premium Interactive Sliders**  
    *   **Target File**: `src/components/PremiumSlider.tsx`  
    *   **Action**: Replace native sliding tracks with dynamic custom-drawn gradient lines, floating value indicators, and feedback animations.
*   [ ] **Task 2.3: Monetization Promos Upgrade**  
    *   **Target File**: `src/components/AffiliateEngine.tsx`  
    *   **Action**: Refactor promotional modules into high-converting premium highlight boxes featuring linear gold gradients and clean typography.

---

## 📱 Phase 3: Screen-by-Screen UI Refactoring
*   [ ] **Task 3.1: Home Landing Page (`src/app/index.tsx`)**  
    *   *Search Bar*: Replace flat input with a floating glassmorphic tray containing a subtle golden focus glow.  
    *   *Milestone Radar*: Replace linear tracker rows with glowing gauge lines and milestone completion markers.  
    *   *VIP Action Banner*: Redesign premium service CTA card using dark gradients (`#1C1E24` to `#0B0C10`) and gold borders.
*   [ ] **Task 3.2: Arbitrage Yield Analyzer (`src/app/explore.tsx`)**  
    *   *Yield Display*: Scale the RpP text sizing and color-code indicators based on yields (ELITE = glowing green, AVOID = soft crimson).  
    *   *Quick Deal Presets*: Upgrade preview card thumbnail containers with rounded glass layers and dark gradients.  
    *   *Transfer Pathways*: Apply glowing feasibility indicators.
*   [ ] **Task 3.3: Insights & Hacks Page (`src/app/insights.tsx`)**  
    *   *MCC Checker*: Redesign the input field and search indicators to match a high-end dashboard interface.  
    *   *Stacking Flow Diagrams*: Render connected multi-step flowcharts utilizing golden node bubbles and alignment guidelines.  
    *   *Pro Paywall*: Refurbish the overlay with high-blur backdrops, central lock icons, and elegant CTA buttons.
*   [ ] **Task 3.4: Live Buy Deals Tracker (`src/app/deals.tsx`)**  
    *   *Deals Feed*: Display active promotions inside floating glass cards.  
    *   *Cost Math Box*: Format cost per point values into highlighted tabular modules.
*   [ ] **Task 3.5: Intelligence Hub (`src/app/intel.tsx`)**  
    *   *Devaluation Cards*: Highlight risk ratings in gold-framed crimson containers.  
    *   *News Timeline*: Add vertical connecting lines between articles for a cohesive timeline structure.
*   [ ] **Task 3.6: Booking & Input Forms (`src/app/concierge.tsx` & `src/app/consultation.tsx`)**  
    *   *Form Inputs*: Restyle text inputs with floating labels and gold focus borders.  
    *   *Action Buttons*: Implement metallic gold CTA buttons.

---

## 🧪 Phase 4: Test Alignment & Quality Assurance
*   [ ] **Task 4.1: Test Suite Sync**  
    *   **Target File**: `src/__tests__/uiComponents.test.tsx`  
    *   **Action**: Ensure that UI snapshots and element query assertions align with the updated component hierarchies.
*   [ ] **Task 4.2: Code Green Verification**  
    *   **Action**: Run `npm run lint` and `npm run test` to confirm clean compiler status and test passing rate.
