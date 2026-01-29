import os
import sys
import logging
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add src to pythonpath
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.database.models import InventoryItem
from src.database.connection import DATABASE_URL

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# DB Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

EXCEL_PATH = r"C:\Users\pc\Documents\Antigravity\MES\storage\inventory\inventory.xlsx"

def clean_money(val):
    if pd.isna(val): return 0.0
    s = str(val).replace('₹', '').replace(',', '').strip()
    try:
        return float(s)
    except:
        return 0.0

def main():
    if not os.path.exists(EXCEL_PATH):
        logger.error(f"Excel file not found at {EXCEL_PATH}")
        return

    db = SessionLocal()
    try:
        logger.info(f"Reading Excel: {EXCEL_PATH}")
        df = pd.read_excel(EXCEL_PATH)
        
        # Normalize columns (strip whitespace, lowercase)
        df.columns = [c.strip().lower() for c in df.columns]
        
        # Expected columns mapping attempt
        # Adjust these based on actual excel headers if needed
        # We expect: 'item code', 'name', 'unit', 'price/unit'
        
        # Helper to find column
        def get_col(candidates):
            for c in df.columns:
                if c in candidates: return c
            return None
            
        col_code = get_col(['item code', 'code', 'id'])
        col_name = get_col(['name', 'item name', 'description'])
        col_unit = get_col(['unit', 'uom'])
        col_price = get_col(['price/unit', 'price', 'cost', 'unit cost'])
        
        if not (col_code and col_name):
            logger.error("Could not verify essential columns (Code, Name). Found: " + str(df.columns))
            return

        count = 0
        updated = 0
        
        for idx, row in df.iterrows():
            code = str(row[col_code]).strip()
            name = str(row[col_name]).strip()
            
            if not code or code.lower() == 'nan': continue
            
            unit = "pcs" # default
            if col_unit and not pd.isna(row[col_unit]):
                unit = str(row[col_unit]).replace('(','').replace(')','').strip()
                if unit.startswith('in '): unit = unit[3:]
            
            price = 0.0
            if col_price:
                price = clean_money(row[col_price])
                
            # DB Operation
            existing = db.query(InventoryItem).filter(InventoryItem.item_id == code).first()
            
            if not existing:
                item = InventoryItem(
                    item_id=code,
                    name=name,
                    material_type="OTHER",
                    quantity_on_hand=0,
                    unit_cost=price,
                    unit=unit
                )
                db.add(item)
                count += 1
            else:
                # Update if exists - Force update Name as well to ensure Excel is source of truth
                if existing.unit_cost != price or existing.unit != unit or existing.name != name:
                    existing.unit_cost = price
                    existing.unit = unit
                    existing.name = name
                    updated += 1
        
        db.commit()
        logger.info(f"Import Complete. Added: {count}, Updated: {updated}")

    except Exception as e:
        logger.error(f"Import Failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
