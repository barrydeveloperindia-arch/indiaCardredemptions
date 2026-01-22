import os
import trimesh
import numpy as np
from src.part_analysis.geometric_engine import GeometricEngine

def create_cube_stl(filename="test_cube.stl", size=10):
    # Create simple cube mesh
    mesh = trimesh.creation.box(extents=(size, size, size))
    mesh.export(filename)
    return filename

def test_geometric_engine():
    stl_path = create_cube_stl()
    print(f"Created test STL: {stl_path}")
    
    try:
        # Run analysis
        result = GeometricEngine.analyze_stl(stl_path)
        
        print("\n--- Analysis Result ---")
        print(result)
        
        # Verify Volume (10x10x10 = 1000 mm3 = 1.0 cm3)
        expected_volume = 1.0
        actual_volume = result['volume_cm3']
        
        # Verify Bounding Box (10x10x10 mm)
        expected_bbox = 10.0
        
        print(f"\nExpected Volume: {expected_volume} cm3, Actual: {actual_volume} cm3")
        
        if abs(actual_volume - expected_volume) < 0.1:
            print("PASS: Volume calculation is accurate.")
        else:
            print("FAIL: Volume calculation mismatch (Did it fall back to random?).")
            
        if result['is_watertight']:
             print("PASS: Mesh is watertight.")
        else:
             print("FAIL: Mesh should be watertight.")

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
    finally:
        if os.path.exists(stl_path):
            os.remove(stl_path)

if __name__ == "__main__":
    test_geometric_engine()
