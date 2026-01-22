import sys
print(f"Hello from FreeCAD! Python version: {sys.version}")
try:
    import FreeCAD
    print(f"FreeCAD Version: {FreeCAD.Version()}")
except ImportError:
    print("Failed to import FreeCAD")
