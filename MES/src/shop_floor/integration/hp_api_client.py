import random
import requests
import asyncio
import logging
import hmac
import hashlib
import datetime
import os
from typing import Dict, Any

# Suppress InsecureRequestWarning
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

class HPAPIClient:
    """
    Client for HP 3D Core Capabilities API.
    Handles authentication and telemetry retrieval for HP MJF printers.
    """
    def __init__(self, base_url: str = "http://192.168.2.119:8080", client_id: str = None, client_secret: str = None, mock: bool = True):
        self.client_id = client_id or os.getenv("HP_CLIENT_ID")
        self.client_secret = client_secret or os.getenv("HP_CLIENT_SECRET")
        self.mock = mock
        # Remove trailing slash if present
        self.base_url = base_url.rstrip("/")
        logger.info(f"HP Client initialized. Mock={mock}, BaseURL={self.base_url}")

    async def get_printer_status(self, printer_id: str) -> Dict[str, Any]:
        """Fetches status from the HP API."""
        if self.mock:
            return self._get_mock_status(printer_id)
        
        # Real implementation
        try:
            # Note: We use asyncio.to_thread to avoid blocking the event loop with synchronous requests
            # Endpoints guessed based on typical HP local APIs: /api/v1/status or /hp/device/DeviceStatus
            # Based on 403 probe, /api/v1/status exists but requires auth.
            
            # Using a simplified endpoint for status, assuming standard /api/v1/status
            url = f"{self.base_url}/api/v1/status"
            
            # TODO: Add Authentication headers here once User provides Keys
            headers = {}
            if self.client_id and self.client_secret:
                timestamp = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
                # Path must be the exact path component of the URL for signature
                # Assuming base_url is something like http://192.168.2.108
                # url = http://192.168.2.108/api/v1/status -> path = /api/v1/status
                path = "/api/v1/status" 
                
                string_to_sign = f"GET {path}{timestamp}"
                signature = hmac.new(
                    self.client_secret.encode('utf-8'),
                    string_to_sign.encode('utf-8'),
                    hashlib.sha256
                ).hexdigest()

                headers = {
                    "x-hp-hmac-authentication": f"{self.client_id}:{signature}",
                    "x-hp-hmac-date": timestamp,
                    "x-hp-hmac-algorithm": "SHA256"
                }
            
            # Disable SSL verification for local self-signed certs
            resp = await asyncio.to_thread(requests.get, url, headers=headers, timeout=5.0, verify=False)
            
            if resp.status_code == 200:
                data = resp.json()
                # Normalize data to our schema
                return {
                    "printerId": printer_id,
                    "status": data.get("status", "ONLINE"),
                    "telemetry": data.get("telemetry", {})
                }
            elif resp.status_code == 403:
                logger.warning(f"HP API 403 Forbidden. Auth required for {url}")
                return {
                    "printerId": printer_id,
                    "status": "AUTH_REQUIRED",
                    "error": "403 Forbidden - Check Credentials"
                }
            else:
                logger.error(f"HP API Error {resp.status_code}: {resp.text}")
                return {
                    "printerId": printer_id,
                    "status": "ERROR",
                    "error": f"HTTP {resp.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Failed to connect to HP Printer: {e}")
            return {
                "printerId": printer_id,
                "status": "CONNECTION_FAILED",
                "error": str(e)
            }

    def _get_mock_status(self, printer_id: str):
        return {
            "printerId": printer_id,
            "status": random.choice(["PRINTING", "IDLE", "COOLING", "MAINTENANCE"]),
            "subsystems": {
                "printhead": "HEALTHY",
                "fusingLamp": "OK",
                "ventilation": "OK"
            },
            "materials": [
                {"type": "PA12", "level": random.randint(20, 95)},
                {"type": "Agent", "level": random.randint(10, 80)}
            ],
            "telemetry": {
                "chamber_temp": 160 + random.random() * 10,
                "ambient_temp": 24 + random.random() * 2
            }
        }

    async def submit_build_job(self, printer_id: str, job_data: Dict[str, Any]) -> str:
        """Submits a build job to the printer."""
        if self.mock:
            return f"HP-JOB-{random.randint(1000, 9999)}"
        return "ERROR_NOT_IMPLEMENTED_REAL"
