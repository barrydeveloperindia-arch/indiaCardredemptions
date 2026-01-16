from sqlalchemy import Column, String, DateTime, text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base
import uuid

class AAConsent(Base):
    __tablename__ = "aa_consents"
    
    consent_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"))
    
    # Setu / AA specific fields
    consent_handle = Column(String(255), unique=True, nullable=True)
    status = Column(String(50), default='PENDING') # PENDING, ACTIVE, REJECTED, EXPIRED
    
    valid_from = Column(DateTime(timezone=True))
    valid_to = Column(DateTime(timezone=True))
    
    # Store raw response for debugging/audit
    raw_response = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))
    updated_at = Column(DateTime(timezone=True), server_default=text('now()'))

    # Relations
    user = relationship("User")
