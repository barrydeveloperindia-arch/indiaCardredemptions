# The Points Array - Technology Stack Specification

This document details the selected technologies, libraries, and frameworks for **The Points Array** mobile and desktop web applications, highlighting how TDD validation is configured for each layer.

---

## 🛠️ Core Technology Stack

### 1. Mobile Framework (Expo v55)
*   **Technology**: React Native via Expo v55.
*   **Reasoning**: Strict adherence to the `AGENTS.md` rule. Ensures cross-platform portability across iOS and Android with fast hot-reloading.
*   **TDD Validation**: Jest + `@testing-library/react-native` to run unit tests on UI screen renders.

### 2. File-Based Navigation (Expo Router)
*   **Technology**: Expo Router (v3 / file-based).
*   **Reasoning**: Maps folder structure directly to application routes (`src/app/index.tsx`, `src/app/deals.tsx`, etc.), simplifying layout orchestration.
*   **TDD Validation**: Mock route structures inside Jest configurations to test programmatic screen redirects (e.g. redirecting from portfolio checks to `consultation.tsx`).

### 3. Styling & Theming (Vanilla StyleSheet)
*   **Technology**: React Native `StyleSheet` API.
*   **Reasoning**: Custom corporate navy and silver theme rules. Provides optimized rendering and zero dependency issues compared to Tailwind overlays.

### 4. Local Statement Processing (PDF.js)
*   **Technology**: `pdfjs-dist` (Mozilla's PDF library).
*   **Reasoning**: Decrypts and parses credit card statement text completely in-memory on the client device.
*   **TDD Validation**: Mocking PDF streams and binary ArrayBuffers using node-builtins within Jest environment to assert correct parsing outputs.

### 5. API Client (Axios)
*   **Technology**: Axios + React Query (TanStack Query).
*   **Reasoning**: Simplifies fetching matrix updates and Duffel cash pricing with automatic retry loops and offline caching.
*   **TDD Validation**: Jest testing utilizing `axios-mock-adapter` to verify API fetch states without making live network requests.

### 6. AI Engine (Gemini API)
*   **Technology**: Google Gemini SDK (`@google/generative-ai`).
*   **Reasoning**: Powering the contextual AwardHack AI Concierge.
*   **TDD Validation**: Mock prompt response payloads to test fallback routing behavior when the model returns unexpected outputs.

---

## 🧪 TDD Stack Integration Pattern

```javascript
// Example Jest setup inside src/__tests__/setup.js
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => 'Mocked Concierge Itinerary Response' },
      }),
    }),
  })),
}));
```
