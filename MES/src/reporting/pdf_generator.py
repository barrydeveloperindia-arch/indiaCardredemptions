
import os
import qrcode
from fpdf import FPDF
from datetime import datetime
from PIL import Image

class JobSheetGenerator:
    """
    Generates a PDF Job Traveler with QR Code and Work Instructions.
    Using FPDF2 and QRCode.
    """
    
    def __init__(self, output_dir="storage/reports"):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
            
    def generate_pdf(self, job_data, base_url="http://localhost:5173"):
        job_id = job_data.get("job_id", "UNKNOWN")
        order_id = job_data.get("order_id", "UNKNOWN")
        machine_id = job_data.get("machine_id", "UNKNOWN")
        status = job_data.get("status", "QUEUED")
        
        # 1. Generate QR Code
        qr_data = f"{base_url}/orders/{order_id}" # Deep link to Order/Job detail
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        qr_path = os.path.join(self.output_dir, f"qr_{job_id}.png")
        img.save(qr_path)
        
        # 2. Create PDF
        pdf = FPDF()
        pdf.add_page()
        
        # -- Header --
        pdf.set_font("helvetica", "B", 20)
        pdf.cell(0, 10, "Englabs MES - Digital Traveler", new_x="LMARGIN", new_y="NEXT", align='C')
        pdf.ln(5)
        
        # -- Job Info Block --
        pdf.set_font("helvetica", "B", 12)
        pdf.set_fill_color(240, 240, 240)
        pdf.cell(0, 10, f"JOB ID: {job_id}", fill=True, new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_font("helvetica", "", 10)
        pdf.ln(2)
        pdf.cell(50, 8, f"Order ID: {order_id}")
        pdf.cell(50, 8, f"Customer: {job_data.get('customer_id', 'N/A')}")
        pdf.cell(50, 8, f"Priority: {job_data.get('priority_level', 1)}")
        pdf.ln(8)
        
        pdf.cell(50, 8, f"Machine: {machine_id}")
        pdf.cell(50, 8, f"Material: {job_data.get('technical_requirements', {}).get('material', 'PLA')}")
        pdf.cell(50, 8, f"Status: {status}")
        pdf.ln(12)
        
        # -- QR Code --
        # Place QR Code in top right or prominent spot
        # We'll put it in the center for now
        pdf.image(qr_path, x=140, y=30, w=50) 
        
        # -- 3D Thumbnail (Placeholder if not available) --
        # Try to find a real thumbnail
        # Assuming cad_file_path is like 'storage/parts/cube.stl'
        # We usually generated thumbnails in 'storage/parts/cube.stl.png' (if view_viewer_assets test is right)
        # But for now, we'll look for simple substitution
        
        cad_path = job_data.get('cad_file_path', "")
        thumb_path = ""
        if cad_path:
             # Heuristic: verify_thumbnail.py used .png suffix
             potential_thumb = cad_path + ".png" 
             if os.path.exists(potential_thumb):
                 thumb_path = potential_thumb
        
        if thumb_path:
             pdf.image(thumb_path, x=10, y=80, w=80)
             pdf.set_y(150)
        else:
             pdf.set_draw_color(200, 200, 200)
             pdf.rect(10, 80, 80, 60)
             pdf.set_xy(10, 105)
             pdf.set_font("helvetica", "I", 10)
             pdf.cell(80, 10, "No Preview Available", align='C')
             pdf.set_y(150)

        # -- Work Instructions --
        pdf.set_font("helvetica", "B", 14)
        pdf.cell(0, 10, "Work Instructions", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("helvetica", "", 10)
        
        instructions = [
            "1. Verify material matches specification (PLA/Steel).",
            "2. Scan QR code to load 3D visual on tablet.",
            "3. Ensure bed is leveled and clean.",
            "4. Start print job on machine interface.",
            "5. Upon completion, mark status as 'Washing' via QR link.",
        ]
        
        for instr in instructions:
            pdf.cell(0, 8, instr, new_x="LMARGIN", new_y="NEXT")
            
        # -- Footer --
        pdf.set_y(-30)
        pdf.set_font("helvetica", "I", 8)
        pdf.cell(0, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", align='C')
        
        # Save
        filename = f"Traveler_{job_id}.pdf"
        output_path = os.path.join(self.output_dir, filename)
        pdf.output(output_path)
        
        # Cleanup temp QR
        try:
             os.remove(qr_path)
        except:
            pass
            
        return output_path

