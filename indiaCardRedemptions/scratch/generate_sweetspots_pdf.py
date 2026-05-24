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
            self.cell(0, 10, 'GLOBAL AIRLINE REDEMPTION & TRANSFER MANUAL', 0, 0, 'L')
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
        
        self.set_y(90)
        self.set_font('Helvetica', 'B', 24)
        self.set_text_color(249, 250, 251) # Light gray
        self.cell(0, 12, 'THE GLOBAL AIRLINE', 0, 1, 'C')
        self.cell(0, 12, 'REDEMPTION SWEETSPOTS', 0, 1, 'C')
        self.cell(0, 12, '& TRANSFER MANUAL', 0, 1, 'C')
        self.set_font('Helvetica', 'B', 28)
        self.set_text_color(217, 119, 6) # Orange/Gold
        self.cell(0, 15, 'MANUAL & PLAYBOOK', 0, 1, 'C')
        
        self.ln(15)
        self.set_draw_color(217, 119, 6)
        self.set_line_width(1)
        self.line(40, self.get_y(), 170, self.get_y())
        
        self.ln(15)
        self.set_font('Helvetica', 'I', 11)
        self.set_text_color(156, 163, 175)
        self.cell(0, 6, 'An Exhaustive Loyalty Program Matrix & Execution Guide', 0, 1, 'C')
        self.cell(0, 6, 'Compiled for High-Yield Indian Credit Card Portfolios', 0, 1, 'C')
        
        self.set_y(250)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(255, 255, 255)
        self.cell(0, 5, 'MAY 2026 EDITION', 0, 1, 'C')
        self.set_font('Helvetica', '', 9)
        self.set_text_color(156, 163, 175)
        self.cell(0, 5, 'RESTRICTED DISTRIBUTION | BARRY & CO. TRAVEL INTELLIGENCE', 0, 1, 'C')

    def add_section_header(self, title):
        self.set_font('Helvetica', 'B', 13)
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

    def add_program_profile(self, name, alliance, amex, axis, hsbc, desc, strategy):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(217, 119, 6)
        self.cell(0, 8, name, 0, 1)
        
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(107, 114, 128)
        self.cell(40, 5, f'Alliance: {alliance}', 0, 1)
        
        self.set_text_color(17, 24, 39)
        self.set_font('Helvetica', 'B', 9)
        self.cell(0, 5, 'Conversion Ratios from Indian Cards:', 0, 1)
        self.set_font('Helvetica', '', 9)
        self.cell(60, 5, f'- American Express MR: {amex}', 0, 0)
        self.cell(60, 5, f'- Axis Edge (Burgundy): {axis}', 0, 0)
        self.cell(60, 5, f'- HSBC Premier: {hsbc}', 0, 1)
        self.ln(1)
        
        self.set_font('Helvetica', '', 9)
        self.multi_cell(0, 5, f'Description: {desc}')
        self.multi_cell(0, 5, f'Strategic Booking Guide: {strategy}')
        self.ln(3)
        self.set_draw_color(229, 231, 235)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)

def sanitize(text):
    return text.replace('\u2014', '--').replace('\u2013', '-').replace('\u2018', "'").replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"').replace('\u2794', '->')

