import sys
import os
import io
import shutil

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.import_service import ImportService
from app.services.parser.factory import ParserFactory

def test_import_service():
    # Setup directories
    if not os.path.exists(ImportService.INPUT_DIR):
        os.makedirs(ImportService.INPUT_DIR)
        
    print(f"Testing ImportService with INPUT_DIR: {ImportService.INPUT_DIR}")
    
    # Create a dummy Amex PDF that the parser will recognize
    # Amex parser likely looks for specific keywords.
    # From seed_broad_rules or parser implementation, we can guess.
    # Or better, we just copy a real file if available?
    # Let's try to find a real file first.
    
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    statements_dir = os.path.join(base_dir, "statements")
    
    target_file = None
    for root, dirs, filenames in os.walk(statements_dir):
        for filename in filenames:
            if filename.lower().endswith('.pdf'):
                target_file = os.path.join(root, filename)
                break
    if target_file:
        print(f"Found real file: {target_file}")
        shutil.copy(target_file, os.path.join(ImportService.INPUT_DIR, "test_statement.pdf"))
    else:
        print("ERROR: No real PDF files found to test with. Please ensure 'statements' directory has PDFs.")
        return

    # Run Import
    try:
        results = ImportService.run_import()
        print("\n--- Import Results ---")
        print(results)
        
        if results['processed'] > 0 and results['files_processed'] == 1:
            print("SUCCESS: Processed 1 file and > 0 transactions.")
        elif results['files_processed'] == 1:
             print("PARTIAL SUCCESS: Processed 1 file but 0 transactions (might be parser issue or empty file).")
        else:
            print("FAILURE: Did not process files.")
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_import_service()
