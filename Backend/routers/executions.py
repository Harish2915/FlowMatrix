from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.execution import Execution
from models.execution_log import ExecutionLog
from schemas.execution_schema import ExecutionCreate, ExecutionOut, ExecutionLogOut
from services.execution_engine import start_execution, cancel_execution, retry_execution
from utils.auth_utils import get_current_user
from models.user import User
from typing import List

router = APIRouter(tags=["executions"])

@router.post("/workflows/{workflow_id}/execute", response_model=ExecutionOut)
def execute(workflow_id: str, data: ExecutionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return start_execution(db, workflow_id, data.data or {}, current_user.email)

@router.get("/executions", response_model=List[ExecutionOut])
def list_executions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Execution).order_by(Execution.started_at.desc()).all()

@router.get("/executions/{execution_id}", response_model=ExecutionOut)
def get_execution(execution_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ex = db.query(Execution).filter(Execution.id == execution_id).first()
    if not ex:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Execution not found")
    return ex

@router.get("/executions/{execution_id}/logs", response_model=List[ExecutionLogOut])
def get_logs(execution_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ExecutionLog).filter(ExecutionLog.execution_id == execution_id).order_by(ExecutionLog.started_at).all()

@router.post("/executions/{execution_id}/cancel", response_model=ExecutionOut)
def cancel(execution_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return cancel_execution(db, execution_id)

@router.post("/executions/{execution_id}/retry", response_model=ExecutionOut)
def retry(execution_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return retry_execution(db, execution_id)