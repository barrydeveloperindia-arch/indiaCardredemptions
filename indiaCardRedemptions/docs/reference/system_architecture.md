# The Points Array - System Architecture Specification

This document details the unified system architecture for **The Points Array** application, detailing component interactions and on-device sandbox boundaries.

---

## 🏗️ System Architecture Diagram

```mermaid
graph TB
    subgraph User Device (Local Sandbox)
        A[React Native UI / Expo Router] --> B[Local State Manager]
        B --> C[AsyncStorage Ledger]
        B --> D[On-Device PDF Parser]
        B --> E[Arbitrage Yield Engine]
        B --> F[Offline Matrix Cache]
    end

    subgraph External Cloud Services
        G[Duffel API Gateway]
        H[Google Gemini API]
    end

    D -.->|Extract Text| E
    E -->|Read Ratios| F
    A -->|Query Live Cash Price| G
    A -->|Consult Route Planning| H
```

---

## 🔌 Core Component Interfaces

### 1. The Local Wallet Ledger (`AsyncStorage`)
*   **Purpose**: Stores card lists, milestone targets, and current reward points balances offline.
*   **Interface**:
    ```typescript
    export interface CardWallet {
      cardId: string;
      cardName: string;
      currentPoints: number;
      annualSpend: number;
      lastUpdated: string;
    }
    ```
*   **TDD Validation**: Verify `walletStore.test.ts` writes, reads, and deletes objects from local storage mocks.

### 2. PDF Decryptor and Extractor (`pdfParser`)
*   **Purpose**: Securely reads binary data arrays on-device.
*   **Interface**:
    ```typescript
    export interface ScrapedStatement {
      pointsEarned: number;
      totalSpend: number;
      issuer: 'infinia' | 'atlas' | 'amex_plat';
    }
    ```
*   **TDD Validation**: Verify `pdfParser.test.ts` fails on unknown file schemas and extracts valid parameters on matches.

### 3. Yield Arbitrage & Stacking Engine
*   **Purpose**: Computes Point Values vs. Duffel Cash values.
*   **Interface**:
    ```typescript
    export interface YieldAnalysis {
      valuePerPoint: number;
      isRecommended: boolean;
      cashFallbackPrice?: number;
    }
    ```
*   **TDD Validation**: Assert `arbitrageCalculator.test.ts` accurately flags high-value options (> ₹1.5).

### 4. Gemini AI Payload Constructor
*   **Purpose**: Builds string contexts (RAG) mapping transfer options.
*   **Interface**:
    ```typescript
    export interface PromptContext {
      userBalances: string;
      activeMatrixRatios: string;
      userQuery: string;
    }
    ```
*   **TDD Validation**: Test text constructor to verify sensitive personal identifiers are stripped before dispatching payloads.
