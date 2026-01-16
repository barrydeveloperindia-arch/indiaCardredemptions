import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SyncSessionLocal, sync_engine
from app.models import CategoryRule, Base

def seed_broad_rules():
    db = SyncSessionLocal()
    
    # Broader Rules
    rules = [
        {
            "name": "General Food",
            "keywords": ["food", "mart", "bazaar", "cafe", "restaurant", "burger", "pizza"],
            "target_category": "Food & Dining",
            "target_tags": ["food"]
        },
        {
            "name": "UPI Payments",
            "keywords": ["upi", "pay", "google pay", "phonepe"],
            "target_category": "Transfers",
            "target_tags": ["upi"]
        },
        {
            "name": "Shopping",
            "keywords": ["shop", "store", "mall", "market"],
            "target_category": "Shopping",
            "target_tags": ["offline_shopping"]
        },
        {
            "name": "Health & Medicine",
            "keywords": ["pharmacy", "apollo", "medplus", "hospital", "clinic", "dr ", "medical", "1mg", "pharmeasy"],
            "target_category": "Health & Medicine",
            "target_tags": ["health"]
        },
        {
            "name": "Travel",
            "keywords": ["rail", "train", "flight", "air", "metro", "bus"],
            "target_category": "Travel",
            "target_tags": ["commute"]
        },
        {
            "name": "Utilities & Bills",
            "keywords": ["electricity", "power", "bijli", "water", "gas", "bill", "recharge", "broadband", "wifi", "airtel", "jio", "vodafone", "bescom", "tata sky"],
            "target_category": "Utilities",
            "target_tags": ["bills"]
        },
        {
            "name": "Hotels & Stay",
            "keywords": ["hotel", "motel", "resort", "inn", "bnb", "oyo", "taj", "marriott", "hyatt"],
            "target_category": "Travel",
            "target_tags": ["hotel", "travel"]
        },
        {
            "name": "Salary",
            "keywords": ["salary", "credited", "bonus", "payroll", "neft cr", "imps cr"],
            "target_category": "Salary",
            "target_tags": ["income"]
        },
        {
            "name": "Rent",
            "keywords": ["rent", "landlord", "toppo", "broker"],
            "target_category": "Housing",
            "target_tags": ["rent", "bills"]
        }
    ]
    
    print("Seeding Broad Rules...")
    for r in rules:
        exists = db.query(CategoryRule).filter(CategoryRule.name == r["name"]).first()
        if not exists:
            rule = CategoryRule(
                name=r["name"],
                keywords=r["keywords"],
                target_category=r["target_category"],
                target_tags=r["target_tags"]
            )
            db.add(rule)
            print(f"Added Rule: {r['name']}")
            
    db.commit()
    db.close()
    print("Broad Seeding Complete!")

if __name__ == "__main__":
    seed_broad_rules()
