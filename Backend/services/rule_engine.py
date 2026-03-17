from sqlalchemy.orm import Session
from models.rule import Rule
from utils.condition_parser import evaluate_condition
from typing import Any, Dict, List, Optional, Tuple

def evaluate_rules(db: Session, step_id: str, data: Dict[str, Any]) -> Tuple[Optional[str], List[dict]]:
    rules = db.query(Rule).filter(Rule.step_id == step_id).order_by(Rule.priority.asc()).all()
    evaluated = []
    default_next = None

    for rule in rules:
        if rule.condition.strip().upper() == "DEFAULT":
            default_next = rule.next_step_id
            evaluated.append({"rule_id": rule.id, "condition": rule.condition, "result": "DEFAULT", "selected": False})
            continue
        result = evaluate_condition(rule.condition, data)
        evaluated.append({"rule_id": rule.id, "condition": rule.condition, "result": result, "selected": False})
        if result:
            evaluated[-1]["selected"] = True
            return rule.next_step_id, evaluated

    if default_next is not None:
        for e in evaluated:
            if e["condition"].strip().upper() == "DEFAULT":
                e["selected"] = True
        return default_next, evaluated

    return None, evaluated