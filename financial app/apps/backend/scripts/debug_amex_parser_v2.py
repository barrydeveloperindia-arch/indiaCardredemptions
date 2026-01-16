import sys
import os
import re
import pdfplumber

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.import_service import ImportService
from app.services.parser.amex_strategy import AmexStatementParser

def debug_amex_parsing():
    # Find the test file
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    statements_dir = os.path.join(base_dir, "statements")
    
    test_file = None
    for root, dirs, filenames in os.walk(statements_dir):
        for filename in filenames:
            if filename.lower().endswith('.pdf'):
                test_file = os.path.join(root, filename)
                break
        if test_file: break
        
    if not test_file:
        print("No PDF found in statements directory.")
        return

    print(f"Debugging with file: {test_file}")
    
    raw_text = ""
    with pdfplumber.open(test_file) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                raw_text += extracted + "\n"
    
    print("\n--- RAW TEXT START ---")
    print(raw_text[:2000]) # Print first 2000 chars
    print("--- RAW TEXT END ---\n")
    
    # Test Regex
    print("Testing Regex against lines...")
    parser = AmexStatementParser(raw_text)
    
    # Manually test the loop
    lines = raw_text.split('\n')
    match_count = 0
    for line in lines:
        line = line.strip()
        match = parser.TXN_PATTERN.search(line)
        if match:
             print(f"MATCH: {line}")
             match_count += 1
        else:
             # Only print interesting failures (containing digits maybe?)
             if re.search(r'\d+\.\d{2}', line):
                 print(f"FAIL:  {line}")

    print(f"\nTotal Matches: {match_count}")

if __name__ == "__main__":
    debug_amex_parsing()
