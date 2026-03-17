from sqlalchemy.orm import Session
from models.workflow import Workflow
from models.step import Step
from models.rule import Rule
from schemas.workflow_schema import WorkflowCreate, WorkflowUpdate
from fastapi import HTTPException
import uuid
from datetime import datetime


def create_workflow(db: Session, data: WorkflowCreate, user_id: str) -> Workflow:
    wf = Workflow(
        id=str(uuid.uuid4()),
        name=data.name,
        version=1,
        is_active=True,
        input_schema=data.input_schema,
        start_step_id=data.start_step_id,
        created_by=user_id
    )
    db.add(wf)
    db.commit()
    db.refresh(wf)
    return wf


def get_workflows(db: Session):
    return db.query(Workflow).order_by(Workflow.created_at.desc()).all()


def get_workflow(db: Session, workflow_id: str) -> Workflow:
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf


def update_workflow(db: Session, workflow_id: str, data: WorkflowUpdate) -> Workflow:
    old_wf = get_workflow(db, workflow_id)

    # Get all steps from old workflow
    old_steps = db.query(Step).filter(
        Step.workflow_id == old_wf.id
    ).order_by(Step.step_order).all()

    # Deactivate old version
    old_wf.is_active = False
    db.commit()

    # Create new version
    new_wf = Workflow(
        id=str(uuid.uuid4()),
        name=data.name if data.name is not None else old_wf.name,
        version=old_wf.version + 1,
        is_active=True,
        input_schema=data.input_schema if data.input_schema is not None else old_wf.input_schema,
        start_step_id=None,
        created_by=old_wf.created_by,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_wf)
    db.commit()
    db.refresh(new_wf)

    # Copy all steps to new workflow
    # Keep a map of old_step_id → new_step_id
    step_id_map = {}

    for old_step in old_steps:
        new_step_id = str(uuid.uuid4())
        step_id_map[old_step.id] = new_step_id

        new_step = Step(
            id=new_step_id,
            workflow_id=new_wf.id,
            name=old_step.name,
            step_type=old_step.step_type,
            step_order=old_step.step_order,
            metadata_=old_step.metadata_,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_step)

    db.commit()

    # Copy all rules to new steps
    for old_step in old_steps:
        old_rules = db.query(Rule).filter(
            Rule.step_id == old_step.id
        ).all()

        for old_rule in old_rules:
            # Map next_step_id to new step id
            new_next_step_id = step_id_map.get(old_rule.next_step_id)

            new_rule = Rule(
                id=str(uuid.uuid4()),
                step_id=step_id_map[old_step.id],
                condition=old_rule.condition,
                next_step_id=new_next_step_id,
                priority=old_rule.priority,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(new_rule)

    db.commit()

    # Set start_step_id using the mapped new step id
    if data.start_step_id:
        # Use provided start step mapped to new id
        new_wf.start_step_id = step_id_map.get(data.start_step_id, data.start_step_id)
    elif old_wf.start_step_id:
        # Copy old start step mapped to new id
        new_wf.start_step_id = step_id_map.get(old_wf.start_step_id)

    db.commit()
    db.refresh(new_wf)
    return new_wf


def delete_workflow(db: Session, workflow_id: str):
    wf = get_workflow(db, workflow_id)
    db.delete(wf)
    db.commit()