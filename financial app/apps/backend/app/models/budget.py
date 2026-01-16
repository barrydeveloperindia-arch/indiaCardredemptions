from sqlalchemy import Column, String, Float, DateTime, text, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from .base import Base
import uuid

class Budget(Base):
    __tablename__ = "budgets"
    
    budget_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String(100), nullable=False) # e.g. "Food & Dining"
    month = Column(String(7), nullable=False)      # YYYY-MM format
    limit_amount = Column(Float, nullable=False)
    is_rollover = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))
