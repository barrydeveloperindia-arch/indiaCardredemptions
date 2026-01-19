import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database.connection import SessionLocal
from src.database import models
from src.dispatch.agent import DispatchAgent

def verify_dispatch():
    db = SessionLocal()
    agent = DispatchAgent()
    
    # Setup Mock Machines
    # 1. CNC-001 (Universal)
    # 2. 3D-Printer-02 (PLA Only)
    
    print("--- Verifying Dispatch Logic ---")
    
    # Case 1: Standard Steel Part (Should go to CNC)
    print("\nCase 1: Dispatching Steel Part...")
    order_steel = {
        "technical_requirements": {"material": "Steel"}
    }
    jid1, mid1 = agent.dispatch_order(order_steel, db)
    print(f"Result: {mid1} (Expected: CNC-*)")
    
    # Case 2: PLA Part (Should go to Printer or Universal)
    print("\nCase 2: Dispatching PLA Part...")
    order_pla = {
        "technical_requirements": {"material": "PLA"}
    }
    jid2, mid2 = agent.dispatch_order(order_pla, db)
    print(f"Result: {mid2} (Expected: 3D-Printer-* or CNC-*)")

    db.close()

if __name__ == "__main__":
    verify_dispatch()
