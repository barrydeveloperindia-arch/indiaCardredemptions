from sqlalchemy.orm import Session
from src.database.connection import SessionLocal
from src.database.models import InventoryItem

def seed_inventory():
    db = SessionLocal()
    items = [
        {"item_id": "MAT-PLA-BLUE", "name": "PLA Filament (Blue)", "material_type": "PLA", "quantity_on_hand": 50.0, "unit_cost": 25.0, "unit": "kg"},
        {"item_id": "MAT-STEEL-316", "name": "Stainless Steel 316 Rod", "material_type": "STEEL", "quantity_on_hand": 200.0, "unit_cost": 15.0, "unit": "m"},
        {"item_id": "COOLANT-A", "name": "Synthetic Coolant Type A", "material_type": "COOLANT", "quantity_on_hand": 1000.0, "unit_cost": 5.0, "unit": "L"}
    ]
    
    try:
        for i in items:
            exists = db.query(InventoryItem).filter(InventoryItem.item_id == i["item_id"]).first()
            if not exists:
                new_item = InventoryItem(**i)
                db.add(new_item)
                print(f"Added {i['name']}")
            else:
                print(f"Skipped {i['name']} (Exists)")
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_inventory()
