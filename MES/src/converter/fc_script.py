
import sys
import os

def main():
    if len(sys.argv) < 3:
        print("Usage: freecadcmd fc_script.py <input_path> <output_path>")
        sys.exit(1)

    input_path = sys.argv[2] # FreeCAD argv structure usually [binary, script, arg1, arg2] 
    # Wait, freecadcmd arguments are tricky. 
    # Usage: freecadcmd script.py arg1 arg2
    # sys.argv[0] is the script name? Let's check safely.
    
    # If run as: freecadcmd /app/fc_script.py input output
    # sys.argv is normally ['/app/fc_script.py', 'input', 'output']
    
    output_path = ""
    if len(sys.argv) >= 3:
         input_path = sys.argv[1]
         output_path = sys.argv[2]
    
    print(f"Processing: {input_path} -> {output_path}")

    # Add FreeCAD paths commonly found in Ubuntu
    sys.path.append('/usr/lib/freecad/lib')
    sys.path.append('/usr/lib/freecad-python3/lib')

    try:
        import FreeCAD
        import Part
        import Import
        # Try ImportGui - needed for SLDPRT usually
        try:
             import ImportGui
             print("ImportGui loaded.")
        except ImportError:
             print("ImportGui not available - creating fallback.")
    except ImportError as e:
        print(f"CRITICAL: Failed to import FreeCAD modules: {e}")
        sys.exit(1)

    try:
        doc = FreeCAD.newDocument("Conversion")
        Import.insert(input_path, "Conversion")
        
        objs = doc.Objects
        if not objs:
            print("Error: No objects found after import.")
            sys.exit(1)
            
        Import.export(objs, output_path)
        print(f"Exported {len(objs)} objects to {output_path}")
        
    except Exception as e:
        print(f"Error during processing: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
