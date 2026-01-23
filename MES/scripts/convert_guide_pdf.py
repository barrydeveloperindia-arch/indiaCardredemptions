from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'Englabs MES - Testing Guide', 0, 1, 'C')
        self.ln(10)

    def chapter_title(self, label):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 6, label, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('Arial', '', 11)
        self.multi_cell(0, 5, body)
        self.ln()

def convert_md_to_pdf(input_file, output_file):
    pdf = PDF()
    pdf.add_page()
    
    with open(input_file, 'r') as f:
        lines = f.readlines()
        
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith('## '):
            pdf.chapter_title(line.replace('## ', ''))
        elif line.startswith('# '):
            # Title is handled by header, but let's just print it bold
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, line.replace('# ', ''), 0, 1)
            pdf.ln(2)
        elif line.startswith('- [ ]'):
            pdf.set_font('Arial', '', 11)
            pdf.cell(10) # Indent
            pdf.cell(0, 5, '[ ] ' + line.replace('- [ ]', '').strip(), 0, 1)
        elif line.startswith('-'):
             pdf.set_font('Arial', '', 11)
             pdf.cell(5)
             pdf.cell(0, 5, chr(149) + ' ' + line[1:].strip(), 0, 1)
        elif line.startswith('```'):
            continue # Skip code block markers for simplicity or handle later
        else:
            pdf.set_font('Arial', '', 11)
            pdf.multi_cell(0, 5, line)
            
    pdf.output(output_file, 'F')
    print(f"PDF generated: {output_file}")

if __name__ == "__main__":
    md_path = "TESTING_GUIDE.md"
    pdf_path = r"storage\documents\TESTING_GUIDE.pdf"
    
    if os.path.exists(md_path):
        convert_md_to_pdf(md_path, pdf_path)
    else:
        print("MD file not found.")
