from typing import List, Optional

from sqlalchemy.orm import Session, joinedload

from ..models import AlarmParseRule, AlarmParseRulePattern
from ..schemas import AlarmParseRuleCreate as AlarmParseRuleCreateSchema, AlarmParseRuleUpdate as AlarmParseRuleUpdateSchema


def get_alarm_parse_rules(db: Session) -> List[AlarmParseRule]:
    return (
        db.query(AlarmParseRule)
        .options(joinedload(AlarmParseRule.patterns))
        .order_by(AlarmParseRule.name.asc())
        .all()
    )


def get_alarm_parse_rule(db: Session, rule_id: int) -> Optional[AlarmParseRule]:
    return (
        db.query(AlarmParseRule)
        .options(joinedload(AlarmParseRule.patterns))
        .filter(AlarmParseRule.id == rule_id)
        .first()
    )


def create_alarm_parse_rule(db: Session, rule: AlarmParseRuleCreateSchema) -> AlarmParseRule:
    db_rule = AlarmParseRule(
        name=rule.name,
        description=rule.description,
        is_active=rule.is_active,
        skip_header_rows=rule.skip_header_rows,
        offset_mode=rule.offset_mode.value,
    )
    db.add(db_rule)
    db.flush()

    for pattern in rule.patterns:
        db.add(AlarmParseRulePattern(rule_id=db_rule.id, **pattern.model_dump()))

    db.commit()
    return get_alarm_parse_rule(db, db_rule.id)


def update_alarm_parse_rule(db: Session, rule_id: int, rule: AlarmParseRuleUpdateSchema) -> Optional[AlarmParseRule]:
    db_rule = db.query(AlarmParseRule).filter(AlarmParseRule.id == rule_id).first()
    if db_rule is None:
        return None

    update_data = rule.model_dump(exclude_unset=True, exclude={"patterns", "offset_mode"})
    for key, value in update_data.items():
        setattr(db_rule, key, value)

    if rule.offset_mode is not None:
        db_rule.offset_mode = rule.offset_mode.value

    if rule.patterns is not None:
        db.query(AlarmParseRulePattern).filter(AlarmParseRulePattern.rule_id == rule_id).delete()
        for pattern in rule.patterns:
            db.add(AlarmParseRulePattern(rule_id=rule_id, **pattern.model_dump()))

    db.commit()
    return get_alarm_parse_rule(db, rule_id)


def delete_alarm_parse_rule(db: Session, rule_id: int) -> bool:
    db_rule = db.query(AlarmParseRule).filter(AlarmParseRule.id == rule_id).first()
    if db_rule is None:
        return False

    db.delete(db_rule)
    db.commit()
    return True