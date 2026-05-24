import os
from fpdf import FPDF

class SweetspotsPDF(FPDF):
    def header(self):
        # Draw a header background strip on later pages
        if self.page_no() > 1:
            self.set_fill_color(17, 24, 39) # Deep dark gray/blue
            self.rect(0, 0, 210, 15, 'F')
            self.set_y(2)
            self.set_font('Helvetica', 'B', 9)
            self.set_text_color(255, 255, 255)
            self.cell(0, 10, 'GLOBAL AIRLINE REDEMPTION SWEETSPOTS MANUAL', 0, 0, 'L')
            self.set_font('Helvetica', 'I', 8)
            self.cell(0, 10, 'May 2026 Edition', 0, 0, 'R')
            self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(156, 163, 175) # Gray-400
        self.cell(0, 10, f'Page {self.page_no()} of {{nb}} | Private Research & Travel Advisory', 0, 0, 'C')

    def add_title_page(self):
        self.add_page()
        # Title Page Design
        self.set_fill_color(17, 24, 39)
        self.rect(0, 0, 210, 297, 'F') # Dark cover page
        
        self.set_y(100)
        self.set_font('Helvetica', 'B', 24)
        self.set_text_color(249, 250, 251) # Light gray
        self.cell(0, 12, 'THE GLOBAL AIRLINE', 0, 1, 'C')
        self.cell(0, 12, 'REDEMPTION SWEETSPOTS', 0, 1, 'C')
        self.set_font('Helvetica', 'B', 28)
        self.set_text_color(217, 119, 6) # Orange/Gold
        self.cell(0, 15, 'MANUAL', 0, 1, 'C')
        
        self.ln(20)
        self.set_draw_color(217, 119, 6)
        self.set_line_width(1)
        self.line(40, self.get_y(), 170, self.get_y())
        
        self.ln(20)
        self.set_font('Helvetica', 'I', 11)
        self.set_text_color(156, 163, 175)
        self.cell(0, 6, 'An Exhaustive Geographical & Loyalty Program Blueprint', 0, 1, 'C')
        self.cell(0, 6, 'Compiled for High-Yield Indian Credit Card Portfolios', 0, 1, 'C')
        
        self.set_y(250)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(255, 255, 255)
        self.cell(0, 5, 'MAY 2026 EDITION', 0, 1, 'C')
        self.set_font('Helvetica', '', 9)
        self.set_text_color(156, 163, 175)
        self.cell(0, 5, 'RESTRICTED DISTRIBUTION | BARRY & CO. TRAVEL INTELLIGENCE', 0, 1, 'C')

    def add_section_header(self, title):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(17, 24, 39)
        self.ln(5)
        # Background bar for section headers
        self.set_fill_color(243, 244, 246)
        self.cell(0, 8, f'  {title.upper()}', 0, 1, 'L', fill=True)
        self.ln(3)

    def add_sweetspot_card(self, program, region, cabin, points, cash, notes):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(217, 119, 6)
        self.cell(40, 6, f'Program: {program}', 0, 0)
        self.set_text_color(107, 114, 128)
        self.cell(60, 6, f'Region: {region}', 0, 0)
        self.set_text_color(17, 24, 39)
        self.cell(90, 6, f'Cabin: {cabin}', 0, 1)

        self.set_font('Helvetica', 'B', 10)
        self.cell(40, 6, f'Points: {points}', 0, 0)
        self.set_text_color(185, 28, 28) # Red for cash taxes
        self.cell(60, 6, f'Taxes/Fees: {cash}', 0, 1)
        self.set_text_color(17, 24, 39)

        self.set_font('Helvetica', '', 9)
        self.multi_cell(0, 5, f'Strategic Note: {notes}')
        self.ln(3)
        self.set_draw_color(229, 231, 235)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)

def sanitize(text):
    return text.replace('\u2014', '--').replace('\u2013', '-').replace('\u2018', "'").replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"')

