from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RuleCreate(BaseModel):
    condition: str
    next_step_id: Optional[str] = None
    priority: int = 0


class RuleUpdate(BaseModel):
    condition: Optional[str] = None
    next_step_id: Optional[str] = None
    priority: Optional[int] = None


class RuleOut(BaseModel):
    id: str
    step_id: str
    condition: str
    next_step_id: Optional[str]
    priority: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True