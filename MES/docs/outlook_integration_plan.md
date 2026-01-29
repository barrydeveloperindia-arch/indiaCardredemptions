# Outlook Email Intelligence Integration Plan

## Objective
Enable Englabs MES to securely access user Outlook emails to automatically extract project metadata, client communication details, and attachments, enriching the "Digital Thread" with external context.

## Architecture

### 1. Connectivity (Microsoft Graph API)
We will use the **Microsoft Graph API** to interface with Outlook.
*   **Authentication:** OAuth2 (Delegated Permissions). This requires the user to "Log in with Microsoft" once to grant access.
*   **Scope:** `Mail.Read`, `Mail.ReadWrite`, `User.Read`.

### 2. The Intelligence Engine (LLM-Based Extraction)
Raw emails are unstructured. We will use the existing **Gemini AI** integration to parse emails.
*   **Process:**
    1.  Fetch latest emails related to a specific Project ID (or scan Inbox).
    2.  Sanitize and send email body to Gemini.
    3.  **Prompt:** "Extract the following JSON metadata: Client Name, Agreed Budget, Deadlines, Technical Specs."
    4.  Update the `Project` record in Postgres.

## Implementation Steps

### Phase 1: Azure Configuration (User Action Required)
To access your Outlook, we need an "App ID" from Microsoft.
1.  Go to **Azure Portal** > App Registrations.
2.  Create new App "Englabs MES".
3.  Add Redirect URI: `http://localhost:8000/api/integrations/outlook/callback`.
4.  Generate **Client Secret**.
5.  **Output:** We need `CLIENT_ID`, `CLIENT_SECRET`, and `TENANT_ID`.

### Phase 2: Backend Authentication (FastAPI)
Create `src/integrations/outlook/auth.py`.
*   Endpoint: `/api/integrations/outlook/login` -> Redirects to Microsoft.
*   Endpoint: `/api/integrations/outlook/callback` -> Exchanges code for **Access Token**.
*   Store Refresh Token securely in DB (encrypted).

### Phase 3: The "Email Scraper" Service
Create `src/integrations/outlook/service.py`.
*   Function: `fetch_project_emails(project_id: str)`
    *   Search Query: `Subject:"{project_id}" OR Body:"{project_id}"`
*   Function: `parse_email_metadata(email_content: str)`
    *   Uses Gemini to extract structured data.

### Phase 4: Frontend Integration
*   Add "Sync with Outlook" button on **Project Dashboard**.
*   Show "Email Context" widget: "Last email from Client: 2 hours ago. Sentiment: Positive."

## Timeline
*   **Day 1:** Azure Setup & Auth Flow (Backend).
*   **Day 2:** Graph API Fetching & AI Parsing Logic.
*   **Day 3:** Frontend UI & Testing.

## Security Note
*   Email data is sensitive. We will ONLY process emails explicitly related to existing Projects (by keyword matching).
*   Tokens will be stored with encryption.