# Define Sweetspot Database
sweetspots_db = [
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
        "points": "60,000 - 70,000 points",
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
        "points": "37,500 - 50,000 miles",
        "notes": "Released on the 1st of every month via Promo Rewards. Offers 25-50% off select gateways. Highly dynamic pricing outside promos.",
        "cash": "~INR 20,000 (Moderate)"
    },
    {
        "section": "2. Transatlantic & European Sweetspots",
        "program": "Virgin Atlantic",
        "region": "US East Coast to London (LHR)",
        "cabin": "Business Class (Upper Class)",
        "points": "47,500 points",
        "notes": "Great baseline rate for transatlantic Upper Class on Virgin's A350/A330neo. High taxes but low point requirement.",
        "cash": "~INR 24,000 (Moderate)"
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
        "notes": "Alternative ANA premium cabin sweetspot. Highly competitive. Spot space via United/Aeroplan, then book via Virgin.",
        "cash": "~INR 8,000 (Low)"
    },
    {
        "section": "3. Transpacific & North American Sweetspots",
        "program": "Turkish Miles&Smiles",
        "region": "US Mainland to Hawaii (United Metal)",
        "cabin": "Business Class",
        "points": "12,500 miles (7,500 Economy)",
        "notes": "Incredible domestic partner pricing. Finding United Business saver space is difficult, but yields unparalleled returns.",
        "cash": "~INR 500 (Zero Surcharges)"
    },
    # 4. SOUTH AMERICA & LATIN AMERICA SWEETSPOTS
    {
        "section": "4. South America & Latin America Sweetspots",
        "program": "Air Canada Aeroplan",
        "region": "Europe to South America (TAP Metal)",
        "cabin": "Business Class",
        "points": "60,000 points",
        "notes": "Europe-South America band under 6,000 miles. Book TAP Portugal via Lisbon to Sao Paulo/Rio with low taxes.",
        "cash": "~CAD $50 (Zero Surcharges)"
    },
    {
        "section": "4. South America & Latin America Sweetspots",
        "program": "Flying Blue (AF-KLM)",
        "region": "Europe to South America (Air Europa)",
        "cabin": "Business Class",
        "points": "70,000 miles",
        "notes": "Book SkyTeam partner Air Europa via Madrid to South America. Surcharges are significantly lower than Air France/KLM flights.",
        "cash": "~INR 15,000 (Low)"
    }
]

# Define Loyalty Program Profiles
programs_db = [
    {
        "name": "British Airways Executive Club (Avios)",
        "alliance": "Oneworld",
        "amex": "2:1 (0.50)",
        "axis": "5:4 (0.80)",
        "hsbc": "1:1 (1.00)",
        "desc": "A distance-based currency that is highly effective for short-haul non-stop flights and travel on Oneworld alliance members (including Qatar, JAL, American, Qantas).",
        "strategy": "Pool Avios by linking your BA account to Qatar Airways Privilege Club. Move points 1:1 instantly to bypass bank devaluations and optimize tax rates on premium bookings."
    },
    {
        "name": "Qatar Airways Privilege Club (Avios)",
        "alliance": "Oneworld",
        "amex": "2:1 (0.50)",
        "axis": "Deactivated",
        "hsbc": "1:1 (1.00)",
        "desc": "The primary program for booking Qatar Airways flagship Qsuite Business Class cabins and flights via Doha to Africa, Europe, and North America.",
        "strategy": "Axis Bank points cannot transfer directly to Qatar due to the April 2026 devaluation. Instead, transfer Axis points to BA Avios (5:4), then link and transfer from BA to Qatar 1:1."
    },
    {
        "name": "Cathay Pacific (Asia Miles)",
        "alliance": "Oneworld",
        "amex": "2:1 (0.50)",
        "axis": "No Pathway",
        "hsbc": "1:1 (1.00)",
        "desc": "A distance-based program offering excellent value for direct routes to Asia and multi-carrier Oneworld custom booking charts.",
        "strategy": "Redeem on Cathay Pacific widebodies departing India to Hong Kong in Business Class for 25k miles (one-way). Excellent award availability compared to partner bookings."
    },
    {
        "name": "Air Canada Aeroplan",
        "alliance": "Star Alliance",
        "amex": "No Pathway",
        "axis": "5:4 (0.80)",
        "hsbc": "1:1 (1.00)",
        "desc": "A major Star Alliance program utilizing a distance-based partner award chart. Notable for never charging carrier-imposed fuel surcharges.",
        "strategy": "Use to book Lufthansa, SWISS, Turkish, and Singapore Airlines. Add stopovers on one-way international award tickets for just 5,000 points."
    },
    {
        "name": "Singapore Airlines KrisFlyer",
        "alliance": "Star Alliance",
        "amex": "2:1 (0.50)",
        "axis": "5:4 (0.80)",
        "hsbc": "1:1 (1.00)",
        "desc": "The exclusive gateway for booking Singapore Airlines flagship First Class, Suites, and Business Class cabin awards.",
        "strategy": "Utilize Spontaneous Escapes monthly promotions for a 30% discount on saver tickets. Star Alliance intra-Asia business class is 17,500 miles."
    },
    {
        "name": "Air France-KLM Flying Blue",
        "alliance": "SkyTeam",
        "amex": "No Pathway",
        "axis": "5:4 (0.80)",
        "hsbc": "1:1 (1.00)",
        "desc": "A dynamic-pricing SkyTeam currency offering extensive network reach to North and South America via Paris (CDG) and Amsterdam (AMS).",
        "strategy": "Check Promo Rewards on the 1st of every month for 25-50% off select routes. Book TAP Air Portugal or Air Europa via Flying Blue to fly to South America with minimal fuel surcharges."
    },
    {
        "name": "Virgin Atlantic Flying Club",
        "alliance": "SkyTeam",
        "amex": "2:1 (0.50)",
        "axis": "No Pathway",
        "hsbc": "No Pathway",
        "desc": "SkyTeam loyalty program offering key premium cabin partner redemptions with unique booking parameters.",
        "strategy": "Book ANA First Class (US-Japan) for 55k-60k miles. Book Delta One to Europe (excluding UK) for 50k points."
    }
]

