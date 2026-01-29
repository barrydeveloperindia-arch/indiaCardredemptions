
import os
import sys
import logging
from collections import defaultdict
from sqlalchemy import create_engine, func
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

def main():
    db = SessionLocal()
    try:
        # Fetch all items
        items = db.query(InventoryItem).all()
        logger.info(f"Total Items Scanned: {len(items)}")

        # Group by Name (Normalized)
        grouped = defaultdict(list)
        for item in items:
            name_key = item.name.strip().lower()
            grouped[name_key].append(item)

        duplicates_found = 0
        items_deleted = 0

        for name, group in grouped.items():
            if len(group) < 2:
                continue

            duplicates_found += 1
            
            # Sort Strategy:
            # 1. Higher Stock (Primary)
            # 2. Higher Cost (Secondary - better data)
            # 3. ID Length (Tertiary - prefers ENG001 over ENG1)
            # 4. ID Value (Quaternary - deterministic tiebreaker)
            
            # We want the BEST item at index 0. So we sort Descending.
            group.sort(key=lambda x: (
                x.quantity_on_hand, 
                x.unit_cost, 
                len(x.item_id), 
                x.item_id
            ), reverse=True)

            keeper = group[0]
            to_remove = group[1:]

            logger.info(f"Processing '{item.name}':")
            logger.info(f"  ✅ KEEP: {keeper.item_id} (Stock: {keeper.quantity_on_hand}, Cost: {keeper.unit_cost})")
            
            for trash in to_remove:
                logger.info(f"  ❌ DELETE: {trash.item_id} (Stock: {trash.quantity_on_hand}, Cost: {trash.unit_cost})")
                db.delete(trash)
                items_deleted += 1

        if items_deleted > 0:
            db.commit()
            logger.info(f"\nCleanup Complete. Removed {items_deleted} duplicate items.")
        else:
            logger.info("\nNo duplicates found to remove.")

    except Exception as e:
        logger.error(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
