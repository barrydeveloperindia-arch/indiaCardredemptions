# Data Migration Blueprint
## Overview
This document outlines the strategy for migrating legacy data from the company's OneDrive "Enquiries Manager" into the new MES Database.

The migration follows a **Hybrid Ingestion Strategy**, combining structured metadata from the Master Excel Register with unstructured file data from the file system.

## Data Sources

### 1. Master Excel Register (Primary Metadata Source)
*   **Source File**: `ENQUIRIES REGISTER_SA UPDATED - 13-11.xlsx`
*   **Sheet Used**: `MASTER LIST`
*   **Key Fields Mapped**:
    *   `EQ NO` -> **Project ID** (Unique Key)
    *   `DESCRIPTION` -> **Project Name**
    *   ` FROM` -> **Client / Customer Name**
    *   `DATE` -> **Start Date**
    *   `STATUS` -> **Project Status** (Active/Closed)

### 2. OneDrive Folder Structure (File Repository)
*   **Source Root**: `Enquiries manager - 2025 ENQUIRIES/`
*   **Structure**: `Client Name` / `Project Folder (Date EQ)` / `Files`
*   **Function**:
    *   The system scans these folders to find CAD files (`.step`, `.stl`, `.sldprt`).
    *   It matches them to Projects created from the Excel Register via fuzzy matching or Project ID extraction.

## Migration Logic

1.  **Phase 1: Seed Metadata (Excel)**
    *   Read the `MASTER LIST` sheet.
    *   Create `Contact` records for every unique name in the ` FROM` column.
    *   Create `Project` records using `EQ NO` as the primary key.
    *   *Result*: A clean, structured list of all historical projects and clients in the MES Dashboard.

2.  **Phase 2: Ingest Assets (File Scan)**
    *   Traverse the OneDrive directories.
    *   When a CAD file is found, identify the parent project folder.
    *   Link the file to the corresponding `Project` record in the database.
    *   Copy the file to the MES local storage (`/storage/parts/`).
    *   Auto-generate a viewable STL for the 3D Viewer.

3.  **Phase 3: Commercial Data**
    *   Scan the `FINANCE/SALES` directories for Invoices (`.pdf`).
    *   Link Invoices to Projects based on Client Name and Date.

## Handling "Offline" Files
*   OneDrive "Online-only" files (placeholders) will likely fail the file copy process.
*   **Mitigation**: The script implements `try-catch` blocks to skip inaccessible files and logs them. The user must ensure "Always Keep on this device" is checked for critical folders if comprehensive asset availability is required.
