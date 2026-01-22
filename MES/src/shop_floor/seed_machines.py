from sqlalchemy.orm import Session
from src.database.connection import SessionLocal
from src.database.models import Machine
import json

def seed_machines():
    db = SessionLocal()
    machines = [
        {
            "machine_id": "CNC-001", 
            "name": "Standard Mill (3-Axis)", 
            "capabilities": {"process": "MILLING", "materials": ["STEEL", "ALUMINUM"], "precision": "STANDARD"},
            "telemetry_topic": "opc.tcp://mock-cnc-1:4840"
        },
        {
            "machine_id": "CNC-HighPerf-05", 
            "name": "Precision Mill (5-Axis)", 
            "capabilities": {"process": "MILLING", "materials": ["TITANIUM", "STEEL", "INCONEL"], "precision": "HIGH"},
            "telemetry_topic": "opc.tcp://mock-cnc-5:4840"
        },
        {
            "machine_id": "3D-Printer-02", 
            "name": "Stratasys F120", 
            "capabilities": {"process": "PRINTING", "materials": ["PLA", "ABS", "PETG"], "precision": "LOW"},
            "telemetry_topic": "opc.tcp://mock-printer:4840"
        },
        {
            "machine_id": "HP-MJF-4200-01", 
            "name": "HP Jet Fusion 4200", 
            "capabilities": {"process": "3D_PRINTING", "materials": ["PA12", "PA11"], "precision": "HIGH"},
            "telemetry_topic": "https://api.hp.com/3d/v1"
        }
    ]
    
    try:
        for m in machines:
            exists = db.query(Machine).filter(Machine.machine_id == m["machine_id"]).first()
            if not exists:
                new_machine = Machine(**m)
                db.add(new_machine)
                print(f"Added Machine: {m['name']}")
            else:
                # Update capabilities if changed
                if exists.capabilities != m["capabilities"]:
                     exists.capabilities = m["capabilities"]
                     db.add(exists)
                     print(f"Updated Machine: {m['name']}")
                else:
                    print(f"Skipped Machine: {m['name']} (Exists)")
        db.commit()
    except Exception as e:
        print(f"Error Seeding Machines: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_machines()
