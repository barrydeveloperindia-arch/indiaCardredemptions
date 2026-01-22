from typing import Dict, List, Any
from datetime import datetime
import asyncio
from ..iot_gateway.opcua_manager import OpcUaManager
from ..integration.hp_api_client import HPAPIClient

class DigitalTwinService:
    """
    Aggregates live telemetry from all machines to provide a real-time 'Twin' state.
    Refactored to use OpcUaManager for optional Real Hardware support.
    """
    def __init__(self):
        self.iot_manager = OpcUaManager(use_real_hardware=False)
        # Using Real HP Client pointed to local printer IP
        self.hp_client = HPAPIClient(mock=False, base_url="http://192.168.2.108")
        self.latest_states: Dict[str, Dict] = {}
        self.machine_types: Dict[str, str] = {} # machine_id -> type (OPCUA, HP)

    def register_machine(self, machine_id: str, endpoint: str):
        """Initializes coverage for a new machine."""
        # Detect machine type from ID or endpoint
        m_type = "HP" if "HP-MJF" in machine_id.upper() or "api.hp.com" in endpoint.lower() else "OPCUA"
        self.machine_types[machine_id] = m_type

        self.latest_states[machine_id] = {
            "machine_id": machine_id, 
            "status": "CONNECTING...", 
            "temp": 0.0,
            "type": m_type
        }
        
    async def refresh_all_states(self):
        """
        Polls the appropriate protocols for updates.
        """
        for m_id, m_type in self.machine_types.items():
            if m_type == "HP":
                # Polling HP REST API
                hp_status = await self.hp_client.get_printer_status(m_id)
                self.latest_states[m_id] = {
                    "machine_id": m_id,
                    "status": hp_status.get("status"),
                    "temp": hp_status.get("telemetry", {}).get("chamber_temp", 0.0),
                    "subsystems": hp_status.get("subsystems"),
                    "materials": hp_status.get("materials"),
                    "last_updated": datetime.now().isoformat(),
                    "type": "HP"
                }
            else:
                # Polling OPC-UA (MOCK or REAL)
                status = await self.iot_manager.read_node(m_id, "ns=2;s=Status")
                temp = await self.iot_manager.read_node(m_id, "ns=2;s=Temperature")
                
                self.latest_states[m_id] = {
                    "machine_id": m_id,
                    "status": status,
                    "temp": temp,
                    "last_updated": datetime.now().isoformat(),
                    "type": "OPCUA"
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

