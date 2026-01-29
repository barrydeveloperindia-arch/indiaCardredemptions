import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add src to pythonpath
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.database.models import InventoryItem
from src.database.connection import DATABASE_URL

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# DB Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def main():
    db = SessionLocal()
    try:
        # Pre-defined list of inventory items to seed
        # Format: (code, name, unit (clean), cost (float))
        items_to_seed = [
            ("ENG001", "Chemilac Black paint", "ltr.", 510.00),
            ("ENG002", "CHEMILAC GREY PAINT", "ltr.", 510.00),
            ("ENG003", "Chemilac Thinner", "ltr.", 393.00),
            ("ENG004", "SBL PRIMER GREY", "ltr.", 490.00),
            ("ENG005", "SBL P.P. Primer", "ltr.", 465.00),
            ("ENG006", "SBL Black Paint", "ltr.", 520.00),
            ("ENG121", "SBL BLACK MATT", "ltr.", 557.00),
            ("ENG008", "SBL Glass Coat Black", "ltr.", 520.00),
            ("ENG009", "SBL MR Charcoal Paint", "ltr.", 739.00),
            ("ENG010", "SBL Red Paint", "ltr.", 739.00),
            ("ENG011", "Hikott Crystal Hardner", "ltr.", 832.00),
            ("ENG012", "Sevens PU Matt White", "ltr.", 850.00),
            ("ENG013", "Sevens PU Pearl White", "ltr.", 550.00),
            ("ENG014", "Sevens Black Paint(Gloss)", "ltr.", 850.00),
            ("ENG015", "Wanda Hardner", "ltr.", 628.00),
            ("ENG016", "Asian Paint Grey", "ltr.", 1082.00),
            ("ENG017", "Asian Paint Black", "ltr.", 1082.00),
            ("ENG018", "Acrylic Lacquer", "bottle", 250.00),
            ("ENG019", "Rit Black Dye", "bottle", 3332.00),
            ("ENG020", "Wood tech filter brown putty", "kg", 330.00),
            ("ENG021", "Duco PU Matt", "ltr.", 720.00),
            ("ENG022", "Rit Brown dye", "pack", 3336.00),
            ("ENG023", "PU Chemical Hikott", "ltr.", 850.00),
            ("ENG024", "Ad Bond Paper", "pack", 390.00),
            ("ENG025", "A4 Paper rim", "pack", 247.21),
            ("ENG026", "NOTES PADS", "pcs", 41.00),
            ("ENG027", "White Envelopes", "pcs", 1.62),
            ("ENG028", "White label Sticker", "roll", 2.00),
            ("ENG029", "Cell CR 2032", "pcs", 293.36),
            ("ENG030", "Cell GP 12V", "pcs", 38.98),
            ("ENG031", "(D) Size Big Bettrey", "pcs", 125.85),
            ("ENG032", "9V Battery", "pcs", 15.00),
            ("ENG033", "Clay", "pcs", 100.00),
            ("ENG034", "Dura Cell", "pcs", 0.00), # Price missing in source? Assuming 0 or handled later
            ("ENG035", "Book Marks", "pcs", 10.00),
            ("ENG036", "Binder Clips", "box", 44.00),
            ("ENG037", "Birthday Decoration", "pack", 10.00),
            ("ENG038", "Business Card Holder", "box", 4.00),
            ("ENG039", "Big Size Staple Pin", "box", 33.60),
            ("ENG040", "Small Size Staple Pin", "box", 33.60),
            ("ENG041", "Cutter Blade", "box", 4.90),
            ("ENG042", "Surgical Blade", "pcs", 5.70),
            ("ENG043", "Birthday Card", "pcs", 150.00),
            ("ENG044", "Insert M3*4", "pack", 3.50),
            ("ENG045", "AA Cell", "pcs", 12.00),
            ("ENG046", "AAA Cell", "pcs", 10.00),
            ("ENG047", "White Board Marker Ink", "bottle", 25.00),
            ("ENG048", "Inkjet Ink", "pack", 3000.00),
            ("ENG049", "Fevicol", "kg", 357.71),
            ("ENG050", "Sharpner", "pcs", 10.00),
            ("ENG051", "Pen", "pcs", 17.75),
            ("ENG052", "Pencil", "pcs", 10.00),
            ("ENG053", "Fevikwik", "pcs", 41.30),
            ("ENG054", "Fevibond", "pcs", 41.40),
            ("ENG055", "Araldite Glue", "pcs", 224.00),
            ("ENG056", "Painting Brush", "pcs", 333.40),
            ("ENG057", "Permanent Marker", "pcs", 20.00),
            ("ENG058", "Notice Board Pin", "box", 144.00),
            ("ENG059", "Fragile Sticker Roll", "roll", 1177.00),
            ("ENG060", "Cello Tape (1inch)", "roll", 0.00), # Price missing?
            ("ENG061", "Double Side Tape", "roll", 56.41),
            ("ENG062", "Masking Tape", "pcs", 21.00),
            ("ENG063", "Day Book", "pcs", 219.00),
            ("ENG064", "Attendance Register", "pcs", 150.00),
            ("ENG065", "L Folder Paper", "pcs", 10.00),
            ("ENG066", "A4 Colour Sheet", "pack", 330.00),
            ("ENG067", "A4 Courier Envelope", "pcs", 2.11),
            ("ENG068", "Clear Bag", "pcs", 41.66),
            ("ENG069", "Lamination Sheet", "pcs", 8.00),
            ("ENG070", "A3 Sheet", "pcs", 390.00),
            ("ENG071", "Surgical Blade Rod", "pcs", 260.00),
            ("ENG072", "Fevitite Glue", "pcs", 485.00),
            ("ENG073", "Plastic Box (small)", "box", 10.66),
            ("ENG074", "Chimti", "pcs", 5.77),
            ("ENG075", "Exam Board", "pcs", 845.76),
            ("ENG076", "Lint Free Cloth", "pcs", 4.00),
            ("ENG077", "Masks", "pcs", 2.00),
            ("ENG078", "Gloves", "pcs", 4.85),
            ("ENG079", "Woollen Gloves", "pair", 135.00),
            ("ENG080", "Bead Blasting Gloves", "pair", 135.93),
            ("ENG081", "Zip Lock Dispenser", "pcs", 0.85),
            ("ENG082", "Glass Bottal", "pcs", 791.86),
            ("ENG083", "Cap", "pcs", 1.25),
            ("ENG084", "Garbag Bag", "roll", 47.53),
            ("ENG085", "Birthday And Coffee Mug", "pcs", 130.00),
            ("ENG086", "Urinal Matt", "pcs", 33.47),
            ("ENG087", "Apron Small Size", "pcs", 188.57),
            ("ENG088", "Apron Full Size", "pcs", 188.57),
            ("ENG089", "Odonil", "pcs", 34.53),
            ("ENG090", "Baking Powder", "box", 313.56),
            ("ENG091", "Harpic", "ltr.", 173.30),
            ("ENG092", "Tea cups", "pcs", 55.93),
            ("ENG093", "Tissue Roll", "roll", 27.95),
            ("ENG094", "Colin", "ltr.", 157.62),
            ("ENG095", "Vim Gel", "ltr.", 296.00),
            ("ENG096", "Food Handling Tool", "pcs", 130.00),
            ("ENG097", "Tea Basket", "pcs", 1000.00), # typo in img 1,000.00
            ("ENG098", "Cleaning Cloth", "pcs", 5.00),
            ("ENG099", "Dettol Hand Wash", "ltr.", 121.96),
            ("ENG100", "Zip Lock", "pack", 0.83),
            ("ENG101", "Rubber Band", "pack", 14.19),
            ("ENG102", "Diamond Tool", "pcs", 589.83),
            ("ENG103", "Standard Lac", "pcs", 100.00),
            ("ENG104", "Plastic Gloves", "pack", 62.90),
            ("ENG105", "Silicon Glue", "pcs", 126.00),
            ("ENG106", "Weight Machine", "pcs", 595.76),
            ("ENG107", "Mouse Pad", "pcs", 200.00),
            ("ENG108", "Zip Tie", "pack", 0.83),
            ("ENG109", "Primer Filter", "pcs", 34.97),
            ("ENG110", "Hot Glue Stick", "pcs", 333.92),
            ("ENG111", "Sanding Paper 2000", "pcs", 19.91),
            ("ENG112", "Sanding Paper 600", "pcs", 18.59),
            ("ENG113", "Sanding Paper 320", "pcs", 17.27),
            ("ENG114", "Sanding Paper 100", "pcs", 19.00),
            ("ENG115", "Sanding Paper 220", "pcs", 17.27),
            ("ENG116", "Big Size Flag", "pcs", 649.00),
            ("ENG117", "Rubber Liquid Silicon", "kg", 941.64),
            ("ENG118", "Wall Paint Brush", "pcs", 100.00),
            ("ENG119", "Varnish", "bottle", 292.37),
            ("ENG120", "Room Freshner", "bottle", 114.41),
            ("ENG121", "Curtain Rod", "box", 758.00), # Note ID duplication handling
            ("ENG122", "Toth pic", "box", 62.56),
            ("ENG123", "Nc Thinner", "ltr.", 130.00),
        ]

        logger.info(f"Seeding {len(items_to_seed)} items...")
        
        count = 0
        for code, name, unit, cost in items_to_seed:
            # Check exist
            existing = db.query(InventoryItem).filter(InventoryItem.item_id == code).first()
            if not existing:
                item = InventoryItem(
                    item_id=code,
                    name=name,
                    material_type="OTHER", # Default category
                    quantity_on_hand=0,
                    unit_cost=cost,
                    unit=unit
                )
                db.add(item)
                count += 1
            else:
                # Update cost just in case
                existing.unit_cost = cost
                existing.unit = unit
        
        db.commit()
        logger.info(f"Seeding complete. Added {count} new items.")

    except Exception as e:
        logger.error(f"Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
