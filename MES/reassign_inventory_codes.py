import psycopg2
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://mes_admin:secure_password@localhost:5432/mes_db")

def reassign_codes():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        # 1. Fetch all items sorted alphabetically
        cur.execute("SELECT item_id, name, material_type, quantity_on_hand, unit_cost, unit FROM inventory_items ORDER BY name ASC")
        items = cur.fetchall()
        
        print(f"Found {len(items)} items. Reassigning codes...")
        
        # 2. Process Sequence
        for index, item in enumerate(items):
            old_id = item[0]
            name = item[1]
            # Generate new likely ID
            new_id = f"ENG-{str(index+1).zfill(4)}"
            
            # Optimization: If mapped ID is same, skip (Unlikely given prefix change)
            if old_id == new_id:
                continue
                
            print(f"Migrating: {name} | {old_id} -> {new_id}")
            
            # A. Insert Copy with New ID
            # We explicitly list columns to match the fetch
            cur.execute("""
                INSERT INTO inventory_items (item_id, name, material_type, quantity_on_hand, unit_cost, unit)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (new_id, item[1], item[2], item[3], item[4], item[5]))
            
            # B. Move Transactions
            cur.execute("UPDATE material_transactions SET item_id = %s WHERE item_id = %s", (new_id, old_id))
            
            # C. Move Purchase Order Items / Other Relations?
            # Based on models.py, only MaterialTransaction seems to link to InventoryItem item_id explicitly.
            # However, check for other loose references if any.
            
            # D. Delete Old Item
            cur.execute("DELETE FROM inventory_items WHERE item_id = %s", (old_id,))
            
        conn.commit()
        print("Reassignment Complete.")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    reassign_codes()
