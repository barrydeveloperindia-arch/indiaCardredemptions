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
        generated_images = {}
        
        try:
            # CadQuery works best with STEP.
            if file_path.lower().endswith(('.step', '.stp')):
                model = cq.importers.importStep(file_path)
                is_step = True
                
                # Calculate Bounding Box
                bbox = model.val().BoundingBox()
                
                # Generate SVGs
                views = {
                    "top": (0, 0, 1),
                    "front": (0, -1, 0), 
                    "right": (1, 0, 0),
                    "iso": (1, 1, 1)
                }
                
                for name, direction in views.items():
                    out_path = os.path.join(output_dir, f"{base_name}_{name}.svg")
                    try:
                        cq.exporters.export(
                            model,
                            out_path,
                            opt={
                                "width": 1000,
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
                # Fallback for STL (Matplotlib Rendering)
                # Now calls the improved fallback that returns images AND bbox
                generated_images, bbox = DrawingService._generate_fallback_stl_views(file_path, output_dir, base_name)
                is_step = False 

        except Exception as e:
            print(f"Drawing Generation Failed: {e}")
            import traceback
            traceback.print_exc()

        # 2. Generate PDF (Shared for both STEP and STL)
        # If we have images, we can make a PDF.
        if not generated_images:
            return {}

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
            import traceback
            traceback.print_exc()
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
        pdf.line(tb_x + 40, tb_y, tb_x + 40, tb_y + tb_h) # Vertical Divider
        
        # Horizontal lines (Only on the Right side)
        pdf.line(tb_x + 40, tb_y + 10, tb_x + tb_w, tb_y + 10) # H-line top (date/scale)
        pdf.line(tb_x + 40, tb_y + 20, tb_x + tb_w, tb_y + 20) # H-line middle
        
        # Logo / Branding
        # We look for the logo in the standard assets location
        logo_path = "/app/src/assets/logo_clean.png"
        
        if os.path.exists(logo_path):
            # Place logo in the left 40mm box of the title block
            # Box is at (tb_x, tb_y) with width 40, height 30.
            # Center it roughly.
            try:
                # Max width ~30mm to leave margin
                pdf.image(logo_path, x=tb_x + 5, y=tb_y + 5, w=30)
            except Exception as e:
                print(f"Logo embedding failed: {e}")
                pdf.text(tb_x + 2, tb_y + 15, "ENGLABS")
        else:
            # Fallback Text
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
    def _generate_fallback_stl_views(file_path: str, output_dir: str, base_name: str):
        """
        Uses Matplotlib to generate technical orthographic SVGs for STL files.
        Returns: (images_dict, bbox_object)
        """
        try:
            import trimesh
            import matplotlib.pyplot as plt
            from mpl_toolkits.mplot3d import art3d
            import numpy as np
            from types import SimpleNamespace
        except ImportError:
            print("Missing dependencies for STL drawing")
            return {}, None

        images = {}
        bbox_obj = None

        try:
            mesh = trimesh.load(file_path)
            # Normalize
            if isinstance(mesh, trimesh.Scene):
                if len(mesh.geometry) == 0: return {}, None
                mesh = trimesh.util.concatenate(list(mesh.geometry.values()))
            
            # 1. Bounding Box
            extents = mesh.extents
            # Simulate CadQuery bbox object (.xlen, .ylen, .zlen)
            bbox_obj = SimpleNamespace(xlen=extents[0], ylen=extents[1], zlen=extents[2])

            # 2. Setup Views
            # View Params: Elev/Azim for Top, Front, Right, Iso
            view_params = {
                "iso":   {"elev": 30, "azim": 45},
                "top":   {"elev": 90, "azim": -90},
                "front": {"elev": 0,  "azim": -90},
                "right": {"elev": 0,  "azim": 0}
            }

            # Reduce faces for performance if huge
            if len(mesh.faces) > 5000:
                stride = len(mesh.faces) // 5000
                faces = mesh.faces[::stride]
            else:
                faces = mesh.faces
            
            vertices = mesh.vertices
            tris = vertices[faces]

            for name, params in view_params.items():
                out_path = os.path.join(output_dir, f"{base_name}_{name}.svg")
                
                fig = plt.figure(figsize=(5, 5))
                ax = fig.add_subplot(111, projection='3d')
                
                # Attempt Orthographic Projection
                try:
                    ax.set_proj_type('ortho')
                except: pass

                # Style: White Face, Dark Grey Edges (Technical)
                pc = art3d.Poly3DCollection(tris, alpha=1.0, linewidths=0.1, edgecolors=(0.2, 0.2, 0.2, 1.0))
                pc.set_facecolor('white')
                ax.add_collection3d(pc)

                # Auto-scale View Limits to BBox
                min_v = np.min(vertices, axis=0)
                max_v = np.max(vertices, axis=0)
                max_range = np.max(max_v - min_v)
                mid_v = (max_v + min_v) / 2
                
                ax.set_xlim(mid_v[0] - max_range/2, mid_v[0] + max_range/2)
                ax.set_ylim(mid_v[1] - max_range/2, mid_v[1] + max_range/2)
                ax.set_zlim(mid_v[2] - max_range/2, mid_v[2] + max_range/2)
                
                ax.set_axis_off()
                ax.view_init(elev=params["elev"], azim=params["azim"])
                
                # Save as SVG
                plt.savefig(out_path, bbox_inches='tight', pad_inches=0, transparent=True, format='svg')
                plt.close(fig)
                
                images[name] = out_path

        except Exception as e:
             print(f"STL View Gen failed: {e}")
             import traceback
             traceback.print_exc()
             
        return images, bbox_obj

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

