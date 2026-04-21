from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...database import get_db
from ...schemas import AlarmParseRule, AlarmParseRuleCreate, AlarmParseRuleUpdate
from ...services import alarm_parse_rule_service


router = APIRouter(
    prefix="/alarm-parse-rules",
    tags=["alarm_parse_rules"],
)


@router.get("", response_model=List[AlarmParseRule])
def read_alarm_parse_rules(db: Session = Depends(get_db)):
    return alarm_parse_rule_service.get_alarm_parse_rules(db)


@router.post("", response_model=AlarmParseRule, status_code=201)
def create_alarm_parse_rule(rule: AlarmParseRuleCreate, db: Session = Depends(get_db)):
    return alarm_parse_rule_service.create_alarm_parse_rule(db, rule)


@router.get("/{rule_id}", response_model=AlarmParseRule)
def read_alarm_parse_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = alarm_parse_rule_service.get_alarm_parse_rule(db, rule_id)
    if rule is None:
        raise HTTPException(status_code=404, detail="Alarm parse rule not found")
    return rule


@router.put("/{rule_id}", response_model=AlarmParseRule)
def update_alarm_parse_rule(rule_id: int, rule: AlarmParseRuleUpdate, db: Session = Depends(get_db)):
    updated_rule = alarm_parse_rule_service.update_alarm_parse_rule(db, rule_id, rule)
    if updated_rule is None:
        raise HTTPException(status_code=404, detail="Alarm parse rule not found")
    return updated_rule


@router.delete("/{rule_id}", status_code=204)
def delete_alarm_parse_rule(rule_id: int, db: Session = Depends(get_db)):
    success = alarm_parse_rule_service.delete_alarm_parse_rule(db, rule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alarm parse rule not found")
    return None