from sqlalchemy.orm import Session
from src.database.models import InventoryItem, MaterialTransaction
from datetime import datetime
import pandas as pd
import io

class InventoryService:
    def get_all_items(self, db: Session):
        return db.query(InventoryItem).all()

    def get_item(self, db: Session, item_id: str):
        return db.query(InventoryItem).filter(InventoryItem.item_id == item_id).first()

    def create_item(self, db: Session, item_data: dict):
        item = InventoryItem(
            item_id=item_data["item_id"],
            name=item_data["name"],
            material_type=item_data["material_type"],
            quantity_on_hand=item_data.get("quantity_on_hand", 0.0),
            unit_cost=item_data.get("unit_cost", 0.0),
            unit=item_data["unit"]
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update_item(self, db: Session, item_id: str, updates: dict):
        item = self.get_item(db, item_id)
        if not item:
            return None
        
        for key, value in updates.items():
            if hasattr(item, key):
                setattr(item, key, value)
        
        db.commit()
        db.refresh(item)
        return item

    def delete_items(self, db: Session, item_ids: list[str]):
        # Batch delete
        db.query(InventoryItem).filter(InventoryItem.item_id.in_(item_ids)).delete(synchronize_session=False)
        db.commit()
        return True

    def update_stock(self, db: Session, item_id: str, quantity_change: float, job_id: str = None):
        """
        Positive quantity_change = Restock
        Negative quantity_change = Usage
        """
        item = self.get_item(db, item_id)
        if not item:
            raise ValueError(f"Item {item_id} not found")
        
        # Check sufficient stock for usage
        if quantity_change < 0 and (item.quantity_on_hand + quantity_change < 0):
             raise ValueError(f"Insufficient stock for {item_id}. Current: {item.quantity_on_hand}")

        # Update Qty
        item.quantity_on_hand += quantity_change
        
        # Log Transaction
        transaction = MaterialTransaction(
            item_id=item_id,
            job_id=job_id,
            quantity_change=quantity_change,
            timestamp=datetime.utcnow()
        )
        db.add(transaction)
        
        db.commit()
        db.refresh(item)
        return item

    def import_from_excel(self, db: Session, file_contents: bytes) -> dict:
        def clean_money(val):
            if pd.isna(val): return 0.0
            s = str(val).replace('₹', '').replace(',', '').strip()
            try:
                return float(s)
            except:
                return 0.0

        try:
            df = pd.read_excel(io.BytesIO(file_contents))
            
            # Normalize columns
            df.columns = [c.strip().lower() for c in df.columns]
            
            def get_col(candidates):
                for c in df.columns:
                    if c in candidates: return c
                return None
                
            col_code = get_col(['item code', 'code', 'id'])
            col_name = get_col(['name', 'item name', 'description'])
            col_unit = get_col(['unit', 'uom'])
            col_price = get_col(['price/unit', 'price', 'cost', 'unit cost'])
            
            if not (col_code and col_name):
                return {"status": "error", "message": "Missing necessary columns (Code, Name)"}

            count = 0
            updated = 0
            
            for idx, row in df.iterrows():
                code = str(row[col_code]).strip()
                name = str(row[col_name]).strip()
                
                if not code or code.lower() == 'nan': continue
                
                unit = "pcs"
                if col_unit and not pd.isna(row[col_unit]):
                    unit = str(row[col_unit]).replace('(', '').replace(')', '').strip()
                    if unit.startswith('in '): unit = unit[3:]
                
                price = 0.0
                if col_price:
                    price = clean_money(row[col_price])
                    
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
                    if existing.unit_cost != price or existing.unit != unit or existing.name != name:
                        existing.unit_cost = price
                        existing.unit = unit
                        existing.name = name
                        updated += 1
            
            db.commit()
            return {"status": "success", "added": count, "updated": updated}

        except Exception as e:
            return {"status": "error", "message": str(e)}
