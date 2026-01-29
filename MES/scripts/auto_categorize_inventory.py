
import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add src to pythonpath
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.database.models import InventoryItem
from src.database.connection import DATABASE_URL

# Logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# DB Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def classify_item(name):
    n = name.lower()
    
    # Rules - Priority Order Matters
    if any(x in n for x in ['paint', 'primer', 'coat', 'hardner', 'lacquer', 'dye', 'chemical', 'thinner', 'putty', 'duco', 'hikott', 'sevens', 'sbl', 'asian']):
        return "Paints & Chemicals"
    
    if any(x in n for x in ['glue', 'fevicol', 'fevikwik', 'fevibond', 'araldite', 'adhesive']):
        return "Adhesives"
    
    if any(x in n for x in ['cell', 'battery', 'bettrey', '9v', 'aa', 'aaa', 'lithium', 'volt']):
        return "Electronics & Power"
    
    if any(x in n for x in ['tape', 'sticker', 'label', 'lamination']):
        return "Tapes & Adhesives" 
        
    if any(x in n for x in ['paper', 'note', 'envelope', 'book', 'clip', 'pin', 'pen', 'pencil', 'marker', 'ink', 'sharpner', 'card', 'register', 'file', 'diary', 'day book', 'clay']):
        return "Stationery"
    
    if any(x in n for x in ['blade', 'cutter', 'brush', 'tool', 'scissor']):
        return "Tools"
    
    if any(x in n for x in ['screw', 'insert', 'nut', 'bolt', 'washer', 'm3', 'm4']):
        return "Hardware"
        
    if any(x in n for x in ['clean', 'vim', 'harpic', 'colin', 'dettol', 'tissue', 'odonil', 'cloth', 'gel', 'soap', 'wash']):
        return "Housekeeping"
        
    if any(x in n for x in ['glove', 'mask', 'safety']):
        return "Safety Gear"
        
    if any(x in n for x in ['box', 'bag', 'wrap', 'courier']):
        return "Packaging"

    return "General"

def main():
    db = SessionLocal()
    try:
        items = db.query(InventoryItem).all()
        logger.info(f"Categorizing {len(items)} items...")
        
        counts = {}
        
        for item in items:
            new_type = classify_item(item.name)
            item.material_type = new_type
            counts[new_type] = counts.get(new_type, 0) + 1
            
        db.commit()
        
        logger.info("\n--- Categorization Summary ---")
        for cat, count in sorted(counts.items(), key=lambda x: x[1], reverse=True):
            logger.info(f"{cat}: {count} items")
            
    except Exception as e:
        logger.error(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
