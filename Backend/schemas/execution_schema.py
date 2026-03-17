from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from datetime import datetime

class ExecutionCreate(BaseModel):
    data: Optional[Dict[str, Any]] = None

class ExecutionOut(BaseModel):
    id: str
    workflow_id: str
    workflow_version: int
    status: str
    data: Optional[Dict[str, Any]]
    current_step_id: Optional[str]
    retries: int
    triggered_by: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]

    class Config:
        from_attributes = True

class ExecutionLogOut(BaseModel):
    id: str
    execution_id: str
    step_name: Optional[str]
    step_type: Optional[str]
    evaluated_rules: Optional[Any]
    selected_next_step: Optional[str]
    status: Optional[str]
    approver_id: Optional[str]
    error_message: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]

    class Config:
        from_attributes = True