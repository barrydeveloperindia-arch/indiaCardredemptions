
import sys
import os
import time

# Add src to path
sys.path.append("/app")

from src.part_analysis.conversion_worker import ConversionWorker
from src.part_analysis.service import PartAnalysisService

def verify_conversion():
    # Use the sample file we know exists
    mapped_path = "storage/parts/300906331AA.stp"
    
    if not os.path.exists(mapped_path):
        print(f"ERROR: File {mapped_path} not found inside container.")
        return

    print(f"--- Verifying STEP Conversion for {mapped_path} ---")
    
    # 1. Trigger Conversion explicitly
    try:
        stl_path = ConversionWorker.convert_to_stl(mapped_path)
        print(f"Conversion Result: {stl_path}")
        
        # 2. Check File Size
        if os.path.exists(stl_path):
            size = os.path.getsize(stl_path)
            print(f"STL Size: {size} bytes")
            
            if size < 2000: # The placeholder cube is ~1KB
                print("FAILURE: STL size matches placeholder (Conversion Failed).")
            else:
                print("SUCCESS: STL size indicates successful conversion!")
        else:
            print("FAILURE: STL file not created.")

    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    verify_conversion()
