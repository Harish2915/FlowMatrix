import re
from typing import Any, Dict

def evaluate_condition(condition: str, data: Dict[str, Any]) -> bool:
    if condition.strip().upper() == "DEFAULT":
        return True

    try:
        expr = condition.strip()

        # contains(field, "value")
        contains_pattern = r'contains\((\w+),\s*["\']([^"\']+)["\']\)'
        expr = re.sub(
            contains_pattern,
            lambda m: f'(str({m.group(1)}).lower().find("{m.group(2).lower()}") != -1)',
            expr
        )

        # startsWith(field, "prefix")
        starts_pattern = r'startsWith\((\w+),\s*["\']([^"\']+)["\']\)'
        expr = re.sub(
            starts_pattern,
            lambda m: f'str({m.group(1)}).startswith("{m.group(2)}")',
            expr
        )

        # endsWith(field, "suffix")
        ends_pattern = r'endsWith\((\w+),\s*["\']([^"\']+)["\']\)'
        expr = re.sub(
            ends_pattern,
            lambda m: f'str({m.group(1)}).endswith("{m.group(2)}")',
            expr
        )

        # Replace && and ||
        expr = expr.replace("&&", " and ").replace("||", " or ")

        local_vars = {k: v for k, v in data.items()}
        result = eval(expr, {"__builtins__": {}}, local_vars)
        return bool(result)
    except Exception as e:
        return False