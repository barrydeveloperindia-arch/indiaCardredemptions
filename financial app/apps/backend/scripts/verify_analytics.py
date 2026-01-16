import sys
import os

# Add project root to path
# We need to be at 'apps/backend' to import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SyncSessionLocal as SessionLocal
from app.services.analytics_service import AnalyticsService

def test_analytics():
    db = SessionLocal()
    try:
        print("Testing Subscription Detection...")
        subs = AnalyticsService.detect_subscriptions(db)
        print(f"Found {len(subs)} potential subscriptions.")
        for s in subs:
            print(f" - {s['name']}: {s['amount']} ({s['interval']})")
            
        print("\nTesting Daily Aggregates (Current Month)...")
        import datetime
        now = datetime.date.today()
        daily = AnalyticsService.get_daily_aggregates(db, now.month, now.year)
        print(f"Got data for {len(daily)} days.")
        for d in daily[:5]: # Show first 5
            print(f" - {d['date']}: {d['value']}")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_analytics()
