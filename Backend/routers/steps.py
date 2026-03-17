from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.step import Step
from schemas.step_schema import StepCreate, StepUpdate, StepOut
from utils.auth_utils import get_current_user
from models.user import User
from typing import List
from fastapi import HTTPException
import uuid
from datetime import datetime

router = APIRouter(tags=["steps"])

@router.post("/workflows/{workflow_id}/steps", response_model=StepOut)
def create_step(workflow_id: str, data: StepCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    step = Step(
        id=str(uuid.uuid4()),
        workflow_id=workflow_id,
        name=data.name,
        step_type=data.step_type,
        step_order=data.step_order,
        metadata_=data.metadata_
    )
    db.add(step)
    db.commit()
    db.refresh(step)
    return step

@router.get("/workflows/{workflow_id}/steps", response_model=List[StepOut])
def list_steps(workflow_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Step).filter(Step.workflow_id == workflow_id).order_by(Step.step_order).all()

@router.put("/steps/{step_id}", response_model=StepOut)
def update_step(step_id: str, data: StepUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    step = db.query(Step).filter(Step.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    if data.name is not None:
        step.name = data.name
    if data.step_type is not None:
        step.step_type = data.step_type
    if data.step_order is not None:
        step.step_order = data.step_order
    if data.metadata_ is not None:
        step.metadata_ = data.metadata_
    step.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(step)
    return step

@router.delete("/steps/{step_id}")
def delete_step(step_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    step = db.query(Step).filter(Step.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    db.delete(step)
    db.commit()
    return {"message": "Step deleted"}