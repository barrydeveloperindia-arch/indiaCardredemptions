
print("DEBUG: fc_convert.py loaded successfully!")
import sys
import os

# 1. IMPORTS
try:
    FREECAD_PATHS = [
        '/usr/lib/freecad/lib',
        '/usr/lib/freecad-python3/lib',
        '/usr/share/freecad/lib', 
        '/usr/lib/freecad-daily/lib'
    ]
    for path in FREECAD_PATHS:
        if os.path.exists(path) and path not in sys.path:
            sys.path.append(path)
            
    import FreeCAD
    print(f"DEBUG: FreeCAD imported! Version: {FreeCAD.Version()}")
    import Part
    print("DEBUG: Part module imported")
    import Import
    print("DEBUG: Import module imported")
    
    try:
        import FreeCADGui
        print("DEBUG: FreeCADGui module imported")
    except Exception as e:
        print(f"DEBUG: FreeCADGui import error: {e}")

    try:
        import ImportGui
        print("DEBUG: ImportGui module imported")
    except ImportError as e:
        print(f"DEBUG: ImportGui module import FAILED: {e}")
    except Exception as e:
        print(f"DEBUG: ImportGui general error: {e}")

except Exception as e:
    print(f"CRITICAL IMPORT ERROR: {e}")
    sys.exit(1)

# 2. FUNCTIONS
def convert_to_step(input_path, output_path):
    print(f"DEBUG: Starting conversion function for {input_path}")
    try:
        doc_name = "ConversionDoc"
        print(f"DEBUG: Creating new document: {doc_name}")
        doc = FreeCAD.newDocument(doc_name)
        print("DEBUG: Document created")
        
        print(f"DEBUG: Attempting Import.insert({input_path})")
        # Standard Import.insert is robust for many formats
        Import.insert(input_path, doc_name)
        print("DEBUG: Import.insert finished")
        
        objs = doc.Objects
        print(f"DEBUG: Found {len(objs)} objects")
        
        if not objs:
            print("ERROR: No objects found")
            return
            
        print(f"DEBUG: Exporting to {output_path}")
        Import.export(objs, output_path)
        print("DEBUG: Export finished")
        
        if os.path.exists(output_path):
            print(f"SUCCESS: File created, size: {os.path.getsize(output_path)}")
        else:
            print("ERROR: File not found after export")
            
    except Exception as e:
        print(f"CRITICAL CONVERSION ERROR: {e}")
        import traceback
        traceback.print_exc()

# 3. MAIN EXECUTION
if __name__ == '__main__' or True:
    print("DEBUG: Main block reached")
    input_file = os.environ.get("FC_INPUT_FILE")
    output_file = os.environ.get("FC_OUTPUT_FILE")
    
    if input_file and output_file:
        if os.path.exists(input_file):
             convert_to_step(input_file, output_file)
        else:
             print(f"ERROR: Input file {input_file} does not exist")
    else:
        print("DEBUG: FC_INPUT_FILE or FC_OUTPUT_FILE not set")
    
    print("DEBUG: Exiting Script")
