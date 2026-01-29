import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add src to pythonpath
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.database.models import Part
from src.database.connection import DATABASE_URL
from src.part_analysis.geometric_engine import GeometricEngine

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# DB Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def main():
    db = SessionLocal()
    try:
        # 1. Find parts with missing measurements (using empty dict check or null check)
        # Note: In SQLite/Postgres JSON, empty is '{}'. Default in model is '{}'.
        # We want to re-analyze if measurements is '{}' OR if it's missing 'volume_cm3'
        
        parts_to_analyze = db.query(Part).all()
        logger.info(f"Checking {len(parts_to_analyze)} parts for missing metadata...")
        
        count = 0
        success = 0
        failed = 0
        
        for part in parts_to_analyze:
            # Check if needs analysis
            needs_analysis = False
            if not part.measurements:
                needs_analysis = True
            elif part.measurements == {}:
                needs_analysis = True
            elif 'volume_cm3' not in part.measurements:
                needs_analysis = True
                
            if not needs_analysis:
                continue
                
            count += 1
            
            # Resolve file path
            # part.file_path is relative project root: "storage/parts/..."
            abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", part.file_path))
            
            if not os.path.exists(abs_path):
                logger.warning(f"File not found for Part {part.name}: {abs_path}")
                failed += 1
                continue
                
            logger.info(f"Analyzing [{count}] {part.name}...")
            
            results = None
            if part.name.lower().endswith(('.stl')):
                results = GeometricEngine.analyze_stl(abs_path)
            elif part.name.lower().endswith(('.step', '.stp', '.sldprt')):
                results = GeometricEngine.analyze_step_or_sldprt(abs_path)
            
            if results:
                # Update DB
                # SQLAlchemy requires flagging JSON fields as modified sometimes, or just reassigning
                part.measurements = results
                
                # Check for "Analysis Failed" note
                if results.get("note") == "CAD Analysis Failed":
                    failed += 1
                else:
                    success += 1
                
                # Commit frequently
                if count % 10 == 0:
                    db.commit()
            else:
                failed += 1
                
        db.commit()
        logger.info(f"Analysis Complete. Processed: {count}. Success: {success}. Failed: {failed}")
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
