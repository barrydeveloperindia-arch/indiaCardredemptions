import os
import shutil
import pdfplumber
import traceback
from app.services.parser.factory import ParserFactory
from app.services.rule_engine import RuleEngine
from app.models import Transaction, Account, Base, CategoryRule
from app.core.database import SyncSessionLocal
from sqlalchemy import select

class ImportService:
    INPUT_DIR = "data/documents"
    ARCHIVE_DIR = "data/archive"
    
    @classmethod
    def run_import(cls):
        """
        Scans INPUT_DIR for PDFs, extracts text, identifies parser, and saves transactions.
        Moves processed files to ARCHIVE_DIR.
        """
        print(f"Starting import from {cls.INPUT_DIR}...")
        
        # Ensure directories exist
        os.makedirs(cls.INPUT_DIR, exist_ok=True)
        os.makedirs(cls.ARCHIVE_DIR, exist_ok=True)
        
        results = {
            "processed": 0, # Transaction count
            "files_processed": 0,
            "failed": 0,
            "errors": []
        }
        
        db = SyncSessionLocal()
        
        # Initialize Rule Engine
        try:
             pass
        except:
            pass

        rule_engine = RuleEngine(db)
        
        try:
            files = [f for f in os.listdir(cls.INPUT_DIR) if f.lower().endswith('.pdf')]
            
            for filename in files:
                filepath = os.path.join(cls.INPUT_DIR, filename)
                try:
                    text_content = cls._extract_text_from_pdf(filepath)
                    
                    # Get Strategy
                    parser = ParserFactory.get_parser(text_content)
                    print(f"File {filename} matches parser: {type(parser).__name__}")
                    
                    # Parse
                    transactions_data = parser.parse()
                    
                    # Save to DB
                    parser_name = type(parser).__name__
                    count = cls._save_transactions(db, transactions_data, rule_engine, parser_name)
                    print(f"Saved {count} transactions from {filename} to {parser_name}")
                    
                    # Archive
                    shutil.move(filepath, os.path.join(cls.ARCHIVE_DIR, filename))
                    results["processed"] += count
                    results["files_processed"] += 1
                    
                except Exception as e:
                    print(f"Failed to process {filename}: {e}")
                    traceback.print_exc()
                    results["failed"] += 1
                    results["errors"].append(f"{filename}: {str(e)}")
            
            db.commit()
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
            
        return results

    @staticmethod
    def _extract_text_from_pdf(filepath: str) -> str:
        text = ""
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text

    @staticmethod
    def _save_transactions(db, transactions_data, rule_engine, parser_name="Unknown"):
        # 1. Identify/Create Account
        # Map parser name to Institution
        institution_map = {
            "HdfcStatementParser": "HDFC Bank",
            "SbiStatementParser": "SBI Card",
            "IciciStatementParser": "ICICI Bank",
            "AmexStatementParser": "American Express",
            "HsbcStatementParser": "HSBC",
        }
        inst_name = institution_map.get(parser_name, "Unknown Bank")
        
        # Find or Create Account
        account = db.query(Account).filter(Account.institution_name == inst_name).first()
        if not account:
            account = Account(
                institution_id=inst_name.lower().replace(" ", "_"),
                institution_name=inst_name,
                account_type="CREDIT", # Default assumption for now
                masked_account_number="XXXX"
            )
            db.add(account)
            db.commit() # Commit to get ID
            db.refresh(account)
            
        count = 0
        for txn_dict in transactions_data:
            # Check dupes (simple check by ref + date + amount)
            # existing = db.query(Transaction).filter(...) # Optimization for later
            
            txn = Transaction(
                transaction_date=txn_dict.get('date'),
                amount=txn_dict.get('amount'),
                description=txn_dict.get('description'),
                type=txn_dict.get('type'),
                category=txn_dict.get('category', 'Uncategorized'),
                reference_number=txn_dict.get('ref_number'),
                account_id=account.account_id 
            )
            
            # Apply Smart Rules
            rule_engine.apply(txn)
            
            db.add(txn)
            count += 1
        return count
