# Data Migration & Ingestion Blueprint (OneDrive to MES)

This detailed blueprint outlines the strategy to import legacy project data and commercial documents from your OneDrive structure into the MES "Digital Thread".

## 1. Source Structure Analysis

We have mapped the concrete structure of the provided OneDrive location: `C:\Users\pc\Englabs India Pvt Ltd\Enquiries manager - 2025 ENQUIRIES`.

### A. Technical Data (CAD & Specs)
**Path**: `.../ENQUIRIES {Year}/{Client}/{Month}/{DD-MM-YYYY} {ProjectID}/`
*   **Root**: `ENQUIRIES 2025`, `ENQUIRIES 2024`
*   **Level 1 (Client)**: `AEBOCODE`, `BAJAJ`, etc. -> Maps to `Contact.name`.
*   **Level 2 (Month)**: `JANUARY`, `FEBRUARY`.
*   **Level 3 (Project)**: `27-01-2025 EQ17017` -> Maps to `Project` entity.
    *   **Date**: `27-01-2025` -> `Project.start_date`.
    *   **Project ID**: `EQ17017` -> `Project.project_id`.
*   **Level 4 (Assets)**: Contains `.step`, `.stl` files -> Maps to `Part`.

### B. Commercial Data (Invoices & Quotes)
**Path**: `.../FINANCE/SALES/{Year}/{Month}/{Client}/{Date}/`
*   **Root**: `FINANCE/SALES`
*   **Level 1 (Year)**: `2025`
*   **Level 2 (Month)**: `JANUARY`
*   **Level 3 (Client)**: `Aebocode Technologies` (Note: Slight naming variation from "AEBOCODE").
*   **Level 4 (Date)**: `27-01-2025`
*   **files**: `C3400-EL40-INV-16602.pdf` -> Maps to `Invoice`.

## 2. Ingestion Strategy

We will build a two-pass ingestion script: `scripts/ingest_legacy_data.py`.

### Pass 1: Project & Part Registration (The "Digital Twin")
**Goal**: Populate `projects`, `parts` and `files`.

1.  **Iterate `ENQUIRIES {Year}`**:
    *   Extract `Client` from folder name.
    *   Traverse to specific Project folders (`DD-MM-YYYY EQxxxx`).
2.  **Register Project**:
    *   Create `Project` record with `project_id=EQxxxx` and `start_date`.
    *   Create/Link `Contact` (Client). Note: Normalize names ("AEBOCODE" vs "Aebocode Technologies") using fuzzy matching or a normalization map.
3.  **Ingest Assets**:
    *   Walk through directory.
    *   Identify `.step`, `.stp`, `.stl` files.
    *   **Action**:
        *   Copy file to `storage/parts/{ProjectID}_{Filename}`.
        *   Create `Part` record in DB linked to Project.

### Pass 2: Commercial & Financial Linkage (The "Financial Thread")
**Goal**: Populate `invoices`, and `contacts`.

1.  **Scan `FINANCE/SALES`**:
    *   Traverse Year > Month > Client > Date.
2.  **Invoice Parsing**:
    *   Use `analyze_invoice.py` (Gemini) or filename regex (`INV-(\d+)`) to extract Invoice Number.
    *   **Linkage**:
        *   Match `Date` + `Client` to find the likely `Project` (EQxxxx) created in Pass 1.
        *   If no exact match, create an "Unlinked Invoice" linked only to the Contact.


## 3. Recommended Metadata Enhancements

To fully capture "Project Metadata" as requested, we will extend the schema to store:

*   **Project Status**: Derived from folder location (Archive vs Active) or PDF dates.
*   **Customer Link**: Derived from the folder tree (if organized by Client) or Quotation PDF.
*   **Technical Specs**: If technical drawings (PDFs) exist in the Project folder, they are linked as `Artifacts` to the Project.

## 4. Execution Plan (Parallel Implementation)

Since we are also implementing Zoho-like features, this ingestion matches perfectly.

1.  **Step 1: Schema Update (Now)**
    *   Create `Contact`, `Estimate`, `Project` (extended) models in `models.py`.
2.  **Step 2: Script Development**
    *   Build `scripts/ingest_legacy_data.py`.
3.  **Step 3: Dry Run**
    *   Run script in "Report Only" mode to verify it identifies Projects correctly.
4.  **Step 4: Live Import**
    *   Execute full import.

---

### Technical Implementation Snippet (Logic)

```python
# Pseudo-code for Pass 1
for entry in os.scandir(ONEDRIVE_ROOT):
    if entry.is_dir() and entry.name != "Commercial":
        project_id = entry.name
        # Create Project Record
        
        for file in walk(entry.path):
            if is_cad(file):
                # Import Part & Link to project_id
                
# Pseudo-code for Pass 2 (Commercial)
for pdf in os.scandir(COMMERCIAL_DIR):
    text = extract_text(pdf)
    project_match = find_project_id_in_text(text, known_project_ids)
    if project_match:
        # Create Estimate/Invoice linked to project_match
```
