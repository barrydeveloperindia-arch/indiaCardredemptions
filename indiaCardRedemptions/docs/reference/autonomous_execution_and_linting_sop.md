# Autonomous Execution, Commenting & Linting SOP

This document defines the protocols for autonomous implementation runs, commenting requirements, and strict code linting and formatting.

---

## 🤖 Autonomous Implementation Workflow

When executing coding tasks, the agent operates in a strict, test-first autonomous loop (TDD) and asset verification loop to ensure correctness and premium quality before commit/push, without requiring user manual edits:

```mermaid
graph TD
    A[Read Task Requirements] --> B[Write Failing Tests (Red Stage)]
    B --> C[Verify Test Fails]
    C --> D[Write Minimal Code/Implementation]
    D --> E[Run Lint & Test Check (Green Stage)]
    E -->|If Errors Exist| F[Apply Code/Asset Fixes]
    F --> E
    E -->|If 100% Green| G[Run Visual QA Verification Loop]
    G -->|Verify Asset Blending/Feathering| H[Commit Code & Git Push to Remote]
    H --> I[Finalize Work & Document Diff]
```

### Strict Test-First & Verification Policies
1. **TDD Mandatory for Code**: Any code changes or new logic must have a corresponding failing unit/integration test written and verified *before* writing the implementation.
2. **Visual Verification Loop**: Programmatic asset generation must be validated via automated quality check scripts (e.g. border feathering, gradient analysis) to verify that motifs blend seamlessly without jagged edges.
3. **Commit Gate**: Never commit or push changes unless all unit tests and visual verification tests are 100% passing.

### Git Remote Push Requirement
To ensure continuous delivery and absolute backup safety, a `git push` command targeting the remote repository must be run immediately following any feature completion.

---

## 📝 Code Commenting Standards

To maintain a clean and maintainable codebase, we enforce three strict commenting rules:

1.  **Focus on "Why" over "What"**: Do not write comments explaining trivial operations. Write comments detailing the underlying business logic, bank rules, or API constraints (e.g. why a specific point transfer capping is applied).
2.  **Explicit Math Formulations**: Every financial yield calculation (such as VPP calculation or stacking matrices) must include a comment showing the formal mathematical equation.
3.  **Standard JSDoc for Exports**: All utility functions and React Native component parameters must include clear JSDoc blocks specifying parameter definitions and return typings.
    ```typescript
    /**
     * Calculates the Value per Point (VPP) in INR.
     * Math: VPP = (Cash Price - Surcharges) / (Points Cost * Transfer Ratio)
     * 
     * @param cashPrice Cash price of the travel booking in INR
     * @param pointsCost Total points cost required for the ticket
     * @param transferRatio Ratios of points to miles conversion
     * @returns The calculated value per point in INR
     */
    export const calculateVpp = (
      cashPrice: number,
      pointsCost: number,
      transferRatio: number
    ): number => {
      // ...
    };
    ```

---

## 🔍 Strict Linting & Formatting Protocols

To ensure consistent style and prevent syntax warnings:

### 1. Toolchain Configurations
*   **Linter**: ESLint with `@typescript-eslint/recommended` plugins.
*   **Formatter**: Prettier configured with single quotes, trailing commas, and semi-colons.
*   **Pre-commit Verification**: Husky executes:
    ```bash
    npm run lint && npm run format --check
    ```

### 2. Forbidden Patterns
*   **No Implicit 'any'**: All TypeScript parameters must have explicit type declarations.
*   **No Unused Imports**: Unused imports will cause lint execution to fail.
*   **No Console Logs**: Debugging logs must be stripped or redirected to an error logging utility.
