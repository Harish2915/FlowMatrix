from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class WorkflowCreate(BaseModel):
    name: str
    input_schema: Optional[Dict[str, Any]] = None
    start_step_id: Optional[str] = None

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    input_schema: Optional[Dict[str, Any]] = None
    start_step_id: Optional[str] = None
    is_active: Optional[bool] = None

class WorkflowOut(BaseModel):
    id: str
    name: str
    version: int
    is_active: bool
    input_schema: Optional[Dict[str, Any]]
    start_step_id: Optional[str]
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True