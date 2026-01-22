
print("SIMPLE_TEST_SUCCESS")
import sys
print(f"Python Version: {sys.version}")
try:
    import FreeCAD
    print(f"FreeCAD Version: {FreeCAD.Version()}")
except ImportError:
    print("Failed to import FreeCAD")
except Exception as e:
    print(f"Error importing FreeCAD: {e}")
