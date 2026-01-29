---
name: Outlook Intelligence Scanner
description: Scans Outlook emails for Project IDs (EQxxxx), POS, and Payments using AI analysis of content and attachments. Auto-links metadata to the MES Database.
version: 1.0
---

# Outlook Intelligence Scanner

This skill leverages Microsoft Graph API and Gemini AI to analyze customer communications and "stitch" them into the Digital Thread.

## Capabilities
1. **Deep Search**: Scans Email Subject, Body, and **Attachment Filenames**.
2. **AI Extraction**: Uses Gemini to identify:
   - Purchase Orders (PO)
   - Payment Vouchers
   - Approval/Go-Ahead signals
3. **ID Matching**: Locates `EQxxxx` (Enquiry ID) to link data to the correct Project.
4. **Auto-Linking**: Updates the `projects` database with found metadata.

## Usage

### 1. Run Scanner
```bash
python .agent/skills/outlook_intelligence_scanner/scripts/scanner.py "Search Query"
```
Example:
```bash
python .agent/skills/outlook_intelligence_scanner/scripts/scanner.py "Sonalika OR ITL"
```

## Configuration
- Requires `OUTLOOK_CLIENT_ID`, `OUTLOOK_CLIENT_SECRET`, `OUTLOOK_TENANT_ID` in env.
- Requires `GEMINI_API_KEY` in env.
- Requires `storage/outlook_token.json` (generated via `/api/integrations/outlook/login`).

## Logic Flow
1. Fetch recent emails matching query.
2. For each email:
   - download attachment metadata (filenames).
   - construct AI prompt with Subject, Body, Filenames.
3. AI returns JSON: `{ "type": "PO", "ids": ["NME 1752", "EQ4917"] }`.
4. Script updates DB:
   - If `EQ` found -> Locate Project.
   - If `PO` found -> Update `Project.po_number`.
   - If `Payment` found -> Update `Project.payment_status`.
