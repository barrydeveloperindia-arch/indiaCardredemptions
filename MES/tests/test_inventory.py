import pytest
from unittest.mock import MagicMock
from src.inventory.service import InventoryService
from src.inventory.router import InventoryItemCreate, StockUpdate

def test_create_item_success():
    # Setup Mock DB
    mock_db = MagicMock()
    service = InventoryService()
    
    # Input
    item_in = {"item_id": "TEST-01", "name": "Test Item", "material_type": "PLA", "quantity_on_hand": 10.0, "unit_cost": 5.0, "unit": "kg"}
    
    # Mock behavior
    mock_db.add.return_value = None
    mock_db.commit.return_value = None
    mock_db.refresh.return_value = None
    
    # Execute
    result = service.create_item(mock_db, item_in)
    
    # Verify
    assert result.item_id == "TEST-01"
    assert result.quantity_on_hand == 10.0
    mock_db.add.assert_called_once()

def test_update_stock_success():
    # Setup Mock DB
    mock_db = MagicMock()
    service = InventoryService()
    
    # Input
    item_id = "TEST-01"
    
    # Mock Item in DB
    mock_item = MagicMock()
    mock_item.item_id = item_id
    mock_item.quantity_on_hand = 10.0
    
    mock_db.query.return_value.filter.return_value.first.return_value = mock_item
    
    # Execute (Usage: -5.0)
    service.update_stock(mock_db, item_id, quantity_change=-5.0, job_id="JOB-123")
    
    # Verify
    assert mock_item.quantity_on_hand == 5.0 # 10 - 5
    mock_db.add.assert_called() # Should add transaction
    mock_db.commit.assert_called()

def test_update_stock_insufficient():
    # Setup Mock DB
    mock_db = MagicMock()
    service = InventoryService()
    
    # Mock Item in DB
    mock_item = MagicMock()
    mock_item.item_id = "TEST-01"
    mock_item.quantity_on_hand = 2.0
    
    mock_db.query.return_value.filter.return_value.first.return_value = mock_item
    
    # Execute & Verify Exception
    with pytest.raises(ValueError, match="Insufficient stock"):
        service.update_stock(mock_db, "TEST-01", quantity_change=-5.0)
