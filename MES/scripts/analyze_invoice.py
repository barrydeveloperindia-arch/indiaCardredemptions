
import os
import sys
import json
import google.generativeai as genai
from pypdf import PdfReader

# Force utf-8 for stdout
sys.stdout.reconfigure(encoding='utf-8')

# Configuration
PDF_PATH = r"C:\Users\pc\Englabs India Pvt Ltd\Enquiries manager - 2025 ENQUIRIES\FINANCE\SALES\2026\AEBOCODE\JANUARY\INVOICES\01-01-2026\C4805-EL40-INV-17361.pdf"
GEMINI_API_KEY = "AIzaSyAQib5iRpK6u01A6XpIpju9q8dBEC2RaEk" # Hardcoded from docker-compose for now

def extract_text_from_pdf(path):
    try:
        reader = PdfReader(path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

def analyze_with_gemini(text):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-flash-latest')
    
    prompt = f"""
    You are an expert financial analyst for a Manufacturing Execution System (MES).
    Analyze the following invoice text:
    
    {text}
    
    Extract the following information in strict JSON format:
    1. "company_details": {{ "name", "address", "gstin", "bank_details": {{ "bank_name", "account_number", "ifsc" }} }}
    2. "customer_details": {{ "name", "billing_address", "shipping_address" }}
    3. "invoice_meta": {{ "invoice_number", "date", "po_reference", "payment_terms" }}
    4. "line_items": [ {{ "description", "hsn_sac", "quantity", "unit_rate", "tax_rate", "total_amount", "part_name_guess" }} ]
    5. "totals": {{ "subtotal", "tax_total", "grand_total" }}

    Output ONLY the JSON.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return None

if __name__ == "__main__":
    print(f"Reading invoice: {PDF_PATH}")
    raw_text = extract_text_from_pdf(PDF_PATH)
    
    if raw_text:
        print(f"Text extracted ({len(raw_text)} chars). Analyzing with Gemini...")
        json_result = analyze_with_gemini(raw_text)
        
        if json_result:
            # Clean markup if present
            clean_json = json_result.replace("```json", "").replace("```", "")
            print("--- ANALYSIS RESULT ---")
            print(clean_json)
            
            # Save to file for seeding
            with open("invoice_data.json", "w", encoding='utf-8') as f:
                f.write(clean_json)
            print("--- SAVED TO invoice_data.json ---")
        else:
            print("Failed to analyze.")
    else:
        print("Failed to extract text.")
