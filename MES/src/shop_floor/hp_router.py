from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from src.shop_floor.service_instance import twin_service

router = APIRouter(prefix="/hp", tags=["HP MJF Integration"])

@router.get("/status/{machine_id}")
async def get_hp_printer_details(machine_id: str):
    """
    Returns extended telemetry for HP MJF printers, 
    including material levels and subsystem health.
    """
    status = twin_service.get_machine_status(machine_id)
    if status.get("status") == "UNKNOWN":
        raise HTTPException(status_code=404, detail="Machine not found in Digital Twin")
    
    if status.get("type") != "HP":
        raise HTTPException(status_code=400, detail="Requested machine is not an HP printer")
        
    return status

@router.get("/inventory")
async def get_hp_materials():
    """Aggregated material levels across all HP printers."""
    all_machines = twin_service.get_shop_floor_status()
    hp_printers = [m for m in all_machines if m.get("type") == "HP"]
    
    inventory = {}
    for p in hp_printers:
        for mat in p.get("materials", []):
            m_type = mat["type"]
            inventory[m_type] = inventory.get(m_type, 0) + mat["level"]
            
    return inventory
