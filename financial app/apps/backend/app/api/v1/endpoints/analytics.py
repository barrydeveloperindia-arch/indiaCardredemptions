from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.core.database import get_sync_db
from app.models import Transaction, Account
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

router = APIRouter()

class TrendPoint(BaseModel):
    period: str # YYYY or YYYY-MM
    spend: float
    income: float

class CardAnalytics(BaseModel):
    account_name: str
    total_spend: float
    trend: List[TrendPoint]

@router.get("/card-trends", response_model=List[CardAnalytics])
def get_card_trends(
    period_type: str = "month", # 'year' or 'month'
    year: Optional[int] = None, 
    db: Session = Depends(get_sync_db)
):
    """
    Get spending trends grouped by Account (Card).
    Uses efficient SQL grouping.
    """
    
    # Date format string for PostgreSQL
    date_fmt = 'YYYY-MM' if period_type == 'month' else 'YYYY'
    
    # 1. Query: Group by Account + Period
    # Select account_id, TO_CHAR(date), SUM(amount)
    
    query = db.query(
        Transaction.account_id,
        func.to_char(Transaction.transaction_date, date_fmt).label('period'),
        func.sum(Transaction.amount).label('total_spend')
    ).filter(
        Transaction.type == 'DEBIT' # Debits only
    )

    if year and period_type == 'month':
         query = query.filter(extract('year', Transaction.transaction_date) == year)

    rows = query.group_by(
        Transaction.account_id,
        func.to_char(Transaction.transaction_date, date_fmt)
    ).all()
    
    # 2. Fetch Account Names
    acc_ids = {r[0] for r in rows if r[0]}
    accounts = db.query(Account).filter(Account.account_id.in_(acc_ids)).all()
    acc_map = {a.account_id: f"{a.institution_name} - {a.masked_account_number}" for a in accounts}
    
    # 3. Restructure Data
    # Map: AccountID -> { total: X, trend: [...] }
    grouped = {}
    
    for r in rows:
        acc_id = r[0]
        period = r[1]
        spend = abs(float(r[2] or 0)) # Convert to positive for visualization
        
        # Determine Name
        name = acc_map.get(acc_id, "Unclassified / Cash")
        
        if name not in grouped:
            grouped[name] = {"total_spend": 0, "trend": []}
            
        grouped[name]["total_spend"] += spend
        grouped[name]["trend"].append({"period": period, "spend": spend, "income": 0})
        
    # Convert to List
    results = []
    for name, data in grouped.items():
        # Sort trend by date
        data["trend"].sort(key=lambda x: x["period"])
        
        results.append({
            "account_name": name,
            "total_spend": data["total_spend"],
            "trend": data["trend"]
        })
        
    return results

class CategoryForecast(BaseModel):
    category: str
    avg_spend: float
    predicted_spend: float
    trend_percentage: float # +10% or -5% vs average

class ForecastResponse(BaseModel):
    total_predicted: float
    breakdown: List[CategoryForecast]

@router.get("/forecast", response_model=ForecastResponse)
def get_expense_forecast(db: Session = Depends(get_sync_db)):
    """
    Predict next month's expense using Weighted Moving Average (WMA).
    Weights: Last Month (50%), 2 Months Ago (30%), 3 Months Ago (20%).
    """
    import datetime
    from dateutil.relativedelta import relativedelta

    today = datetime.date.today()
    current_month_start = today.replace(day=1)
    
    # We look at M-1, M-2, M-3
    months = []
    for i in range(1, 4):
        d = current_month_start - relativedelta(months=i)
        months.append((d.month, d.year)) # [(Dec, 2025), (Nov, 2025), (Oct, 2025)]
    
    # Weights for M-1, M-2, M-3
    weights = [0.5, 0.3, 0.2]
    
    # Fetch data grouped by Category and Month
    # We need to fetch data for these specific 3 months
    
    # 1. Get stats for last 3 months
    # Query: Category, Month, Year, Sum(Amount)
    raw_data = db.query(
        Transaction.category,
        extract('month', Transaction.transaction_date).label('month'),
        extract('year', Transaction.transaction_date).label('year'),
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.type == 'DEBIT',
        Transaction.transaction_date >= (current_month_start - relativedelta(months=3)),
        Transaction.transaction_date < current_month_start
    ).group_by(
        Transaction.category,
        extract('month', Transaction.transaction_date),
        extract('year', Transaction.transaction_date)
    ).all()
    
    # Organize data: category -> [spend_m1, spend_m2, spend_m3]
    # Note: raw_data might skip months if 0 spend. We must align them.
    
    cat_history = {}
    
    for row in raw_data:
        cat = row[0]
        m = int(row[1])
        y = int(row[2])
        spend = abs(float(row[3] or 0))
        
        if cat not in cat_history:
            cat_history[cat] = { (months[0]): 0, (months[1]): 0, (months[2]): 0 }
            
        # Update the specific month slot
        if (m, y) in cat_history[cat]:
            cat_history[cat][(m, y)] = spend

    forecasts = []
    total_predicted = 0
    
    for cat, history in cat_history.items():
        # history is { (12, 2025): 100, (11, 2025): 200 ... }
        # Map to ordered list [m1, m2, m3] corresponding to weights [0.5, 0.3, 0.2]
        spends = [history[months[0]], history[months[1]], history[months[2]]]
        
        # Calculate WMA
        weighted_sum = sum(s * w for s, w in zip(spends, weights))
        # Normalize weights if missing data? No, if 0 spend, it's 0.
        
        # Calculate simple average for comparison
        simple_avg = sum(spends) / 3 if len(spends) > 0 else 0
        
        # Trend
        if simple_avg > 0:
            trend = ((weighted_sum - simple_avg) / simple_avg) * 100
        else:
            trend = 0
            
        forecasts.append(CategoryForecast(
            category=cat,
            avg_spend=simple_avg,
            predicted_spend=weighted_sum,
            trend_percentage=trend
        ))
        
        total_predicted += weighted_sum
        
    return ForecastResponse(
        total_predicted=total_predicted,
        breakdown=sorted(forecasts, key=lambda x: x.predicted_spend, reverse=True)
    )
from app.services.analytics_service import AnalyticsService

class SubscriptionResponse(BaseModel):
    name: str
    amount: float
    frequency: int
    interval: str
    last_paid: Any # date
    annual_cost: float

@router.get("/subscriptions", response_model=List[SubscriptionResponse])
def get_subscriptions(db: Session = Depends(get_sync_db)):
    """
    Detects recurring subscriptions from transaction history.
    """
    return AnalyticsService.detect_subscriptions(db)

@router.get("/daily-spend")
def get_daily_spend(
    month: Optional[int] = None, 
    year: Optional[int] = None, 
    db: Session = Depends(get_sync_db)
):
    """
    Get daily spending aggregates for heatmap.
    Defaults to current month/year if not specified.
    """
    import datetime
    now = datetime.date.today()
    if not month: month = now.month
    if not year: year = now.year
    
    return AnalyticsService.get_daily_aggregates(db, month, year)
