from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
from .connection import Base
from .models import generate_uuid

class SystemMetadata(Base):
    __tablename__ = "system_metadata"
    
    metadata_id = Column(String, primary_key=True, default=generate_uuid)
    category = Column(String, nullable=False, index=True) # CLIENT, PROCESS, MATERIAL
    value = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
