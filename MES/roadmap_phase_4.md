# Phase 4: Intelligent Operations & "3YOURMIND" Features

This phase focuses on incorporating advanced workflow features inspired by industry leaders like 3YOURMIND, specifically targeting the "Digital Traveler", Post-Processing, and Smart Rescheduling.

## 1. Digital Job Traveler (PDF & QR Generation)
**Goal**: Replace paper routing sheets with a generated "Job Sheet" for every order.
- [ ] **QR Code Generation**: Generate a unique QR code for each `job_id` containing the URL to the MES Job Details page.
- [ ] **PDF Engine**: Use `fpdf2` to create a standard A4/Letter PDF containing:
    - 3D Thumbnail (Analysis screenshot).
    - Customer Info & Job Specifications.
    - Critical Dimensions (Bounding Box).
    - The QR Code.
- [ ] **Frontend**: Add "Print Job Sheet" button to the Dispatch Board and Order Details.

## 2. Post-Processing Workflow Tracking
**Goal**: Explicitly track time and costs for steps *after* printing (Washing, Curing, Finishing).
- [ ] **Database**: Update `DispatchQueue` or create `JobSteps` table to track:
    - `printing_time` vs `post_processing_time`.
    - Status statuses: `WASHING`, `CURING`, `FINISHING`.
- [ ] **Dispatch Board**: Add specific columns or "Sub-status" indicators for these steps.
- [ ] **Costing**: Update `InvoiceGenerator` to include "Post-Processing Labor" and "Consumables" (IPA, UV bulb usage).

## 3. Intelligent Rescheduling (Smart Dispatch)
**Goal**: Automate recovery from machine failures.
- [ ] **Telemetry Listener**: Enhance `OpcUaManager` (or mock) to detect `FAULT` or `OFFLINE` states.
- [ ] **Agent Logic**: If a machine goes offline while a job is `RUNNING` or `QUEUED`:
    1. Flag the job as `INTERRUPTED`.
    2. Search for the next available machine with matching capabilities (Material/Technology).
    3. Auto-reassign the job and notify the operator.

## 4. Automated "Quote-to-Invoice" Bridge
**Goal**: Seamless financial workflow.
- [ ] **Invoice Export**: Button to download Invoice as CSV (Xero/Quickbooks format) or JSON.
- [ ] **Payment Status**: Simple toggle for "Paid" vs "Pending" in the UI, linked to the `Invoice` table.

## Execution Order
1. **Digital Job Traveler**: Immediate value for shop floor visibility.
2. **Post-Processing**: Essential for accurate costing.
3. **Rescheduling**: Complex logic for robustness.
