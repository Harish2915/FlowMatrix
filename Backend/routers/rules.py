from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.rule import Rule
from schemas.rule_schema import RuleCreate, RuleUpdate, RuleOut
from utils.auth_utils import get_current_user
from models.user import User
from typing import List
import uuid
from datetime import datetime

router = APIRouter(tags=["rules"])


@router.post("/steps/{step_id}/rules", response_model=RuleOut)
def create_rule(
    step_id: str,
    data: RuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rule = Rule(
        id=str(uuid.uuid4()),
        step_id=step_id,
        condition=data.condition,
        next_step_id=data.next_step_id,
        priority=data.priority
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.get("/steps/{step_id}/rules", response_model=List[RuleOut])
def list_rules(
    step_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rules = db.query(Rule).filter(
        Rule.step_id == step_id
    ).order_by(Rule.priority.asc()).all()
    return rules


@router.put("/rules/{rule_id}", response_model=RuleOut)
def update_rule(
    rule_id: str,
    data: RuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    if data.condition is not None:
        rule.condition = data.condition
    if data.next_step_id is not None:
        rule.next_step_id = data.next_step_id
    if data.priority is not None:
        rule.priority = data.priority
    rule.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/rules/{rule_id}")
def delete_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"message": "Rule deleted"}