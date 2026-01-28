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
        pdf_path = os.path.join(output_dir, f"{base_name}_drawing.pdf")
        
        # 0. Efficiency Check: DISABLED for Template Update Debugging
        # if os.path.exists(pdf_path):
        #     # Reconstruct expected paths for views
        #     cached_results = {}
        #     for view in ["top", "front", "right", "iso"]:
        #         svg_path = os.path.join(output_dir, f"{base_name}_{view}.svg")
        #         if os.path.exists(svg_path):
        #             cached_results[view] = DrawingService._format_web_path(svg_path)
        #     
        #     cached_results["pdf_url"] = DrawingService._format_web_path(pdf_path)
        #     print(f"Drawing exists for {filename}, returning cached version.")
        #     return cached_results
        
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
        """Composes the A3 Landscape PDF matching Englabs Professional Standard."""
        # A3 Landscape: 420mm x 297mm
        pdf = FPDF(orientation='L', unit='mm', format='A3')
        
        # CRITICAL FIX: Disable all automatic page creation mechanisms
        pdf.set_auto_page_break(False)
        pdf.set_margins(0, 0, 0) # Use manual margins
        
        pdf.add_page()
        
        # Dimensions
        w, h = 420, 297
        margin = 10
        
        pdf.set_line_width(0.3)
        pdf.set_font('helvetica', '', 8)
        
        # ==========================================
        # 1. ZONED BORDER (1-8, A-F)
        # ==========================================
        # Draw Outer Frame
        pdf.rect(margin, margin, w - 2*margin, h - 2*margin)
        
        # Draw Ticks and Labels
        # Horizontal (1-8)
        zone_w = (w - 2*margin) / 8
        for i in range(8):
            # Top Ticks
            x = margin + i * zone_w
            pdf.line(x, margin, x, margin + 2)
            # Bottom Ticks
            pdf.line(x, h - margin, x, h - margin - 2)
            # Number Labels (Centered in zone)
            pdf.set_xy(x, margin - 8)
            pdf.cell(zone_w, 8, str(i+1), align='C')
            pdf.set_xy(x, h - margin)
            pdf.cell(zone_w, 8, str(i+1), align='C')
            
        # Vertical (F-A) - Note: Image shows A at top? Let's assume A top.
        # Screenshot shows A at top. A-F. 6 zones? screenshot shows A, B, C...
        zone_h = (h - 2*margin) / 6
        labels = ['A', 'B', 'C', 'D', 'E', 'F']
        for i in range(6):
            y = margin + i * zone_h
            # Left Ticks
            pdf.line(margin, y, margin + 2, y)
            # Right Ticks
            pdf.line(w - margin, y, w - margin - 2, y)
            # Letter Labels
            pdf.set_xy(margin - 8, y)
            pdf.cell(8, zone_h, labels[i], align='C')
            pdf.set_xy(w - margin, y)
            pdf.cell(8, zone_h, labels[i], align='C')

        # ==========================================
        # 2. TITLE BLOCK & TABLES (Bottom)
        # ==========================================
        # Height of bottom block area approx 40mm
        # Width: Full width minus revisions? 
        # Based on image, Revision table is Left, Title Block is Right.
        
        # Dimensions derived from standard layouts:
        # Title Block Width: ~180mm (Right aligned)
        # Revision Block: From Left Margin to Title Block
        
        tb_height = 50
        tb_width = 170
        tb_x = w - margin - tb_width
        tb_y = h - margin - tb_height
        
        # --- Revision Table (Left) ---
        # Columns: REV(15), DATE(25), CREATED BY(35), CHK'D BY(35), APPV'D BY(35), REV DESCRIPTION(Remaining)
        # Header Height: 10mm
        # Rows: 3 empty rows + Header
        rev_x = margin
        rev_w = tb_x - margin # Fill space to title block
        rev_y_start = h - margin - 35 # 3 rows + header? Let's match bottom alignment
        
        # Header
        pdf.set_xy(rev_x, rev_y_start)
        pdf.set_font('helvetica', 'B', 9)
        cols = [
            ("REV.", 15), ("DATE", 25), ("CREATED\nBY", 30), 
            ("CHK'D BY", 30), ("APPV'D\nBY", 30), ("REV DESCRIPTION", rev_w - 130)
        ]
        
        # Draw Header Background? No, simple lines.
        current_x = rev_x
        for title, width in cols:
            pdf.rect(current_x, rev_y_start, width, 10)
            pdf.set_xy(current_x, rev_y_start)
            # Handle multiline headers
            if '\n' in title:
                pdf.set_font('helvetica', 'B', 7)
                pdf.multi_cell(width, 5, title, align='C')
            else:
                pdf.set_font('helvetica', 'B', 9)
                pdf.cell(width, 10, title, align='C', border=0)
            current_x += width
            
        # Draw Default "Rev 0" Row
        row_y = rev_y_start + 10
        pdf.rect(rev_x, row_y, rev_w, 8)
        current_x = rev_x
        data = ["0", datetime.date.today().strftime("%d-%m-%Y"), "SYSTEM", "AUTO", "AUTO", "INITIAL DRAWING GENERATION"]
        pdf.set_font('helvetica', '', 8)
        for i, (text, width) in enumerate(zip(data, [c[1] for c in cols])):
            pdf.rect(current_x, row_y, width, 8)
            pdf.set_xy(current_x, row_y)
            pdf.cell(width, 8, text, align='C', border=0)
            current_x += width
            
        # "Last 3 revisions" Note
        pdf.set_xy(rev_x, row_y + 8.5)
        pdf.set_font('helvetica', 'B', 7)
        pdf.cell(100, 5, "NOTE: LAST THREE REVISIONS ARE SHOWN ONLY")

        # --- Main Title Block (Right) ---
        # Structure:
        # Top Row: "FINISH:", "MATERIAL:", "WEIGHT:"
        # Middle Left: Tolerance Table (ISO-2768) - Simplified image or text
        # Middle Right: Logo Box
        # Bottom Strip: Title, Dwg No, Sheet
        
        pdf.set_draw_color(0, 0, 0)
        pdf.rect(tb_x, tb_y, tb_width, tb_height)
        
        
        # 1. Top Row (Finish/Mat/Weight) - Height 10mm
        pdf.line(tb_x, tb_y + 10, tb_x + tb_width, tb_y + 10)
        col_w = tb_width / 3
        
        # Labels
        pdf.set_font('helvetica', 'B', 7)
        pdf.text(tb_x + 2, tb_y + 3, "FINISH:")
        pdf.text(tb_x + 2, tb_y + 8, "BLACK POWDER COATED") # Default per image
        
        pdf.line(tb_x + col_w, tb_y, tb_x + col_w, tb_y + 10)
        pdf.text(tb_x + col_w + 2, tb_y + 3, "MATERIAL:")
        pdf.text(tb_x + col_w + 2, tb_y + 8, "PLA / PETG (Default)") 
        
        pdf.line(tb_x + 2*col_w, tb_y, tb_x + 2*col_w, tb_y + 10)
        pdf.text(tb_x + 2*col_w + 2, tb_y + 3, "WEIGHT:")
        pdf.text(tb_x + 2*col_w + 2, tb_y + 8, "N/A")
        
        # --- LOGO AREA (Right Side) ---
        logo_path = "/app/src/assets/logo_clean.png"
        if os.path.exists(logo_path):
            try:
                # Center Logo in the box (60x40 area approx)
                # Box Top: tb_y+10, Box Bottom: tb_y+35 (Title strip below at 35?)
                # Actually, Title strip (Bottom 15mm) usually spans FULL width? 
                # Screenshot: Title block is bottom right. Logo is ABOVE the "Title/Dwg" strip?
                # Screenshot: Logo is in a box. "Title" is to the right? No.
                # Look at screenshot:
                # Bottom Row has "Size (A3)", "Sheet", "Rev".
                # Above that is "Title: LOWER BODY...".
                # Above that is "Englabs Logo" (Right) and "Tolerance Class" (Left).
                pass
            except: pass
            
        # Re-evaluating Layout based on screenshot "Right Block":
        # Bottom Strip (Height 10): | Size A3 | Sheet X of Y | Rev |
        # Row Above (Height 10): | Dwg No ... |
        # Row Above (Height 10): | Title: ... |
        # Row Below Top (Height 20): | Left: Tol Table | Right: Logo |
        
        # Correct Layout Refined:
        # Top Row (10mm): Finish/Mat/Weight (Done)
        # Mid Row (25mm): 
        #    Left (80mm): Tolerance Class (ISO-2768)
        #    Right (Remaining): Logo (Englabs) centered
        # Bottom Area (15mm?):
        #    Row 1: Title (Left label, Value)
        #    Row 2: Dwg No (Left), Sheet (Right)
        
        # Let's adjust
        mid_y = tb_y + 10
        mid_h = 25
        
        # Mid Divider (Vert)
        mid_divider_x = tb_x + 90 # Tolerance table width
        pdf.line(mid_divider_x, mid_y, mid_divider_x, mid_y + mid_h)
        
        # Tolerance Table (Mockup text)
        pdf.set_xy(tb_x + 2, mid_y + 2)
        pdf.set_font('helvetica', 'B', 8)
        pdf.cell(80, 5, "TOLERANCE CLASS (ISO-2768)", 0, 1)
        pdf.set_font('helvetica', '', 6)
        pdf.set_x(tb_x + 2)
        pdf.multi_cell(85, 3, "Linear Dimensions:\n0-3: +/-0.1\n3-6: +/-0.1\n6-30: +/-0.2\n30-120: +/-0.3")
        
        # LOGO PLACEMENT
        # Box: x=mid_divider_x, y=mid_y, w=tb_width-90, h=mid_h
        logo_area_w = tb_width - 90
        logo_area_x = mid_divider_x
        
        if os.path.exists(logo_path):
            try:
                # Fit height 20mm, center in area
                l_h = 20
                margin_x = (logo_area_w - (l_h * 1.5)) / 2 # Approx aspect ratio
                # Just center blindly
                pdf.image(logo_path, x=logo_area_x + 10, y=mid_y + 2.5, h=20)
            except: pass
            
        # Bottom Strip (Title / Dwg)
        bot_y = mid_y + mid_h
        pdf.line(tb_x, bot_y, tb_x + tb_width, bot_y)
        
        # Bottom is split into Title (Top) and Dwg/Sheet (Bottom)?
        # Screenshot shows:
        # Left Block: Title (2 lines). Right Block: Dwg No?
        # Let's do a clean Standard Layout:
        # | TITLE: <Part Name>                | DWG NO: ... |
        # | SCALE: NTS | SHEET: 1 OF 1 | A3 | REV: 0      |
        
        # Row 1 (Title)
        pdf.line(tb_x, bot_y + 8, tb_x + tb_width, bot_y + 8)
        pdf.set_xy(tb_x, bot_y)
        pdf.set_font('helvetica', 'B', 7)
        pdf.cell(15, 8, "  TITLE:", border=0)
        pdf.set_font('helvetica', 'B', 12)
        pdf.cell(100, 8, part_name.upper(), border=0)
        
        # Dwg No on right of title?
        pdf.set_xy(tb_x + 110, bot_y)
        pdf.set_font('helvetica', 'B', 7)
        pdf.cell(15, 8, "DWG NO:", border=0)
        pdf.set_font('helvetica', '', 9)
        pdf.cell(40, 8, f"EL-{datetime.date.today().strftime('%Y%m%d')}-001", border=0)
        
        # Row 2 (Sheet Info) - Bottom most
        # Columns: Scale, Sheet, Size, Rev
        last_y = bot_y + 8
        # Lines
        # Scale | Sheet | Size | Rev
        col_w = tb_width / 4
        pdf.line(tb_x + col_w, last_y, tb_x + col_w, tb_y + tb_height)
        pdf.line(tb_x + 2*col_w, last_y, tb_x + 2*col_w, tb_y + tb_height)
        pdf.line(tb_x + 3*col_w, last_y, tb_x + 3*col_w, tb_y + tb_height)
        
        pdf.set_font('helvetica', '', 8)
        
        # Scale
        pdf.set_xy(tb_x, last_y)
        pdf.cell(col_w, 7, "SCALE: N.T.S", align='C')
        # Sheet
        pdf.set_xy(tb_x + col_w, last_y)
        pdf.cell(col_w, 7, "SHEET 1 OF 1", align='C')
        # Size
        pdf.set_xy(tb_x + 2*col_w, last_y)
        pdf.cell(col_w, 7, "SIZE: A3", align='C')
        # Rev
        pdf.set_xy(tb_x + 3*col_w, last_y)
        pdf.cell(col_w, 7, "REV: 0", align='C')

        # ==========================================
        # 3. NOTES SECTION (Right Side, Above Title Block)
        # ==========================================
        note_x = w - margin - 80 # 80mm wide column
        note_y = h - margin - tb_height - 60 # 60mm high area above block
        
        pdf.set_xy(note_x, note_y)
        pdf.set_font('helvetica', 'B', 10)
        pdf.cell(80, 5, "NOTES:", 0, 1)
        pdf.set_font('helvetica', '', 7)
        notes = [
            "1) ALL DIMENSIONS ARE IN MM.",
            "2) ANGLES INDICATE BENDING DIRECTION.",
            "3) DIMENSIONS ENCLOSED ARE CRITICAL.",
            "4) REFER 3D SOLID MODEL FOR MORE DETAILS.",
            "5) DEBURR AND BREAK SHARP EDGES.",
            "6) DO NOT SCALE THE DRAWING."
        ]
        pdf.set_x(note_x)
        pdf.multi_cell(80, 4, "\n".join(notes))
        
        # ==========================================
        # 4. VIEW PLACEMENT (A3 Centered)
        # ==========================================
        # Available area: Inside margins, left of notes/titleblock?
        # A3 is huge. We can center views in the main area.
        # Main area width approx: w - margin - margin - 10 (buffer)
        # But notes take right side. Let's use left ~300mm for views.
        
        vp_size = 100 # Larger views for A3
        
        # Grid layout for views
        # Top-Left (Top), Bottom-Left (Front), Bottom-Right (Right), Top-Right (Iso)
        # Center of drawing area (roughly):
        draw_center_x = (w - margin - 100) / 2 + margin
        draw_center_y = (h - margin - tb_height) / 2 + margin
        
        # Spacing
        spacing = 130
        
        pos = {
            "top":   (draw_center_x - spacing/2 - vp_size/2, draw_center_y - spacing/2 - vp_size/2),
            "front": (draw_center_x - spacing/2 - vp_size/2, draw_center_y + spacing/2 - vp_size/2),
            "right": (draw_center_x + spacing/2 - vp_size/2, draw_center_y + spacing/2 - vp_size/2),
            "iso":   (draw_center_x + spacing/2 - vp_size/2, draw_center_y - spacing/2 - vp_size/2)
        }
        
        for name, xy in pos.items():
            if name in images:
                pdf.image(images[name], x=xy[0], y=xy[1], w=vp_size, h=vp_size)
                
                # Label
                pdf.set_font('helvetica', 'B', 9)
                pdf.text(xy[0], xy[1] - 4, f"{name.upper()} VIEW")
                
                # Dimensions Overlay
                if bbox:
                    pdf.set_font('courier', 'B', 10)
                    pdf.set_text_color(255, 0, 0) 
                    
                    if name == "top":
                        pdf.text(xy[0] + vp_size/2 - 10, xy[1] + vp_size + 4, f"L: {bbox.xlen:.2f}mm")
                        pdf.text(xy[0] - 25, xy[1] + vp_size/2, f"D: {bbox.ylen:.2f}mm") 
                    elif name == "front":
                        pdf.text(xy[0] + vp_size/2 - 10, xy[1] + vp_size + 4, f"L: {bbox.xlen:.2f}mm")
                        pdf.text(xy[0] - 25, xy[1] + vp_size/2, f"H: {bbox.zlen:.2f}mm")
                    elif name == "right":
                        pdf.text(xy[0] + vp_size/2 - 10, xy[1] + vp_size + 4, f"D: {bbox.ylen:.2f}mm")
                        pdf.text(xy[0] - 25, xy[1] + vp_size/2, f"H: {bbox.zlen:.2f}mm")
                    
                    pdf.set_text_color(0, 0, 0)
        
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
            # Reduce faces for performance if huge
            # Optimization: 1500 faces is enough for wireframe visual, speeds up generation significantly (10s -> 3s)
            TARGET_FACES = 1500
            if len(mesh.faces) > TARGET_FACES:
                stride = len(mesh.faces) // TARGET_FACES
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

