import psycopg2
import os

# Database Connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://mes_admin:secure_password@localhost:5432/mes_db")

def fix_typos():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    corrections = {
        "(D) Size Big Battrey": "(D) Size Big Battery",
        "Baking Pawder": "Baking Powder",
        "Bead  Blastng Gloves": "Bead Blasting Gloves",
        "Bussiness Card Holder": "Business Card Holder",
        "Chimtti": "Chimti",
        "Diamand Tool": "Diamond Tool",
        "Garbag Bag": "Garbage Bag",
        "Garbeg Bag": "Garbage Bag",
        "Glass Bottal": "Glass Bottle",
        "NOTES PADS": "Note Pads",
        "Prmanent Marker": "Permanent Marker",
        "Rabber Band": "Rubber Band",
        "Slicon Glue": "Silicon Glue",
        "Toth pic": "Toothpick",
        "White labal Sticker": "White Label Sticker",
        "White label Sticker": "White Label Sticker",
        "Apran Full Size": "Apron Full Size",
        "Apran Small Size": "Apron Small Size",
    }
    
    print("Applying Spelling Corrections...")
    count = 0
    for bad, good in corrections.items():
        # Check if exists
        cur.execute("SELECT count(*) FROM inventory_items WHERE name = %s", (bad,))
        if cur.fetchone()[0] > 0:
            # Check if target already exists (merge case)
            cur.execute("SELECT item_id, quantity_on_hand FROM inventory_items WHERE name = %s", (good,))
            target = cur.fetchone()
            
            if target:
                # Merge logic: Add bad quantity to good, delete bad
                print(f"MERGING: {bad} -> {good}")
                cur.execute("SELECT quantity_on_hand FROM inventory_items WHERE name = %s", (bad,))
                bad_qty = cur.fetchone()[0]
                
                # Update Good
                new_qty = float(target[1]) + float(bad_qty)
                cur.execute("UPDATE inventory_items SET quantity_on_hand = %s WHERE item_id = %s", (new_qty, target[0]))
                
                # Delete Bad
                cur.execute("DELETE FROM inventory_items WHERE name = %s", (bad,))
            else:
                # Rename logic
                print(f"RENAMING: {bad} -> {good}")
                cur.execute("UPDATE inventory_items SET name = %s WHERE name = %s", (good, bad))
            
            count += 1
            
    conn.commit()
    print(f"Corrected {count} items.")
    conn.close()

if __name__ == "__main__":
    fix_typos()
