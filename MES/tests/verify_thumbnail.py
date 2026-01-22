
import sys
import os

sys.path.append("/app")
import cadquery as cq

def generate_svg():
    step_path = "storage/parts/300906331AA.stp"
    out_path = "storage/previews/300906331AA.svg"
    
    os.makedirs("storage/previews", exist_ok=True)
    
    try:
        model = cq.importers.importStep(step_path)
        
        cq.exporters.export(
            model, 
            out_path, 
            opt={
                "width": 300,
                "height": 300,
                "marginLeft": 10,
                "marginTop": 10,
                "showAxes": False,
                "projectionDir": (1, 1, 1),
                "strokeColor": (80, 80, 80), # Dark Gray
                "hiddenColor": (200, 200, 200), # Light Gray
                "showHidden": False
            }
        )
        print(f"SVG generated at {out_path}")
        # Check size
        print(f"Size: {os.path.getsize(out_path)} bytes")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_svg()
