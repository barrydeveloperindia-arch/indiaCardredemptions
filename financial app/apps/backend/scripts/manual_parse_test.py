import sys
import os
import pdfplumber

# Add project root to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.parser.factory import ParserFactory

def test_parsing():
    # Path to statements directory (at project root)
    # We are in apps/backend/scripts, so root is ../../../
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    statements_dir = os.path.join(base_dir, "statements")
    
    print(f"Looking for statements in: {statements_dir}")
    
    if not os.path.exists(statements_dir):
        print("Statements directory not found!")
        return

    # Walk through subdirectories to find the first PDF
    target_file = None
    for root, dirs, filenames in os.walk(statements_dir):
        for filename in filenames:
            if filename.lower().endswith('.pdf'):
                target_file = os.path.join(root, filename)
                break
        if target_file:
            break
    
    if not target_file:
        print("No PDF files found in statements directory or subdirectories.")
        return

    print(f"Testing with file: {target_file}")

    raw_text = ""
    try:
        with pdfplumber.open(target_file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    raw_text += text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return

    if not raw_text.strip():
        print("Could not extract text from PDF (might need OCR).")
        return

    print(f"Extracted {len(raw_text)} characters.")

    try:
        parser = ParserFactory.get_parser(raw_text)
        print(f"Identified Parser: {parser.__class__.__name__}")
        
        transactions = parser.parse()
        print(f"Found {len(transactions)} transactions.")
        
        print("\n--- First 5 Transactions ---")
        for txn in transactions[:5]:
            print(txn)
            
    except Exception as e:
        print(f"Parsing failed: {e}")

if __name__ == "__main__":
    test_parsing()
