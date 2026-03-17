from sqlalchemy import Column, String, Integer, DateTime, JSON, Enum
from sqlalchemy.dialects.mysql import CHAR
from database import Base
from datetime import datetime
import uuid

class Step(Base):
    __tablename__ = "steps"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(CHAR(36), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    step_type = Column(Enum('task', 'approval', 'notification'), default='task')
    step_order = Column(Integer, default=0)
    metadata_ = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)