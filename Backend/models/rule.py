from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.mysql import CHAR
from database import Base
from datetime import datetime
import uuid


class Rule(Base):
    __tablename__ = "rules"

    id          = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    step_id     = Column(CHAR(36), nullable=False, index=True)
    condition   = Column("condition", Text, nullable=False, quote=True)
    next_step_id = Column(CHAR(36), nullable=True)
    priority    = Column(Integer, default=0)
    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)