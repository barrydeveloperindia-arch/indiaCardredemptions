import sys
import os
import uuid

# Add parent dir to path to import src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database.connection import SessionLocal
from src.database import models

def seed_parts():
    db = SessionLocal()
    print("--- Seeding Parts Catalog ---")

    # Seed test_cube.stl
    filename = "test_cube.stl"
    existing = db.query(models.Part).filter(models.Part.name == filename).first()
    
    if not existing:
        part = models.Part(
            part_id=str(uuid.uuid4()),
            name=filename,
            file_path=f"storage/parts/{filename}",
            material="PLA",
            estimated_cost=12.50,
            preview_url="https://placehold.co/400x300?text=Cube+Preview",
            technical_score=0.98,
            economic_action="Print",
            measurements={
                "volume_cm3": 1000.0,
                "bounding_box": {"x": 10, "y": 10, "z": 10}
            },
            project_id="TEST-PROJECT"
        )
        db.add(part)
        db.commit()
        print(f"Seeded {filename}")
    else:
        print(f"{filename} already exists")

    db.close()

if __name__ == "__main__":
    seed_parts()
