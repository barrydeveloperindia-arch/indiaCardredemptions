
import pytest
import requests

BASE_URL = "http://localhost:8008"

def test_health_check():
    response = requests.get(f"{BASE_URL}/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "MES System Online"

def test_plm_parts_list():
    response = requests.get(f"{BASE_URL}/api/analysis/parts")
    # Should be 200 with new fix
    assert response.status_code == 200

def test_inventory_list():
    response = requests.get(f"{BASE_URL}/api/inventory/items")
    assert response.status_code in [200, 403]

def test_shop_floor_summary():
    response = requests.get(f"{BASE_URL}/api/shop-floor-summary")
    assert response.status_code == 200

def test_dispatch_board():
    response = requests.get(f"{BASE_URL}/api/dispatch/board")
    assert response.status_code == 200