def main():
    pdf = SweetspotsPDF(orientation='P', unit='mm', format='A4')
    pdf.alias_nb_pages()
    
    # 1. Title Page
    pdf.add_title_page()
    
    # 2. Part I: Sweetspots Catalog
    current_section = None
    for item in sweetspots_db:
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
        
    # 3. Part II: Loyalty Program Profiles & Indian Transfer Guides
    pdf.add_page()
    pdf.add_section_header("PART II: Loyalty Program Profiles & Transfer Guides")
    
    for prog in programs_db:
        # Check if we need to add a page to avoid awkward cuts
        if pdf.get_y() > 220:
            pdf.add_page()
        pdf.add_program_profile(
            name=sanitize(prog["name"]),
            alliance=sanitize(prog["alliance"]),
            amex=sanitize(prog["amex"]),
            axis=sanitize(prog["axis"]),
            hsbc=sanitize(prog["hsbc"]),
            desc=sanitize(prog["desc"]),
            strategy=sanitize(prog["strategy"])
        )

    # 4. Part III: Step-by-Step Point Transfer Instructions
    if pdf.get_y() > 180:
        pdf.add_page()
    else:
        pdf.ln(5)
    pdf.add_section_header("PART III: Step-by-Step Point Transfer Instructions")
    
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(0, 6, '1. Point Account Name Alignment', 0, 1)
    pdf.set_font('Helvetica', '', 9)
    pdf.multi_cell(0, 5, 'Before initiating transfers, ensure that the first, middle, and last names on your credit card matches the frequent flyer profile exactly. Any mismatch will trigger a system rejection, locking points for up to 14 days.')
    pdf.ln(3)

    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(0, 6, '2. American Express India Transfer Procedure', 0, 1)
    pdf.set_font('Helvetica', '', 9)
    pdf.multi_cell(0, 5, 'Log in to the Amex India online portal -> Navigate to "Use Points" -> "Transfer Points / Travel Partners" -> Link your airline partner program membership number -> Select the transfer quantity -> Confirm. Transfers to Virgin and BA are typically instant.')
    pdf.ln(3)

    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(0, 6, '3. Axis Bank (Edge Rewards) Transfer Procedure', 0, 1)
    pdf.set_font('Helvetica', '', 9)
    pdf.multi_cell(0, 5, 'Log in to the Axis Edge Rewards web portal or mobile app -> Select "Miles Transfer" -> Select your target frequent flyer partner (e.g. Aeroplan, Flying Blue, or British Airways) -> Enter account number -> Select transfer quantity -> Submit. Conversions typically post in 24 - 48 hours.')
    pdf.ln(3)

    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(0, 6, '4. HSBC India Premier Transfer Procedure', 0, 1)
    pdf.set_font('Helvetica', '', 9)
    pdf.multi_cell(0, 5, 'Log in to HSBC India Online Banking -> Select "Credit Card Rewards" -> "Points Transfer" -> Link target frequent flyer membership details -> Enter redemption units -> Submit. Transfers post within 48 to 72 hours.')
        
    output_path = os.path.abspath("docs/reference/global_airline_sweetspots.pdf")
    # Ensure folder exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    pdf.output(output_path)
    print(f"PDF successfully updated at: {output_path}")

if __name__ == "__main__":
    main()
