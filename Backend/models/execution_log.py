from sqlalchemy import Column, String, DateTime, JSON, Text
from sqlalchemy.dialects.mysql import CHAR
from database import Base
from datetime import datetime
import uuid

class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    execution_id = Column(CHAR(36), nullable=False, index=True)
    step_name = Column(String(255), nullable=True)
    step_type = Column(String(50), nullable=True)
    evaluated_rules = Column(JSON, nullable=True)
    selected_next_step = Column(CHAR(36), nullable=True)
    status = Column(String(50), nullable=True)
    approver_id = Column(String(255), nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)