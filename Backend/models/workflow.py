from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON
from sqlalchemy.dialects.mysql import CHAR
from database import Base
from datetime import datetime
import uuid

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    input_schema = Column(JSON, nullable=True)
    start_step_id = Column(CHAR(36), nullable=True)
    created_by = Column(CHAR(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)