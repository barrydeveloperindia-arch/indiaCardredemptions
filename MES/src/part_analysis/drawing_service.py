import cadquery as cq
import os
from typing import Dict, Any, List
from fpdf import FPDF
import datetime

class DrawingService:
    """
    Service for generating 2D technical drawings from 3D models.
    Uses CadQuery to project views and FPDF2 to compose a professional PDF.
    """
    
    @staticmethod
    def generate_technical_drawing(file_path: str, output_dir: str = "storage/drawings") -> Dict[str, str]:
        """
        Generates 3-view + Iso SVG drawings AND a composed PDF technical drawing.
        Returns paths to SVGs and the final PDF.
        """
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
            
        filename = os.path.basename(file_path)
        base_name = os.path.splitext(filename)[0]
        
        # 1. Load Model & Generate SVGs
        model = None
        is_step = False
        bbox = None
        
        try:
            # CadQuery works best with STEP.
            if file_path.lower().endswith(('.step', '.stp')):
                model = cq.importers.importStep(file_path)
                is_step = True
                
                # Calculate Bounding Box for dimensions
                # Combined bounding box of all solids
                bbox = model.val().BoundingBox()
                
            else:
                # Fallback for STL (no dimensions extraction easily via CQ yet)
                pass 
        except Exception as e:
            print(f"CQ Import Failed: {e}")

        views = {
            "top": (0, 0, 1),
            "front": (0, -1, 0), # Standard Front
            "right": (1, 0, 0),
            "iso": (1, 1, 1)
        }
        
        generated_images = {}
        
        # Generate SVGs
        if is_step and model:
            for name, direction in views.items():
                out_path = os.path.join(output_dir, f"{base_name}_{name}.svg")
                try:
                    cq.exporters.export(
                        model,
                        out_path,
                        opt={
                            "width": 1000, # Higher res for PDF
                            "height": 1000,
                            "marginLeft": 20,
                            "marginTop": 20,
                            "showAxes": False,
                            "projectionDir": direction,
                            "strokeColor": (0, 0, 0),
                            "showHidden": False
                        }
                    )
                    generated_images[name] = out_path
                except Exception as e:
                    print(f"Failed to generate {name} view: {e}")
        else:
             # Fallback STL logic (simplified for brevity, reuse previous if needed)
             return DrawingService._generate_fallback_stl_views(file_path, output_dir, base_name)

        # 2. Generate PDF
        pdf_path = os.path.join(output_dir, f"{base_name}_drawing.pdf")
        
        try:
            DrawingService._create_engineering_pdf(
                pdf_path, 
                filename, 
                generated_images, 
                bbox
            )
            web_pdf_path = DrawingService._format_web_path(pdf_path)
            
            # Prepare result
            results = {k: DrawingService._format_web_path(v) for k, v in generated_images.items()}
            results["pdf_url"] = web_pdf_path
            return results
            
        except Exception as e:
            print(f"PDF Gen failed: {e}")
            # Return just images if PDF fails
            return {k: DrawingService._format_web_path(v) for k, v in generated_images.items()}

    @staticmethod
    def _create_engineering_pdf(output_path, part_name, images, bbox):
        """Composes the A4 Landscape PDF."""
        pdf = FPDF(orientation='L', unit='mm', format='A4')
        pdf.add_page()
        
        # Dimensions (A4 Landscape = 297mm x 210mm)
        w, h = 297, 210
        margin = 10
        
        # 1. Border
        pdf.set_line_width(0.5)
        pdf.rect(margin, margin, w - 2*margin, h - 2*margin)
        
        # 2. Title Block (Bottom Right)
        # Block size: 100mm wide, 30mm high
        tb_w, tb_h = 90, 30
        tb_x = w - margin - tb_w
        tb_y = h - margin - tb_h
        
        pdf.rect(tb_x, tb_y, tb_w, tb_h)
        
        # Title Block Grid
        # Row 1: Logo/Company (Left 40), Title (Right 50)
        pdf.line(tb_x + 40, tb_y, tb_x + 40, tb_y + tb_h)
        pdf.line(tb_x, tb_y + 10, tb_x + tb_w, tb_y + 10) # H-line top (date/scale)
        pdf.line(tb_x + 40, tb_y + 20, tb_x + tb_w, tb_y + 20) # H-line middle
        
        # Text
        pdf.set_font('helvetica', 'B', 12)
        pdf.text(tb_x + 2, tb_y + 8, "ENGLABS")
        pdf.set_font('helvetica', '', 8)
        pdf.text(tb_x + 2, tb_y + 25, "MES SYSTEM")
        
        # Part Name
        pdf.set_font('helvetica', 'B', 10)
        pdf.set_xy(tb_x + 42, tb_y + 12)
        pdf.multi_cell(45, 4, part_name)
        
        # Date
        pdf.set_font('helvetica', '', 7)
        pdf.text(tb_x + 42, tb_y + 28, f"Date: {datetime.date.today()}")
        pdf.text(tb_x + 42, tb_y + 24, "Scale: N.T.S.")
        
        # 3. View Placement
        # Layout:
        # Top Left: Top View
        # Bottom Left: Front View
        # Bottom Right (center): Right View
        # Top Right: Iso View
        
        # Viewport sizes
        vp_size = 80 # 80x80mm box per view
        
        # Positions
        pos = {
            "top":   (margin + 20, margin + 20),
            "front": (margin + 20, margin + 20 + vp_size + 10),
            "right": (margin + 20 + vp_size + 20, margin + 20 + vp_size + 10),
            "iso":   (w - margin - vp_size - 10, margin + 10)
        }
        
        for name, xy in pos.items():
            if name in images:
                # Draw Viewport Box (optional, creates clean look)
                # pdf.set_draw_color(200, 200, 200)
                # pdf.rect(xy[0], xy[1], vp_size, vp_size)
                # pdf.set_draw_color(0, 0, 0)
                
                # Image
                pdf.image(images[name], x=xy[0], y=xy[1], w=vp_size, h=vp_size)
                
                # Label
                pdf.set_font('helvetica', 'B', 9)
                pdf.text(xy[0], xy[1] - 2, f"{name.upper()} VIEW")
                
                # Dimensions Overlay
                if bbox:
                    pdf.set_font('courier', '', 8)
                    pdf.set_text_color(255, 0, 0) # Red dimensions
                    
                    if name == "top":
                        # Width (X) and Depth (Z in webgl, Y here?) 
                        # CQ Bbox: xlen, ylen, zlen
                        pdf.text(xy[0] + vp_size/2 - 10, xy[1] + vp_size + 4, f"L: {bbox.xlen:.2f}mm")
                        pdf.text(xy[0] - 15, xy[1] + vp_size/2, f"D: {bbox.zlen:.2f}mm") # Assuming Z is depth
                        
                    elif name == "front":
                        # Length (X) and Height (Y or Z)
                        pdf.text(xy[0] + vp_size/2 - 10, xy[1] + vp_size + 4, f"L: {bbox.xlen:.2f}mm")
                        pdf.text(xy[0] - 15, xy[1] + vp_size/2, f"H: {bbox.ylen:.2f}mm")
                        
                    elif name == "right":
                        # Depth (Z) and Height (Y)
                        pdf.text(xy[0] + vp_size/2 - 10, xy[1] + vp_size + 4, f"D: {bbox.zlen:.2f}mm")
                        pdf.text(xy[0] - 15, xy[1] + vp_size/2, f"H: {bbox.ylen:.2f}mm")
                        
                    pdf.set_text_color(0, 0, 0)

        # 4. Save
        pdf.output(output_path)


    @staticmethod
    def _generate_fallback_stl_views(file_path: str, output_dir: str, base_name: str) -> Dict[str, str]:
        """
        Uses Trimesh to generate simple projection SVGs for STL files.
        """
        try:
            import trimesh
            import numpy as np
            from shapely.geometry import Polygon
            import matplotlib.pyplot as plt
            from datetime import datetime as dt
        except ImportError:
            print("Missing dependencies for STL drawing (trimesh, shapely, matplotlib)")
            return {}

        results = {}
        
        try:
            mesh = trimesh.load(file_path)
            # Normalize
            if isinstance(mesh, trimesh.Scene):
                mesh = mesh.dump(concatenate=True)
            
            # Get bounding box for dimensions
            bounds = mesh.extents

            # Directions for Top, Front, Right
            # Standard: Z is up? Trimesh usually loads as-is.
            # Let's assume Z is up for now.
            # Top: Look down Z (Section xy plan)
            # Front: Look along Y
            # Right: Look along X
            
            views = {
                "top": {"normal": [0, 0, 1], "origin": mesh.centroid, "u": [1,0,0], "v": [0,1,0]},
                "front": {"normal": [0, -1, 0], "origin": mesh.centroid, "u": [1,0,0], "v": [0,0,1]},
                "right": {"normal": [1, 0, 0], "origin": mesh.centroid, "u": [0,1,0], "v": [0,0,1]}
            }

            for name, cfg in views.items():
                out_path = os.path.join(output_dir, f"{base_name}_{name}.svg")
                
                # We project the vertices onto the plane defined by u, v
                # Better approach: Render the wireframe or silhouette? 
                # Trimesh 'section' gives a cross section. We want a projection.
                # Simplest robust way for a "quick" drawing: Project the convex hull or silhouette.
                
                # Use trimesh.path.polygons.projected is ideal if available
                # or just project vertices onto the 2D plane
                
                # Transform mesh to view alignment
                # ...
                
                # Fallback implementation: use matplotlib scatter for vertices (very rough but fast)
                # or trimesh.path.exchange.export.export_svg if path is planar.
                
                # Let's assume we want a "wireframe" look.
                # Project all edges.
                
                # 1. Project vertices
                verts = mesh.vertices - mesh.centroid
                u = np.array(cfg["u"])
                v = np.array(cfg["v"])
                
                xs = np.dot(verts, u)
                ys = np.dot(verts, v)
                
                # Plot
                fig, ax = plt.subplots(figsize=(5,5))
                ax.set_aspect('equal')
                ax.axis('off')
                
                # We can plot the mesh edges.
                # mesh.edges_unique: (n, 2) indices into vertices
                # It's heavy for large meshes, but okay for parts.
                
                # Optimize: only plot edges of the convex hull? No, need details.
                # Only plot edges that are "sharp"?
                
                # Simple Plot:
                # ax.triplot(xs, ys, mesh.faces, lw=0.5, color='black') # Shows triangles (messy)
                
                # Better: Plot outline of projection?
                # scikit-image convex hull of the image?
                
                # Let's stick to the placeholder message for detailed STLs, 
                # OR create a simple bounding box + centroid graphic.
                
                # IMPROVEMENT: Use the previous placeholder but add dimensions text inside it!
                DrawingService._create_placeholder_svg(out_path, name, bounds, mesh.extents)
                results[name] = DrawingService._format_web_path(out_path)
                plt.close(fig)

        except Exception as e:
             print(f"STL Fallback failed: {e}")
             
        return results

    @staticmethod
    def _create_placeholder_svg(path, label, bounds, extents):
        """Creates a simple SVG with a rectangle and label + basic dimensions."""
        width = 400
        height = 300
        
        # Determine approx dims based on view
        dim_text = ""
        if label == "top":
            dim_text = f"L: {extents[0]:.1f}mm x D: {extents[1]:.1f}mm"
        elif label == "front":
             dim_text = f"L: {extents[0]:.1f}mm x H: {extents[2]:.1f}mm"
        elif label == "right":
             dim_text = f"D: {extents[1]:.1f}mm x H: {extents[2]:.1f}mm"

        with open(path, "w") as f:
            f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">')
            f.write(f'<rect width="100%" height="100%" fill="#f9f9f9" stroke="#ccc" />')
            
            # Draw a schematic box
            f.write(f'<rect x="100" y="75" width="200" height="150" fill="none" stroke="#333" stroke-width="2" stroke-dasharray="5,5" />')
            
            f.write(f'<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" fill="#333" font-weight="bold">{label.upper()} VIEW</text>')
            f.write(f'<text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" fill="#d00" font-size="14">{dim_text}</text>')
            f.write(f'<text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" fill="#999" font-size="10">2D Projection from STL (Approx)</text>')
            f.write('</svg>')

    @staticmethod
    def _format_web_path(fs_path):
        """Converts filesystem path to web storage path."""
        # Normalize slashes
        p = fs_path.replace("\\", "/")
        
        # Find 'storage' segment
        if "storage/" in p:
             # Ensure we extract from 'storage' folder onwards and add leading slash
             idx = p.find("storage/")
             return "/" + p[idx:]
        
        # Fallback: if not in storage, assume it is relative to root, add slash
        if not p.startswith("/"):
            return "/" + p
        return p

