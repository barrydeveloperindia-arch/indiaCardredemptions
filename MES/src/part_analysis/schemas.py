from pydantic import BaseModel
from typing import Optional

class PartUpdate(BaseModel):
    name: Optional[str] = None
    client_id: Optional[str] = None
    project_id: Optional[str] = None
    manufacturing_process: Optional[str] = None
    material: Optional[str] = None