# Define Sweetspot Database
database = [
    # 1. INDIA ORIGINATING
    {
        "section": "1. India Originating Sweetspots",
        "program": "Cathay (Asia Miles)",
        "region": "India to Hong Kong (DEL/BOM-HKG)",
        "cabin": "Business Class (Flatbed)",
        "points": "25,000 miles",
        "cash": "~INR 8,500 (Moderate)",
        "notes": "Uses Cathay's Type 1 short-haul chart. Booking widebody aircraft (A350/777) yields exceptional lie-flat value for just 25k miles."
    },
    {
        "section": "1. India Originating Sweetspots",
        "program": "Singapore KrisFlyer",
        "region": "India to Singapore (Direct)",
        "cabin": "Business Class",
        "points": "43,000 miles (30,100 on Promo)",
        "cash": "~INR 4,500 (Low)",
        "notes": "Saver business award. Combine with SQ Spontaneous Escapes monthly promotions for a 30% discount down to 30,100 miles."
    },
    {
        "section": "1. India Originating Sweetspots",
        "program": "Air Canada Aeroplan",
        "region": "India to Europe (Swiss/Lufthansa)",
        "cabin": "Business Class",
        "points": "60,000 – 70,000 points",
        "cash": "~CAD $55 (Zero Surcharges)",
        "notes": "Aeroplan does not pass on Lufthansa Group fuel surcharges. Highly recommended over British Airways or Qatar to avoid high taxes."
    },
    # 2. TRANSATLANTIC & EUROPEAN SWEETSPOTS
    {
        "section": "2. Transatlantic & European Sweetspots",
        "program": "Iberia Plus (Avios)",
        "region": "US East (BOS/JFK/ORD) to Madrid",
        "cabin": "Business Class (Off-Peak)",
        "points": "34,000 Avios",
        "cash": "~INR 12,000 (Low)",
        "notes": "One of the most famous long-haul premium cabin bargains in the world. Requires off-peak dates. Amex and HSBC transfer partners."
    },
    {
        "section": "2. Transatlantic & European Sweetspots",
        "program": "Flying Blue (AF-KLM)",
        "region": "US to Europe (AF/KLM Metal)",
        "cabin": "Business Class (Promo Reward)",
        "points": "37,500 – 50,000 miles",
        "cash": "~INR 20,000 (Moderate)",
        "notes": "Released on the 1st of every month via Promo Rewards. Offers 25-50% off select gateways. Highly dynamic pricing outside promos."
    },
    {
        "section": "2. Transatlantic & European Sweetspots",
        "program": "Virgin Atlantic",
        "region": "US East Coast to London (LHR)",
        "cabin": "Business Class (Upper Class)",
        "points": "47,500 points",
        "cash": "~INR 24,000 (Moderate)",
        "notes": "Great baseline rate for transatlantic Upper Class on Virgin's A350/A330neo. High taxes but low point requirement."
    },
    # 3. TRANSPACIFIC & NORTH AMERICAN SWEETSPOTS
    {
        "section": "3. Transpacific & North American Sweetspots",
        "program": "Virgin Atlantic",
        "region": "US West Coast to Japan (ANA Metal)",
        "cabin": "First Class",
        "points": "55,000 points (60,000 from East)",
        "cash": "~INR 8,000 (Low)",
        "notes": "The legendary 'Holy Grail' redemption. Must be booked on ANA metal via Virgin Atlantic telephone/chat support. Extremely high value."
    },
    {
        "section": "3. Transpacific & North American Sweetspots",
        "program": "Virgin Atlantic",
        "region": "US West Coast to Japan (ANA Metal)",
        "cabin": "Business Class",
        "points": "45,000 points (47,500 from East)",
        "cash": "~INR 8,000 (Low)",
        "notes": "Alternative ANA premium cabin sweetspot. Highly competitive. Spot space via United/Aeroplan, then book via Virgin."
    },
    {
        "section": "3. Transpacific & North American Sweetspots",
        "program": "Turkish Miles&Smiles",
        "region": "US Mainland to Hawaii (United Metal)",
        "cabin": "Business Class",
        "points": "12,500 miles (7,500 Economy)",
        "cash": "~INR 500 (Zero Surcharges)",
        "notes": "Incredible domestic partner pricing. Finding United Business saver space is difficult, but yields unparalleled returns."
    },
    # 4. SOUTH AMERICA & LATIN AMERICA SWEETSPOTS
    {
        "section": "4. South America & Latin America Sweetspots",
        "program": "Air Canada Aeroplan",
        "region": "Europe to South America (TAP Metal)",
        "cabin": "Business Class",
        "points": "60,000 points",
        "cash": "~CAD $50 (Zero Surcharges)",
        "notes": "Europe-South America band under 6,000 miles. Book TAP Portugal via Lisbon to São Paulo/Rio with low taxes."
    },
    {
        "section": "4. South America & Latin America Sweetspots",
        "program": "Flying Blue (AF-KLM)",
        "region": "Europe to South America (Air Europa)",
        "cabin": "Business Class",
        "points": "70,000 miles",
        "cash": "~INR 15,000 (Low)",
        "notes": "Book SkyTeam partner Air Europa via Madrid to South America. Surcharges are significantly lower than Air France/KLM flights."
    },
    # 5. SPECIALIST PROGRAM RULES & TRICKS
    {
        "section": "5. Specialist Program Rules & Tricks",
        "program": "United MileagePlus",
        "region": "Global (Excursionist Perk)",
        "cabin": "Any Class",
        "points": "Free Middle Segment",
        "cash": "Zero Additional Taxes",
        "notes": "Book a roundtrip / multi-city award between two zones, and the middle segment inside the destination zone is completely free (0 miles)."
    },
    {
        "section": "5. Specialist Program Rules & Tricks",
        "program": "Air Canada Aeroplan",
        "region": "Global (Stopover Trick)",
        "cabin": "Any Class",
        "points": "Add Stopover for +5,000 pts",
        "cash": "CAD $39 Booking Fee",
        "notes": "Enables double-destination bookings on a single one-way ticket. For example, stop in Dubai/Singapore on the way to Australia or Europe."
    }
]

def main():
    pdf = SweetspotsPDF(orientation='P', unit='mm', format='A4')
    pdf.alias_nb_pages()
    
    # 1. Title Page
    pdf.add_title_page()
    
    # 2. Content Pages
    current_section = None
    
    for item in database:
        if item["section"] != current_section:
            current_section = item["section"]
            pdf.add_page()
            pdf.add_section_header(sanitize(current_section))
            
        pdf.add_sweetspot_card(
            program=sanitize(item["program"]),
            region=sanitize(item["region"]),
            cabin=sanitize(item["cabin"]),
            points=sanitize(item["points"]),
            cash=sanitize(item["cash"]),
            notes=sanitize(item["notes"])
        )
        
    output_path = os.path.abspath("docs/reference/global_airline_sweetspots.pdf")
    # Ensure folder exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    pdf.output(output_path)
    print(f"PDF successfully generated at: {output_path}")

if __name__ == "__main__":
    main()
