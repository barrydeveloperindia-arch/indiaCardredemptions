import asyncio
from src.shop_floor.service_instance import twin_service

async def verify_hp_telemetry():
    print("[VERIFY] Registering HP Printer...")
    twin_service.register_machine("HP-MJF-4200-VERIFY", "https://api.hp.com/3d/v1")
    
    print("[VERIFY] Refreshing all states (Simulated Polling)...")
    await twin_service.refresh_all_states()
    
    status = twin_service.get_machine_status("HP-MJF-4200-VERIFY")
    print(f"[VERIFY] Status: {status.get('status')}")
    print(f"[VERIFY] Temp: {status.get('temp')} C")
    print(f"[VERIFY] Materials: {status.get('materials')}")
    
    if status.get("type") == "HP" and "materials" in status:
        print("[PASS] HP Telemetry integrated successfully into Digital Twin.")
    else:
        print("[FAIL] HP Telemetry missing or incorrect.")

if __name__ == "__main__":
    asyncio.run(verify_hp_telemetry())
