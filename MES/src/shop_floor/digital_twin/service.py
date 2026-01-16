from typing import Dict, List, Any
from datetime import datetime
import asyncio
from ..iot_gateway.opcua_manager import OpcUaManager

class DigitalTwinService:
    """
    Aggregates live telemetry from all machines to provide a real-time 'Twin' state.
    Refactored to use OpcUaManager for optional Real Hardware support.
    """
    def __init__(self):
        self.iot_manager = OpcUaManager(use_real_hardware=False)
        self.latest_states: Dict[str, Dict] = {}

    def register_machine(self, machine_id: str, endpoint: str):
        """Initializes coverage for a new machine."""
        # Async connect would ideally happen in an async init or background task
        # For this sync/async bridge demo, we just prepare the mapping
        self.latest_states[machine_id] = {
            "machine_id": machine_id, 
            "status": "CONNECTING...", 
            "temp": 0.0
        }
        
    async def refresh_all_states(self):
        """
        Polls the OPC-UA Manager for updates (Simulation/Real).
        Called periodically by a background task.
        """
        for m_id in self.latest_states.keys():
            # In a real app, node IDs would be config-driven
            status = await self.iot_manager.read_node(m_id, "ns=2;s=Status")
            temp = await self.iot_manager.read_node(m_id, "ns=2;s=Temperature")
            
            self.latest_states[m_id] = {
                "machine_id": m_id,
                "status": status,
                "temp": temp,
                "last_updated": datetime.now().isoformat()
            }

    def get_shop_floor_status(self) -> List[Dict]:
        """Returns the current snapshot of the entire floor."""
        return list(self.latest_states.values())

    def get_machine_status(self, machine_id: str) -> Dict:
        return self.latest_states.get(machine_id, {"status": "UNKNOWN"})

    async def execute_command(self, machine_id: str, command: str) -> bool:
        """Relays a control command to the IoT Gateway."""
        # 1. Update Twin State immediately (Optimistic UI)
        if machine_id in self.latest_states:
             # If STARTing, set status to BOOTING until next telemetry confirms RUNNING
            self.latest_states[machine_id]["status"] = "COMMAND_SENT"
            
        # 2. Send to Hardware
        return await self.iot_manager.send_control_command(machine_id, command)

