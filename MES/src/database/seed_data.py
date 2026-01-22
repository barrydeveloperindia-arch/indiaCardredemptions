from src.database.connection import SessionLocal
from src.database.models import Machine

def seed_machines():
    db = SessionLocal()
    
    machines = [
        Machine(
            machine_id="CNC-001",
            name="Standard CNC",
            capabilities={"materials": ["Steel", "Aluminum", "Universal"], "axis": 3},
            current_status="IDLE"
        ),
        Machine(
            machine_id="CNC-HighPerf-05",
            name="High Performance CNC",
            capabilities={"materials": ["Inconel", "Titanium", "Universal"], "axis": 5},
            current_status="IDLE"
        ),
        Machine(
            machine_id="3D-Printer-02",
            name="Prusa XL",
            capabilities={"materials": ["PLA", "PETG", "Universal"], "type": "FDM"},
            current_status="IDLE"
        )
    ]
    
    for m in machines:
        existing = db.query(Machine).filter(Machine.machine_id == m.machine_id).first()
        if not existing:
            db.add(m)
            print(f"Added {m.name}")
        else:
            print(f"Skipping {m.name} (Exists)")
            
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_machines()
