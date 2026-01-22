
import sys
import os

# Add src to path
sys.path.append("/app")

import cadquery as cq
import trimesh

def compare_volumes():
    step_path = "storage/parts/300906331AA.stp"
    
    if not os.path.exists(step_path):
        print(f"File {step_path} not found.")
        return

    print(f"--- Comparing Volumes for {step_path} ---")

    # 1. Exact CAD Volume
    try:
        model = cq.importers.importStep(step_path)
        # Combine all solids if multiple
        # Usually model is a Workplane object. val() gets the underlying shape.
        shape = model.val()
        if hasattr(shape, 'Volume'):
            exact_vol = shape.Volume()
            print(f"CAD Exact Volume (mm3): {exact_vol:.2f}")
            print(f"CAD Exact Volume (cm3): {exact_vol/1000.0:.2f}")
        else:
            print("Could not retrieve volume from shape.")
    except Exception as e:
        print(f"CAD Analysis Failed: {e}")

    # 2. Converted Mesh Volume
    try:
        # Convert to STL in memory or temp
        stl_path = step_path.replace(".stp", "_debug.stl")
        cq.exporters.export(model, stl_path, tolerance=0.1, angularTolerance=0.1)
        
        mesh = trimesh.load(stl_path)
        print(f"Mesh Volume (mm3): {mesh.volume:.2f}")
        print(f"Mesh Volume (cm3): {mesh.volume/1000.0:.2f}")
        print(f"Is Watertight: {mesh.is_watertight}")
        
        if not mesh.is_watertight:
             print(f"Convex Hull Vol (mm3): {mesh.convex_hull.volume:.2f}")
    except Exception as e:
        print(f"Mesh Analysis Failed: {e}")

if __name__ == "__main__":
    compare_volumes()
