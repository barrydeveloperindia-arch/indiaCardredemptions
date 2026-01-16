from sqlalchemy.orm import Session
from src.database.models import InventoryItem, MaterialTransaction
from datetime import datetime

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
