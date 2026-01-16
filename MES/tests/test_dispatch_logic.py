import pytest
from unittest.mock import MagicMock
from src.dispatch.agent import DispatchAgent
from src.database.models import Machine, DispatchQueue

def test_dispatch_capability_filter():
    agent = DispatchAgent()
    db = MagicMock()
    
    # 1. Setup Machines
    # Machine A: Steel
    # Machine B: PLA
    m1 = Machine(machine_id="CNC-STEEL", name="Steel Mill", capabilities={"materials": ["Steel"]})
    m2 = Machine(machine_id="PRINTER-PLA", name="Plastic Printer", capabilities={"materials": ["PLA"]})
    
    db.query.return_value.all.return_value = [m1, m2]
    
    # 2. Test Dispatch for "PLA"
    order = {"technical_requirements": {"material": "PLA"}}
    job_id, assigned_mid = agent.dispatch_order(order, db)
    
    assert assigned_mid == "PRINTER-PLA"
    assert "FAILED" not in job_id

def test_dispatch_load_balancing():
    agent = DispatchAgent()
    db = MagicMock()
    
    # 1. Setup Two Identical Machines
    # M1 has 2 queued jobs
    m1 = Machine(machine_id="M1", name="M1", capabilities={"materials": ["Universal"]}, current_status="RUNNING")
    m1.jobs = [
        DispatchQueue(status="RUNNING"), 
        DispatchQueue(status="QUEUED")
    ]
    
    # M2 has 0 jobs
    m2 = Machine(machine_id="M2", name="M2", capabilities={"materials": ["Universal"]}, current_status="IDLE")
    m2.jobs = []
    
    db.query.return_value.all.return_value = [m1, m2]
    
    # 2. Test Dispatch should pick M2 (Score: 0 vs Score: 20)
    order = {"technical_requirements": {"material": "Universal"}}
    job_id, assigned_mid = agent.dispatch_order(order, db)
    
    assert assigned_mid == "M2"

def test_dispatch_fail_no_capability():
    agent = DispatchAgent()
    db = MagicMock()
    
    m1 = Machine(machine_id="M1", capabilities={"materials": ["Wood"]})
    db.query.return_value.all.return_value = [m1]
    
    order = {"technical_requirements": {"material": "Unobtanium"}}
    result, mid = agent.dispatch_order(order, db)
    
    assert result == "FAILED_NO_CAPABILITY"
    assert mid is None
