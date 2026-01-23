import os
import sys

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.part_analysis.drawing_service import DrawingService
import cadquery as cq

def create_test_step(path):
    print(f"Creating test STEP file at {path}...")
    result = cq.Workplane("XY").box(10, 20, 30).edges("|Z").fillet(2)
    cq.exporters.export(result, path)
    return path

def test_drawing_generation():
    test_dir = "tests/temp_output"
    os.makedirs(test_dir, exist_ok=True)
    
    step_path = os.path.join(test_dir, "test_part.step")
    create_test_step(step_path)
    
    print("\n--- Testing Drawing Generation ---")
    try:
        # Call the service
        results = DrawingService.generate_technical_drawing(step_path, output_dir=test_dir)
        
        print("\nResults:", results)
        
        # Verify
        if "pdf_url" not in results:
            print("FAILED: pdf_url not found in results")
            return
            
        pdf_path = os.path.join(test_dir, "test_part_drawing.pdf")
        if os.path.exists(pdf_path):
            size = os.path.getsize(pdf_path)
            print(f"SUCCESS: PDF generated at {pdf_path} (Size: {size} bytes)")
        else:
            print(f"FAILED: PDF file does not exist at {pdf_path}")
            
    except Exception as e:
        print(f"EXCEPTION: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_drawing_generation()
    
    # Test STL Fallback
    print("\n--- Testing STL Fallback ---")
    stl_path = "tests/temp_output/test_part.stl"
    # Create dummy STL
    with open(stl_path, "w") as f:
        f.write("solid cube\nendsolid cube") 
    
    try:
        results = DrawingService.generate_technical_drawing(stl_path, output_dir="tests/temp_output")
        print("STL Results:", results)
    except Exception as e:
        print(f"STL Failed: {e}")
