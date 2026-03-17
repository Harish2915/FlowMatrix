from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.workflow_schema import WorkflowCreate, WorkflowUpdate, WorkflowOut
from services.workflow_service import (
    create_workflow, get_workflows,
    get_workflow, update_workflow, delete_workflow
)
from utils.auth_utils import get_current_user
from models.user import User
from models.workflow import Workflow
from typing import List

router = APIRouter(prefix="/workflows", tags=["workflows"])


@router.post("", response_model=WorkflowOut)
def create(
    data: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_workflow(db, data, current_user.id)


@router.get("", response_model=List[WorkflowOut])
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_workflows(db)


@router.get("/{workflow_id}", response_model=WorkflowOut)
def get_one(
    workflow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_workflow(db, workflow_id)


@router.put("/{workflow_id}", response_model=WorkflowOut)
def update(
    workflow_id: str,
    data: WorkflowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # If only start_step_id is being updated, do it directly
    # without creating a new version
    wf = get_workflow(db, workflow_id)
    if (
        data.start_step_id is not None and
        data.name is None and
        data.input_schema is None
    ):
        wf.start_step_id = data.start_step_id
        db.commit()
        db.refresh(wf)
        return wf

    return update_workflow(db, workflow_id, data)


@router.delete("/{workflow_id}")
def delete(
    workflow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delete_workflow(db, workflow_id)
    return {"message": "Workflow deleted"}