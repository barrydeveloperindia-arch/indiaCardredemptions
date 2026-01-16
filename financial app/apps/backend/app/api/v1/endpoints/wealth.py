from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_sync_db
from app.models import Asset, Account, Transaction
from pydantic import BaseModel
from typing import List, Optional, Any
import uuid

router = APIRouter()

class AssetCreate(BaseModel):
    name: str # e.g. "SGB 2024"
    type: str # GOLD, STOCK...
    current_value: float

class AssetResponse(AssetCreate):
    asset_id: Any
    last_updated: Any

class NetWorthResponse(BaseModel):
    total_net_worth: float
    total_assets: float
    total_liabilities: float
    assets_breakdown: List[AssetResponse]
    accounts_breakdown: Any # Dict details

@router.get("/net-worth", response_model=NetWorthResponse)
def get_net_worth(db: Session = Depends(get_sync_db)):
    """
    Calculate Net Worth = (Assets + Positive Accounts) - (Credit Card Balances).
    """
    # 1. Fetch Manual Assets
    assets = db.query(Asset).all()
    manual_assets_total = sum(a.current_value for a in assets)
    
    # 2. Fetch Accounts
    accounts = db.query(Account).all()
    
    # Logic:
    # Savings/Checking: Usually positive balance.
    # Credit Cards: Usually negative balance (Liability).
    # But API/DB might store CC spend as Positive (Limit Used) or Negative (Balance).
    # Convention in this app so far: DEBIT txns are negative/positive depending on parser.
    # Account.current_value field? It's `current_balance`.
    # Let's assume `current_balance` > 0 means YOU HAVE MONEY (Asset), < 0 means YOU OWE (Liability).
    # OR for CC, > 0 often means OWE.
    # Let's check Account Type.
    
    assets_from_accounts = 0.0
    liabilities_from_accounts = 0.0
    
    acc_details = []
    
    for acc in accounts:
        bal = acc.current_balance or 0.0
        # Normalization logic
        if "credit" in acc.account_type.lower() or "card" in acc.account_type.lower():
            # If positive, usually means debt in many aggregators, but sometimes negative.
            # Let's assume ABS(bal) is debt if it's a credit card.
            # Ideally negative means debt. Let's start with raw check.
            # If standard convention: +1000 in bank = Asset. -500 in CC = Liability.
            if bal < 0:
                liabilities_from_accounts += abs(bal)
            else:
                # If positive balance in CC, it's weird (refunds?), treat as asset or debt?
                # Usually aggregators return positive for "Outstanding Amount".
                liabilities_from_accounts += bal
        else:
            # Bank Account
            if bal >= 0:
                assets_from_accounts += bal
            else:
                # Overdraft?
                liabilities_from_accounts += abs(bal)
        
        acc_details.append({
            "name": acc.institution_name,
            "balance": bal,
            "type": acc.account_type
        })

    total_assets = manual_assets_total + assets_from_accounts
    total_liabilities = liabilities_from_accounts
    net_worth = total_assets - total_liabilities
    
    return NetWorthResponse(
        total_net_worth=net_worth,
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        assets_breakdown=[
            AssetResponse(
                asset_id=a.asset_id,
                name=a.name,
                type=a.type,
                current_value=a.current_value,
                last_updated=a.last_updated
            ) for a in assets
        ],
        accounts_breakdown=acc_details
    )

@router.post("/assets", response_model=AssetResponse)
def create_asset(asset: AssetCreate, db: Session = Depends(get_sync_db)):
    new_asset = Asset(
        asset_id=uuid.uuid4(),
        name=asset.name,
        type=asset.type,
        current_value=asset.current_value
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

@router.delete("/assets/{asset_id}")
def delete_asset(asset_id: str, db: Session = Depends(get_sync_db)):
    db.query(Asset).filter(Asset.asset_id == asset_id).delete()
    db.commit()
    return {"status": "deleted"}
