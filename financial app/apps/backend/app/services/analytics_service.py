from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models import Transaction
from typing import List, Dict, Any, Optional
import datetime
from collections import defaultdict

class AnalyticsService:
    @staticmethod
    def detect_subscriptions(db: Session, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Detects recurring payments based on identical amount and merchant frequency.
        Returns a list of potential subscriptions.
        """
        # Logic: 
        # 1. Group by Merchant (Description) and Amount.
        # 2. Filter groups with count >= 3 (to be safe) or >= 2 with specific date patterns.
        # 3. For now, strict check: Same Amount + Same Description + >= 2 occurrences.
        
        # Determine strictness: 2 occurrences might be coincidence, but 3 is a pattern.
        # Let's go with >= 3 for reliability, or >= 2 if spaced ~30 days apart (harder to do in SQL easily).
        # We'll fetch candidates > 2 occurrences first.
        
        query = db.query(
            Transaction.description,
            Transaction.amount,
            func.count(Transaction.transaction_id).label('frequency'),
            func.max(Transaction.transaction_date).label('last_paid')
        ).filter(
            Transaction.type == 'DEBIT' 
        ).group_by(
            Transaction.description,
            Transaction.amount
        ).having(
            func.count(Transaction.transaction_id) >= 2
        )
        
        candidates = query.all()
        subscriptions = []
        
        for desc, amount, freq, last_paid in candidates:
            # Secondary check: Periodicity
            # Fetch dates for this duplicate group
            txns = db.query(Transaction.transaction_date).filter(
                Transaction.description == desc,
                Transaction.amount == amount,
                Transaction.type == 'DEBIT'
            ).order_by(Transaction.transaction_date).all()
            
            dates = sorted([t[0] for t in txns])
            
            # Check intervals
            intervals = []
            for i in range(1, len(dates)):
                delta = (dates[i] - dates[i-1]).days
                intervals.append(delta)
            
            # If intervals are roughly consistent (e.g., 28-31 days for monthly, or 365 for yearly)
            # Or if it's exact same amount 3+ times, likely sub.
            # Loose heuristic: if any interval is 25-35 days, or if we have 3+ identical txns.
            
            is_subscription = False
            interval_type = "Irregular"
            avg_days = sum(intervals) / len(intervals) if intervals else 0

            # Monthly check
            if 25 <= avg_days <= 35:
                is_subscription = True
                interval_type = "Monthly"
            
            # Yearly check
            elif 360 <= avg_days <= 370:
                is_subscription = True
                interval_type = "Yearly"
                
            # Frequency override (if you paid Netflix 5 times, it's a sub regardless of precise day)
            if freq >= 3:
                is_subscription = True
                if interval_type == "Irregular": interval_type = "Recurring"
            
            if is_subscription:
                subscriptions.append({
                    "name": desc,
                    "amount": float(abs(amount)),
                    "frequency": freq,
                    "interval": interval_type,
                    "last_paid": last_paid,
                    "annual_cost": float(abs(amount)) * (12 if interval_type == "Monthly" else (1 if interval_type == "Yearly" else freq))
                })
        
        # Sort by Annual Cost desc
        subscriptions.sort(key=lambda x: x['annual_cost'], reverse=True)
        return subscriptions

    @staticmethod
    def get_daily_aggregates(db: Session, month: int, year: int) -> List[Dict[str, Any]]:
        """
        Returns total spend per day for the given month/year.
        Used for Calendar Heatmap.
        """
        daily_data = db.query(
            extract('day', Transaction.transaction_date).label('day'),
            func.sum(Transaction.amount).label('total')
        ).filter(
            extract('month', Transaction.transaction_date) == month,
            extract('year', Transaction.transaction_date) == year,
            Transaction.type == 'DEBIT' # Expenses only
        ).group_by(
            extract('day', Transaction.transaction_date)
        ).all()
        
        # Map to full month days (1-31)
        import calendar
        _, last_day = calendar.monthrange(year, month)
        
        results = []
        spend_map = {int(r[0]): abs(float(r[1] or 0)) for r in daily_data}
        
        for d in range(1, last_day + 1):
            amount = spend_map.get(d, 0)
            # Intensity: 0=None, 1=Low, 2=Med, 3=High
            # This logic ideally resides in frontend, but we pass raw value.
            results.append({
                "date": f"{year}-{month:02d}-{d:02d}",
                "count": amount, # Recharts calendar expects 'value' or 'count'
                "value": amount
            })
            
        return results
