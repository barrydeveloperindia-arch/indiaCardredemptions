# Zoho Books Feature Parity & Implementation Plan

## Executive Summary
This document outlines the roadmap for upgrading the Englabs MES financials module to match the feature set and user experience of Zoho Books. The goal is to provide a comprehensive "feature-for-feature" on-premise alternative, covering Invoicing, Estimates, Expenses, and Banking.

## 1. Gap Analysis

| Feature Area | Zoho Books | Englabs MES (Current) | Gap |
| :--- | :--- | :--- | :--- |
| **Estimates/Quotes** | Full lifecycle (Create -> Send -> Approve -> Convert to Invoice) | `PartAnalysis` generates a "Clone" price but no formal document. | **Critical**. Need `Estimate` model and UI workflow. |
| **Invoicing** | Recurring, Retainers, Templates, Payment Gateways | Basic `Invoice` table linked to Job Completion. | **High**. Need Recurring profiles, Status workflow (Draft/Sent/Paid/Void). |
| **Expenses** | Receipt Scanning, Categorization, Mileage, Recurring | `JournalEntry` (Manual Ledger). | **High**. Need dedicated `Expense` and `Bill` modules with receipt attachment. |
| **Banking** | Feeds, Reconciliation, Rules | None. | **Critical**. Need `BankAccount`, `Transaction`, `Reconciliation` models. |
| **Project/Time** | Timesheets, Billable Hours | `DispatchQueue` (Job Tracking). | **Medium**. Can extend Queue to act as Timesheets. |
| **Contacts** | CRM-lite (Customer Portal, Statements) | `User` (Basic RBAC). | **High**. Need dedicated `Customer` and `Vendor` tables with portal access. |

## 2. Database Schema Extensions
To support these features, we need to extend `src/database/models.py`.

### New Models:
1.  **`Contact`**: Replaces simple `client_id` string.
    *   `id`, `name`, `type` (Customer/Vendor), `email`, `currency`, `portal_status`.
2.  **`Estimate`**: 
    *   `id`, `contact_id`, `items` (JSON), `total`, `status` (Draft, Sent, Accepted, Declined), `expiry_date`.
3.  **`RecurringProfile`**:
    *   `id`, `transaction_type` (Invoice/Expense), `frequency`, `next_run_date`.
4.  **`Expense`**:
    *   `id`, `category_id`, `amount`, `vendor_id`, `is_billable`, `receipt_path`.
5.  **`BankAccount` & `BankTransaction`**:
    *   For manual or imported statement reconciliation.

## 3. API Roadmap (New Endpoints)

### Sales Module
*   `POST /api/estimates`: Create new estimate.
*   `POST /api/estimates/{id}/convert`: Convert accepted estimate to Invoice.
*   `GET /api/invoices/{id}/pdf`: Generate PDF (matches Zoho templates).
*   `POST /api/invoices/{id}/payment`: Record payment.

### Purchases Module
*   `POST /api/expenses`: Record expense.
*   `POST /api/bills`: Create vendor bill.

### Banking Module
*   `POST /api/banking/accounts`: Add account.
*   `POST /api/banking/import`: Upload CSV/OFX statement.

## 4. UI Workflow Implementation (Zoho-like)

### Navigation Update
The Sidebar should be reorganized into:
*   **Dashboard**: Financial Overview.
*   **Sales**: Estimates, Invoices, Customers.
*   **Purchases**: Expenses, Bills, Vendors.
*   **Banking**: Accounts, Feeds.
*   **Operations**: (Existing MES) PLM, Dispatch, Shop Floor.

### Workflow: Estimate to Cash
1.  **User** creates Estimate in `Sales > Estimates`.
2.  **System** sends PDF to Customer (email simulation).
3.  **Customer** clicks "Accept" in Portal (new view).
4.  **User** gets notification, converts Estimate to Invoice.
5.  **User** records payment against Invoice.

## 5. Implementation Phases

### Phase 1: Core Sales (Weeks 1-2)
*   Implement `Contact`, `Estimate` models.
*   Build Estimate Creation UI.
*   Implement "Convert to Invoice" logic.

### Phase 2: Purchases & Expenses (Week 3)
*   Implement `Expense`, `Bill` models.
*   Build Receipt Upload & Categorization UI.

### Phase 3: Banking & Reconciliation (Week 4)
*   Implement Banking models.
*   Build Reconciliation UI (matching bank lines to system entries).

### Phase 4: Client Portal (Week 5)
*   Build external-facing status page for Clients to view Estimates/Invoices.

## 6. Configuration & Seeding Details
Based on analysis of existing invoices (`C4805-EL40-INV-17361.pdf`), the system should be seeded with:

### Organization Profile
*   **Name**: Englabs India Pvt Ltd
*   **GSTIN**: 06AAFCE5136K1ZL
*   **PAN**: AAFCE5136K
*   **Address**: 2ND FLOOR UNIT NO.1021-1022, DISHA ARCADE SECTOR 4 MDC, PANCHKULA 134114, Haryana

### Banking Headers
*   **Bank**: IDFC First Bank
*   **Branch**: CHANDIGARH-SECTOR 9D
*   **Account No**: 10080234962
*   **IFSC**: IDFB0021218

### Invoice Template Settings
*   **Prefix**: `INV-`
*   **Numbering**: Incremental (e.g., 17361)
*   **Terms**: "30 Days"
*   **Tax Structure**: IGST / CGST+SGST (9%+9%) logic.
