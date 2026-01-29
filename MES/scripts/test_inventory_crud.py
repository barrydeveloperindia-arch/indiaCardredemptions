
import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8008/api"
AUTH_URL = f"{BASE_URL}/auth/token"
INVENTORY_URL = f"{BASE_URL}/inventory"

USER_NAME = "admin"
PASSWORD = "admin123"

def login():
    try:
        data = {
            "username": USER_NAME,
            "password": PASSWORD
        }
        res = requests.post(AUTH_URL, data=data)
        if res.status_code == 200:
            return res.json()["access_token"]
        else:
            print(f"❌ Login Failed: {res.text}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Login Error: {e}")
        sys.exit(1)

def test_create(token):
    headers = {"Authorization": f"Bearer {token}"}
    item_data = {
        "item_id": "TEST-MAT-999",
        "name": "Test Material Unit",
        "material_type": "PLA",
        "quantity_on_hand": 100,
        "unit_cost": 50.0,
        "unit": "kg"
    }
    
    # Check if exists first (clean up from previous failed runs not possible via API, but we can ignore error)
    print("Testing CREATE...")
    res = requests.post(f"{INVENTORY_URL}/", json=item_data, headers=headers)
    if res.status_code == 201:
        print("[OK] Create Successful")
        return True
    elif res.status_code == 400 and "already exists" in res.text:
         print("[INFO] Item already exists, skipping create.")
         return True
    else:
        print(f"[FAIL] Create Failed: {res.status_code} - {res.text}")
        return False

def test_read(token):
    print("Testing READ...")
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{INVENTORY_URL}/", headers=headers)
    if res.status_code == 200:
        items = res.json()
        print(f"[OK] Read Successful (Found {len(items)} items)")
        
        # Verify our item is there
        found = False
        for item in items:
            if item["item_id"] == "TEST-MAT-999":
                found = True
                print(f"   Found Created Item: {item}")
                break
        if not found:
             print("[FAIL] Created item NOT found in list")
             return False
        return True
    else:
        print(f"[FAIL] Read Failed: {res.status_code}")
        return False

def test_update_stock(token):
    print("Testing UPDATE STOCK (Restock)...")
    headers = {"Authorization": f"Bearer {token}"}
    data = {"quantity_change": 50.0} # Add 50
    
    res = requests.post(f"{INVENTORY_URL}/TEST-MAT-999/transaction", json=data, headers=headers)
    if res.status_code == 200:
        item = res.json()
        if item["quantity_on_hand"] >= 150: # 100 init + 50
             print(f"[OK] Restock Successful (New Qty: {item['quantity_on_hand']})")
             return True
        else:
             print(f"[FAIL] Restock Logic Error (Qty: {item['quantity_on_hand']})")
             return False
    else:
        print(f"[FAIL] Restock Failed: {res.status_code} - {res.text}")
        return False
        
def test_usage_stock(token):
    print("Testing UPDATE STOCK (Usage)...")
    headers = {"Authorization": f"Bearer {token}"}
    data = {"quantity_change": -10.0} # Use 10
    
    res = requests.post(f"{INVENTORY_URL}/TEST-MAT-999/transaction", json=data, headers=headers)
    if res.status_code == 200:
        item = res.json()
        print(f"[OK] Usage Successful (New Qty: {item['quantity_on_hand']})")
        return True
    else:
        print(f"[FAIL] Usage Failed: {res.text}")
        return False

if __name__ == "__main__":
    print("=== STARTING INVENTORY API TEST ===")
    token = login()
    
    if test_create(token):
        if test_read(token):
            test_update_stock(token)
            test_usage_stock(token)
            
    print("=== TEST COMPLETE ===")
