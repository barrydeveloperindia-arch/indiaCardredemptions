from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_sync_db
from app.models import Budget, Transaction
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class BudgetSetRequest(BaseModel):
    category: str
    month: str # YYYY-MM
    limit: float
    is_rollover: bool = False

class BudgetProgress(BaseModel):
    category: str
    limit: float
    spend: float
    percentage: float
    rollover_added: float = 0.0

@router.post("/set")
def set_budget(req: BudgetSetRequest, db: Session = Depends(get_sync_db)):
    """
    Set or update a budget for a category/month.
    """
    existing = db.query(Budget).filter(
        Budget.category == req.category, 
        Budget.month == req.month
    ).first()
    
    if existing:
        existing.limit_amount = req.limit
        existing.is_rollover = req.is_rollover
    else:
        new_budget = Budget(
            category=req.category,
            month=req.month,
            limit_amount=req.limit,
            is_rollover=req.is_rollover
        )
        db.add(new_budget)
    
    db.commit()
    return {"status": "Budget set", "category": req.category, "limit": req.limit, "rollover": req.is_rollover}

def calculate_spend(db: Session, category: str, month_str: str) -> float:
    year, m = map(int, month_str.split('-'))
    total = db.query(func.sum(Transaction.amount)).filter(
        Transaction.category == category,
        func.extract('year', Transaction.transaction_date) == year,
        func.extract('month', Transaction.transaction_date) == m,
        Transaction.type == 'DEBIT'
    ).scalar() or 0.0
    return abs(total)

import datetime
from dateutil.relativedelta import relativedelta

@router.get("/progress", response_model=List[BudgetProgress])
def get_budget_progress(month: str, db: Session = Depends(get_sync_db)):
    """
    Get progress for all categories with a budget for the given month.
    Includes rollover logic.
    """
    budgets = db.query(Budget).filter(Budget.month == month).all()
    results = []
    
    current_date = datetime.datetime.strptime(month, "%Y-%m").date()
    prev_month_date = current_date - relativedelta(months=1)
    prev_month_str = prev_month_date.strftime("%Y-%m")
    
    for b in budgets:
        spend = calculate_spend(db, b.category, month)
        limit = b.limit_amount
        rollover = 0.0
        
        if b.is_rollover:
            # Check previous month
            prev_b = db.query(Budget).filter(Budget.month == prev_month_str, Budget.category == b.category).first()
            if prev_b:
                prev_spend = calculate_spend(db, b.category, prev_month_str)
                unused = max(0, prev_b.limit_amount - prev_spend)
                rollover = unused
                limit += rollover
        
        pct = (spend / limit * 100) if limit > 0 else 0
        
        results.append({
            "category": b.category,
            "limit": limit,
            "spend": spend,
            "percentage": round(pct, 1),
            "rollover_added": rollover
        })
        
    return results

@router.get("/safe-to-spend")
def get_safe_to_spend(db: Session = Depends(get_sync_db)):
    """
    Calculate Daily Safe-to-Spend amount for remaining days of month.
    """
    today = datetime.date.today()
    month_str = today.strftime("%Y-%m")
    
    # 1. Get Total Budget for current month
    budgets = db.query(Budget).filter(Budget.month == month_str).all()
    total_budget = sum(b.limit_amount for b in budgets) # Ignore rollover for simplicity or include? Let's ignore complex rollover for global safe-to-spend for now.
    
    # 2. Get Total Spend for these categories
    categories = [b.category for b in budgets]
    if not categories:
        return {"daily_limit": 0, "remaining": 0, "days_left": 0}
        
    total_spend = db.query(func.sum(Transaction.amount)).filter(
        Transaction.category.in_(categories),
        func.extract('year', Transaction.transaction_date) == today.year,
        func.extract('month', Transaction.transaction_date) == today.month,
        Transaction.type == 'DEBIT'
    ).scalar() or 0.0
    total_spend = abs(total_spend)
    
    # 3. Days Remaining
    import calendar
    _, days_in_month = calendar.monthrange(today.year, today.month)
    days_left = max(1, days_in_month - today.day + 1) # Including today? safely yes.
    
    remaining = max(0, total_budget - total_spend)
    daily_limit = remaining / days_left
    
    return {
        "daily_limit": round(daily_limit, 2),
        "remaining": remaining,
        "days_left": days_left,
        "total_budget": total_budget,
        "total_spend": total_spend
    }
