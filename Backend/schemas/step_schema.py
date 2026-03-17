from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class StepCreate(BaseModel):
    name: str
    step_type: str = "task"
    step_order: int = 0
    metadata_: Optional[Dict[str, Any]] = None

class StepUpdate(BaseModel):
    name: Optional[str] = None
    step_type: Optional[str] = None
    step_order: Optional[int] = None
    metadata_: Optional[Dict[str, Any]] = None

class StepOut(BaseModel):
    id: str
    workflow_id: str
    name: str
    step_type: str
    step_order: int
    metadata_: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True