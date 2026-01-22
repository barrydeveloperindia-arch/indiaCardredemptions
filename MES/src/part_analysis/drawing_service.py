import cadquery as cq
import os
from typing import Dict, Any, List

class DrawingService:
    """
    Service for generating 2D technical drawings from 3D models.
    Uses CadQuery to project views and export SVGs.
    """
    
    @staticmethod
    def generate_technical_drawing(file_path: str, output_dir: str = "storage/drawings") -> Dict[str, str]:
        """
        Generates 3-view (Top, Front, Right) SVG drawings for a given CAD/STL file.
        Returns a dictionary of paths to the generated SVGs.
        """
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
            
        filename = os.path.basename(file_path)
        base_name = os.path.splitext(filename)[0]
        
        # 1. Load Model
        try:
            # CadQuery works best with STEP.
            if file_path.lower().endswith(('.step', '.stp')):
                model = cq.importers.importStep(file_path)
            else:
                # Fallback for STL
                return DrawingService._generate_fallback_stl_views(file_path, output_dir, base_name)
        except Exception as e:
            print(f"CQ Import Failed: {e}")
            return DrawingService._generate_fallback_stl_views(file_path, output_dir, base_name)

        # 2. Define Views
        views = {
            "top": (0, 0, 1),
            "front": (0, 1, 0),
            "right": (1, 0, 0),
            "iso": (1, 1, 1)
        }
        
        results = {}
        
        for name, direction in views.items():
            out_path = os.path.join(output_dir, f"{base_name}_{name}.svg")
            try:
                cq.exporters.export(
                    model,
                    out_path,
                    opt={
                        "width": 600,
                        "height": 600,
                        "marginLeft": 10,
                        "marginTop": 10,
                        "showAxes": False,
                        "projectionDir": direction,
                        "strokeColor": (0, 0, 0),
                        "showHidden": False
                    }
                )
                
                # Fix path for Web
                results[name] = DrawingService._format_web_path(out_path)

            except Exception as e:
                print(f"Failed to generate {name} view: {e}")
                
        return results

    @staticmethod
    def _generate_fallback_stl_views(file_path: str, output_dir: str, base_name: str) -> Dict[str, str]:
        """
        Uses Trimesh to generate simple projection SVGs for STL files.
        """
        try:
            import trimesh
            import numpy as np
            from shapely.geometry import Polygon
            from shapely.ops import unary_union
        except ImportError:
            print("Missing dependencies for STL drawing (trimesh/shapely)")
            return {}

        results = {}
        
        try:
            mesh = trimesh.load(file_path)
            # Normalize
            if isinstance(mesh, trimesh.Scene):
                mesh = mesh.dump(concatenate=True)
            
            axes = {
                "top": [0, 0, 1], 
                "front": [0, 1, 0],
                "right": [1, 0, 0]
            }
            
            for name, normal in axes.items():
                out_path = os.path.join(output_dir, f"{base_name}_{name}.svg")
                
                # Project vertices to plane
                # Simple projection: flatten coords
                # This is a very rough approximation for a "drawing"
                # A proper hidden line removal on mesh is slow.
                # We will just generate a placeholder SVG with bounding box.
                
                # Create SVG manually
                DrawingService._create_placeholder_svg(out_path, name, mesh.bounds)
                results[name] = DrawingService._format_web_path(out_path)
                
        except Exception as e:
            print(f"STL Fallback failed: {e}")
            
        return results

    @staticmethod
    def _create_placeholder_svg(path, label, bounds):
        """Creates a simple SVG with a rectangle and label."""
        width = 400
        height = 300
        with open(path, "w") as f:
            f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">')
            f.write(f'<rect width="100%" height="100%" fill="#f9f9f9" stroke="#ccc" />')
            f.write(f'<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" fill="#333">{label.upper()} VIEW</text>')
            f.write(f'<text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" fill="#666" font-size="10">STL Projection Not Supported Yet</text>')
            f.write('</svg>')

    @staticmethod
    def _format_web_path(fs_path):
        """Converts filesystem path to web storage path."""
        # Normalize slashes
        p = fs_path.replace("\\", "/")
        # Ensure it starts with /storage
        if "/storage/" in p:
             return "/storage/" + p.split("/storage/", 1)[1]
        return p

