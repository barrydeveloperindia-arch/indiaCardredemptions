from sqlalchemy import Column, String, Float, DateTime, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base
import uuid

class Asset(Base):
    __tablename__ = "assets"
    
    asset_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=True) # Optional for single-user mvp
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False) # STOCK, MF, GOLD, REAL_ESTATE, CRYPTO, OTHER, CASH
    current_value = Column(Float, default=0.0)
    last_updated = Column(DateTime(timezone=True), server_default=text('now()'))
    
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))
