from sqlalchemy.orm import Session
from models.execution import Execution
from models.execution_log import ExecutionLog
from models.step import Step
from models.workflow import Workflow
from services.rule_engine import evaluate_rules
from fastapi import HTTPException
from datetime import datetime
import uuid


def start_execution(db: Session, workflow_id: str, data: dict, triggered_by: str) -> Execution:
    # Get active workflow
    wf = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.is_active == True
    ).first()

    if not wf:
        raise HTTPException(status_code=404, detail="Active workflow not found")

    if not wf.start_step_id:
        raise HTTPException(status_code=400, detail="Workflow has no start step defined")

    # Create execution record
    execution = Execution(
        id=str(uuid.uuid4()),
        workflow_id=wf.id,
        workflow_version=wf.version,
        status="in_progress",
        data=data,
        current_step_id=wf.start_step_id,
        retries=0,
        triggered_by=triggered_by,
        started_at=datetime.utcnow()
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    # Run the execution engine
    _run_execution(db, execution)
    db.refresh(execution)
    return execution


def _run_execution(db: Session, execution: Execution):
    max_steps = 50
    steps_executed = 0

    while execution.current_step_id and steps_executed < max_steps:
        steps_executed += 1

        # Fetch current step
        step = db.query(Step).filter(Step.id == execution.current_step_id).first()
        if not step:
            execution.status = "failed"
            execution.ended_at = datetime.utcnow()
            db.commit()
            break

        # Create log entry
        log = ExecutionLog(
            id=str(uuid.uuid4()),
            execution_id=execution.id,
            step_name=step.name,
            step_type=step.step_type,
            started_at=datetime.utcnow()
        )

        try:
            # Evaluate rules to get next step
            next_step_id, evaluated_rules = evaluate_rules(
                db, step.id, execution.data or {}
            )

            log.evaluated_rules = evaluated_rules
            log.selected_next_step = next_step_id
            log.status = "completed"
            log.ended_at = datetime.utcnow()

            db.add(log)
            db.commit()

            # Move to next step
            execution.current_step_id = next_step_id
            db.commit()

        except Exception as e:
            log.status = "failed"
            log.error_message = str(e)
            log.ended_at = datetime.utcnow()
            db.add(log)

            execution.status = "failed"
            execution.ended_at = datetime.utcnow()
            db.commit()
            return

    # Mark execution as completed
    if execution.status not in ("failed", "canceled"):
        execution.status = "completed"
        execution.current_step_id = None
        execution.ended_at = datetime.utcnow()
        db.commit()


def cancel_execution(db: Session, execution_id: str) -> Execution:
    execution = db.query(Execution).filter(Execution.id == execution_id).first()

    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    if execution.status not in ("pending", "in_progress"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel execution with status '{execution.status}'"
        )

    execution.status = "canceled"
    execution.ended_at = datetime.utcnow()
    db.commit()
    db.refresh(execution)
    return execution


def retry_execution(db: Session, execution_id: str) -> Execution:
    execution = db.query(Execution).filter(Execution.id == execution_id).first()

    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    if execution.status != "failed":
        raise HTTPException(
            status_code=400,
            detail="Only failed executions can be retried"
        )

    # Get the workflow to reset start step
    wf = db.query(Workflow).filter(
        Workflow.id == execution.workflow_id,
        Workflow.is_active == True
    ).first()

    if not wf:
        raise HTTPException(status_code=404, detail="Active workflow not found for retry")

    # Reset execution state
    execution.status = "in_progress"
    execution.retries += 1
    execution.ended_at = None
    execution.current_step_id = wf.start_step_id
    db.commit()

    # Re-run
    _run_execution(db, execution)
    db.refresh(execution)
    return execution