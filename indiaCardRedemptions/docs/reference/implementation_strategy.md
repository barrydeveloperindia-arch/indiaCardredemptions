# The Points Array - Core Features Implementation Strategy

This document outlines the step-by-step technical approach, code locations, and testing guidelines for implementing each of the seven master features in **The Points Array** mobile (React Native/Expo) and desktop web application.

---

## 🛠️ Folder Hierarchy & Organization

All logic and UI code are organized under standard directories:
*   **Core UI Screens**: `src/app/` (Expo Router file-based pages)
*   **Reusable Components**: `src/components/`
*   **Business & Math Utilities**: `src/utils/`
*   **Unit & UI Tests**: `src/__tests__/`

---

## 📋 Feature-by-Feature Implementation Strategy

### 📱 Feature 1: The Digital Wallet & Milestone Tracker
*   **Code Location**: 
    *   UI Screen: `src/app/index.tsx` (Dashboard page)
    *   Component: `src/components/WalletCard.tsx`, `src/components/MilestoneProgress.tsx`
    *   State Store: Local React Context or `AsyncStorage` for user wallet data.
*   **Technical Approach**: 
    *   Build a horizontal scroll list for active credit cards using a light shadow card component.
    *   Calculate milestones by comparing user-supplied annual spend values against hardcoded milestone bounds (e.g., Amex Plat Travel at ₹1.9L and ₹4L). Use progress bars styled in corporate navy.
*   **TDD Test Focus**: Verify `milestoneTracker.test.ts` asserts correct milestone progression and warns when dates approach expiry bounds.

---

### 🧮 Feature 2: Indian Transfer Matrix Engine
*   **Code Location**: 
    *   Static Rules: `src/constants/transferMatrix.json`
    *   Calculations: `src/utils/matrixEngine.ts`
*   **Technical Approach**: 
    *   Maintain a JSON database mapping each credit card points program to target transfer partners (airlines/hotels) with their specific conversion ratios (e.g., Amex MR to Marriott Bonvoy at 1:1, Axis Edge Miles to Accor at 5:2).
    *   Write a lookup function `getTransferRatio(cardId, partnerId)` returning the coefficient, transfer speeds, and active promotional warnings.
*   **TDD Test Focus**: Verify `loyaltyMatrixEngine.test.ts` accurately maps ratios and highlights devaluations.

---

### 🏨 Feature 3: Hotel Arbitrage Yield Calculator (with Point Sales)
*   **Code Location**: 
    *   UI Screen: `src/app/deals.tsx`
    *   Arbitrage Logic: `src/utils/arbitrageCalculator.ts`
*   **Technical Approach**: 
    *   Provide manual entry forms for: Cash price of booking (INR), Loyalty points cost, Card selector.
    *   Run the formula: `Value per Point (VPP) = Cash Price / (Points Cost * Transfer Ratio)`.
    *   Render a prominent corporate navy badge if `VPP > ₹1.5`.
    *   Incorporate active Points Purchase sales alerts (Hyatt/Marriott) by listing them in a scrolling feed component.
*   **TDD Test Focus**: Verify `arbitrageCalculator.test.ts` outputs correct yields and flags recommended deals.

---

### 📊 Feature 4: Insights Hub & MCC Checker (with HNW Audits)
*   **Code Location**: 
    *   UI Screen: `src/app/insights.tsx`
    *   Database: `src/constants/mccDatabase.json`
    *   Checker Logic: `src/utils/mccChecker.ts`
*   **Technical Approach**: 
    *   Use sliders to input annual spends. Graph net yield values against annual card fees using SVG chart components.
    *   Maintain a mapping of 500+ Indian merchants to MCC category IDs. Users search for a merchant and see which card in their wallet yields the highest multiplier.
    *   The "HNW Portfolio Audit" function aggregates annual spends and highlights potential yields. If calculated average yield is `< 5%`, display a warning prompting a strategy consultation booking.
*   **TDD Test Focus**: Verify `insightsEngine.test.ts` asserts proper MCC lookups and flags sub-optimal card portfolios.

---

### 🤖 Feature 5: AI Concierge (AwardHack AI)
*   **Code Location**: 
    *   UI Screen: `src/app/concierge.tsx`
    *   Backend Handler: `src/utils/aiHandler.ts`
*   **Technical Approach**: 
    *   Integrate Google Gemini API. Pass the user's current card points balances and the active Transfer Matrix JSON as system context (RAG) alongside the user's travel destination queries.
    *   Display conversational chat bubbles in alternating corporate navy and soft silver.
*   **TDD Test Focus**: Verify payload formatting functions generate clean, structured contexts for the model.

---

### 📅 Feature 6: Strategy Consultation Booking
*   **Code Location**: 
    *   UI Screen: `src/app/consultation.tsx`
*   **Technical Approach**: 
    *   Render a date/time selection grid using standard React Native calendar widgets.
    *   Write booking slots to local storage to mock confirmation schedules, and integrate a redirect confirmation screen.
*   **TDD Test Focus**: Assert calendar selection updates active booking state correctly.

---

### 🥞 Feature 7: Multi-Layer Stacking Visualizer
*   **Code Location**: 
    *   Component: `src/components/StackingVisualizer.tsx`
*   **Technical Approach**: 
    *   Display a vertical step-by-step timeline detailing transaction routing (e.g., Step 1: Buy HDFC Gyftr Voucher -> Step 2: Pay on SmartBuy -> Step 3: Redeem via Marriott).
    *   Compute the stacked yield: `Total Yield = Card Base Yield + Portal Accelerator Yield + Loyalty Program Accrual`.
*   **TDD Test Focus**: Verify calculation functions return correct compounded returns.
