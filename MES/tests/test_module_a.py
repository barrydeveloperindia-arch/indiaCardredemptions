from src.dispatch.agent import DispatchAgent
from src.database.connection import SessionLocal

def test_module_a():
    print("=== Testing Module A: Intelligent Dispatching ===")
    
    agent = DispatchAgent()
    db = SessionLocal() # Create a real session
    
    # Test Case 1: Standard PLA Order (Should go to 3D Printer)
    order_1 = {
        "order_id": "ORD-1001",
        "cad_file_path": "gears/gear_v1.stl",
        "technical_requirements": {"material": "PLA", "tolerance": 0.5}
    }
    
    # Test Case 2: High-Spec Inconel Order (Should go to HighPerf CNC)
    order_2 = {
        "order_id": "ORD-1002",
        "cad_file_path": "aerospace/turbine_blade.stl",
        "technical_requirements": {"material": "Inconel", "tolerance": 0.01}
    }
    
    # Test Case 3: Oversized Part (Should trigger Interference Engine failure)
    # Using a filename that doesn't affect mock size, but we interpret it as 'Large' via mocks logic if we updated it.
    # For now, let's rely on random orientation or mock limits.
    # The current Mock Interference engine checks 100x100x50 against machine sizes. All should pass unless I force a failure.
    
    print("\n--- Dispatching Order 1 ---")
    result_1 = agent.dispatch_order(order_1, db)
    print(f"Result 1: {result_1}")
    
    print("\n--- Dispatching Order 2 ---")
    result_2 = agent.dispatch_order(order_2, db)
    print(f"Result 2: {result_2}")
    
    print("\n=== Module A Test Complete ===")
    db.close()

if __name__ == "__main__":
    test_module_a()
