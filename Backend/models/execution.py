from sqlalchemy import Column, String, Integer, DateTime, JSON, Enum
from sqlalchemy.dialects.mysql import CHAR
from database import Base
from datetime import datetime
import uuid

class Execution(Base):
    __tablename__ = "executions"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(CHAR(36), nullable=False, index=True)
    workflow_version = Column(Integer, default=1)
    status = Column(Enum('pending', 'in_progress', 'completed', 'failed', 'canceled'), default='pending')
    data = Column(JSON, nullable=True)
    current_step_id = Column(CHAR(36), nullable=True)
    retries = Column(Integer, default=0)
    triggered_by = Column(String(255), nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)