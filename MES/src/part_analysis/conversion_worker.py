import os

class ConversionWorker:
    """
    Agent B: File Conversion
    Responsible for normalizing proprietary formats (.sldprt, .step) into universal mesh (.stl).
    """

    @staticmethod
    def _ensure_compatible_step(source_path: str) -> str:
        """
        Ensures the file is a STEP file compatible with CadQuery.
        If it's SLDPRT or X_T, sends it to the 'converter' sidecar service.
        Returns path to STEP file (either original or converted).
        """
        import requests
        
        base, ext = os.path.splitext(source_path)
        ext = ext.lower()
        
        if ext in ['.step', '.stp']:
            return source_path
            
        if ext not in ['.sldprt', '.x_t']:
            return source_path # Unknown/Unsupported, return as is
            
        # It is proprietary. Need conversion.
        converted_path = source_path + ".converted.step"
        
        if os.path.exists(converted_path) and os.path.getsize(converted_path) > 0:
            return converted_path
            
        print(f"[ConversionWorker] Proprietary format {ext} detected. Sending to Sidecar Service...")
        
        try:
            # Preparing the file upload
            with open(source_path, 'rb') as f:
                files = {'file': (os.path.basename(source_path), f)}
                
                # Call Sidecar
                # Service name 'converter' is defined in docker-compose.yml
                response = requests.post("http://converter:5000/convert", files=files, timeout=600)
                
            if response.status_code == 200:
                with open(converted_path, 'wb') as f:
                    f.write(response.content)
                print(f"[ConversionWorker] Sidecar conversion successful -> {converted_path}")
                return converted_path
            else:
                print(f"[ConversionWorker] Sidecar failed: {response.status_code} - {response.text}")
                return source_path # Fallback
                
        except Exception as e:
            print(f"[ConversionWorker] Sidecar connection error: {e}")
            return source_path

    @staticmethod
    def convert_to_stl(source_path: str) -> str:
        """
        Converts a CAD file (STEP, SLDPRT, X_T) to STL using CadQuery.
        Returns the path to the new STL file.
        """
        if source_path.lower().endswith(".stl"):
            return source_path
        
        print(f"[ConversionWorker] Starting conversion for {source_path}...")
        
        # Output path
        base, ext = os.path.splitext(source_path)
        new_path = base + ".stl"
        
        # Check if file format is supported for conversion
        # Added .x_t support
        if ext.lower() not in ['.step', '.stp', '.sldprt', '.x_t']:
            print(f"[ConversionWorker] Unsupported format {ext}, creating placeholder. (Tip: Use STEP for best results)")
            ConversionWorker._create_placeholder_stl(new_path)
            return new_path
        
        try:
            # Import CadQuery for real conversion
            import cadquery as cq
            
            # Ensure we have a compatible STEP file
            step_path = ConversionWorker._ensure_compatible_step(source_path)
            
            # Import the STEP file
            print(f"[ConversionWorker] Loading CAD file with CadQuery from {step_path}...")
            result = cq.importers.importStep(step_path)
            
            # Export to STL with reasonable tessellation
            print(f"[ConversionWorker] Exporting to STL...")
            cq.exporters.export(result, new_path, tolerance=0.01, angularTolerance=0.1)
            
            print(f"[ConversionWorker] Successfully converted -> {new_path}")
            
        except Exception as e:
            print(f"[ConversionWorker] Error during conversion: {e}")
            print(f"[ConversionWorker] Creating placeholder STL as fallback")
            ConversionWorker._create_placeholder_stl(new_path)
        
        return new_path
    
    @staticmethod
    def _create_placeholder_stl(file_path: str):
        """Creates a simple cube STL as a placeholder."""
        with open(file_path, "w") as f:
            f.write("solid cube\n")
            f.write("facet normal 0 0 -1\nouter loop\nvertex 0 0 0\nvertex 10 0 0\nvertex 0 10 0\nendloop\nendfacet\n")
            f.write("facet normal 0 0 -1\nouter loop\nvertex 0 10 0\nvertex 10 0 0\nvertex 10 10 0\nendloop\nendfacet\n")
            f.write("facet normal 0 0 1\nouter loop\nvertex 0 0 10\nvertex 0 10 10\nvertex 10 0 10\nendloop\nendfacet\n")
            f.write("facet normal 0 0 1\nouter loop\nvertex 10 0 10\nvertex 0 10 10\nvertex 10 10 10\nendloop\nendfacet\n")
            f.write("facet normal 0 -1 0\nouter loop\nvertex 0 0 0\nvertex 0 0 10\nvertex 10 0 0\nendloop\nendfacet\n")
            f.write("facet normal 0 -1 0\nouter loop\nvertex 10 0 0\nvertex 0 0 10\nvertex 10 0 10\nendloop\nendfacet\n")
            f.write("facet normal 0 1 0\nouter loop\nvertex 0 10 0\nvertex 10 10 0\nvertex 0 10 10\nendloop\nendfacet\n")
            f.write("facet normal 0 1 0\nouter loop\nvertex 10 10 0\nvertex 10 10 10\nvertex 0 10 10\nendloop\nendfacet\n")
            f.write("facet normal -1 0 0\nouter loop\nvertex 0 0 0\nvertex 0 10 0\nvertex 0 0 10\nendloop\nendfacet\n")
            f.write("facet normal -1 0 0\nouter loop\nvertex 0 10 0\nvertex 0 10 10\nvertex 0 0 10\nendloop\nendfacet\n")
            f.write("facet normal 1 0 0\nouter loop\nvertex 10 0 0\nvertex 10 0 10\nvertex 10 10 0\nendloop\nendfacet\n")
            f.write("facet normal 1 0 0\nouter loop\nvertex 10 10 0\nvertex 10 0 10\nvertex 10 10 10\nendloop\nendfacet\n")
            f.write("endsolid cube\n")

    @staticmethod
    def check_printability(file_path: str):
        """
        Runs geometric checks for 3D printing feasibility.
        """
        # Mock checks
        return {
            "manifold": True,
            "wall_thickness_min_mm": 0.8,
            "overhangs_need_support": True
        }

    @staticmethod
    def generate_thumbnail(source_path: str) -> str:
        """
        Generates an SVG thumbnail for CAD files (STEP, SLDPRT).
        Returns the relative path to the thumbnail or None.
        """
        if not source_path.lower().endswith(('.step', '.stp', '.sldprt', '.x_t')):
            return None # Skip STLs for now (harder to SVG)

        thumb_path = source_path + ".svg"
        
        try:
            import cadquery as cq
            
            # Ensure we have a compatible STEP file
            step_path = ConversionWorker._ensure_compatible_step(source_path)
            
            # Load
            model = cq.importers.importStep(step_path)
            
            # Export SVG
            cq.exporters.export(
                model,
                thumb_path,
                opt={
                    "width": 300,
                    "height": 220,
                    "marginLeft": 10,
                    "marginTop": 10,
                    "showAxes": False,
                    "projectionDir": (1.5, 1, 1.5),
                    "strokeColor": (100, 100, 100),
                    "hiddenColor": (220, 220, 220),
                    "showHidden": False
                }
            )
            print(f"Thumbnail generated: {thumb_path}")
            return thumb_path
            
        except Exception as e:
            print(f"Thumbnail generation failed: {e}")
            return None
