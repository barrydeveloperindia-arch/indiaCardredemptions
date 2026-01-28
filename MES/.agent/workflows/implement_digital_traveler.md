---
description: Implement Digital Job Traveler (PDF + QR)
---
# Implement Digital Job Traveler

This workflow implements the generation of PDF Job Sheets with QR codes for the Shop Floor.

## 1. Install Dependencies
// turbo
1. Add `qrcode[pil]` to `requirements.txt`.
2. Run `pip install qrcode[pil]`.
3. Rebuild docker container if needed (or just install in running container for dev).

## 2. Backend: PDF Service
1. Create `src/reporting/` directory.
2. Create `src/reporting/pdf_generator.py`.
   - Class `JobSheetGenerator`.
   - Method `generate_pdf(job_data, output_path)`.
   - Use `qrcode` library to generate a QR pointing to `http://<HOST>/jobs/{job_id}`.
   - Use `fpdf2` to layout the page: Header, Order Info, 3D View (placeholder or actual image path), QR Code, Footer.

## 3. Backend: API Endpoint
1. Create `src/reporting/router.py`.
2. Endpoint `GET /api/reporting/jobs/{job_id}/sheet`.
   - Fetches job/order details from DB.
   - Calls `JobSheetGenerator`.
   - Returns the PDF file as a `FileResponse`.
3. Register router in `main.py`.

## 4. Frontend: Print Button
1. Edit `src/frontend/components/DispatchBoard.jsx` or `JobCard.jsx`.
2. Add a "Print Job Sheet" icon/button.
3. On click, open `API_URL/api/reporting/jobs/{job_id}/sheet` in a new tab (triggering browser print/download).

## 5. Verification
1. Create a dummy order.
2. Click "Print Job Sheet".
3. Verify PDF contains:
   - Correct Job ID.
   - Scannable QR Code.
   - Readable text.
