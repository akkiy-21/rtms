import csv
import io
import re
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..crud import alarm_parse_rule_crud, device_crud
from ..schemas import (
    AlarmAddressParsePreview,
    AlarmAddressParsePreviewRequest,
    AlarmAddressPreview,
    AlarmCommentCreate,
    AlarmGroupParseRuleSelectionUpdate,
    AlarmParseRule,
    AlarmParseRuleCreate,
    AlarmParseRuleOffsetMode,
    AlarmParseRulePatternCreate,
    AlarmParseRuleUpdate,
)


def get_alarm_parse_rules(db: Session) -> List[AlarmParseRule]:
    rules = alarm_parse_rule_crud.get_alarm_parse_rules(db)
    return [AlarmParseRule.model_validate(rule) for rule in rules]


def get_alarm_parse_rule(db: Session, rule_id: int) -> Optional[AlarmParseRule]:
    rule = alarm_parse_rule_crud.get_alarm_parse_rule(db, rule_id)
    return AlarmParseRule.model_validate(rule) if rule else None


def create_alarm_parse_rule(db: Session, rule: AlarmParseRuleCreate) -> AlarmParseRule:
    try:
        created_rule = alarm_parse_rule_crud.create_alarm_parse_rule(db, rule)
        return AlarmParseRule.model_validate(created_rule)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create alarm parse rule") from exc


def update_alarm_parse_rule(db: Session, rule_id: int, rule: AlarmParseRuleUpdate) -> Optional[AlarmParseRule]:
    try:
        updated_rule = alarm_parse_rule_crud.update_alarm_parse_rule(db, rule_id, rule)
        return AlarmParseRule.model_validate(updated_rule) if updated_rule else None
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update alarm parse rule") from exc


def delete_alarm_parse_rule(db: Session, rule_id: int) -> bool:
    try:
        return alarm_parse_rule_crud.delete_alarm_parse_rule(db, rule_id)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete alarm parse rule") from exc


def update_alarm_group_parse_rule_selection(
    db: Session,
    device_id: int,
    alarm_group_id: int,
    payload: AlarmGroupParseRuleSelectionUpdate,
):
    alarm_group = device_crud.get_alarm_group(db, device_id, alarm_group_id)
    if alarm_group is None:
        raise HTTPException(status_code=404, detail="Alarm group not found for this device")

    if payload.selected_parse_rule_id is not None:
        rule = alarm_parse_rule_crud.get_alarm_parse_rule(db, payload.selected_parse_rule_id)
        if rule is None:
            raise HTTPException(status_code=404, detail="Alarm parse rule not found")
        if not rule.is_active:
            raise HTTPException(status_code=400, detail="Inactive alarm parse rule cannot be selected")

    updated_group = device_crud.update_alarm_group_parse_rule_selection(
        db,
        device_id,
        alarm_group_id,
        payload.selected_parse_rule_id,
    )
    return updated_group


def preview_alarm_addresses(
    db: Session,
    device_id: int,
    alarm_group_id: int,
    payload: AlarmAddressParsePreviewRequest,
) -> AlarmAddressParsePreview:
    alarm_group = device_crud.get_alarm_group(db, device_id, alarm_group_id)
    if alarm_group is None:
        raise HTTPException(status_code=404, detail="Alarm group not found for this device")

    selected_rule_id = payload.parse_rule_id or alarm_group.selected_parse_rule_id
    if selected_rule_id is None:
        raise HTTPException(status_code=400, detail="No alarm parse rule selected")

    rule = alarm_parse_rule_crud.get_alarm_parse_rule(db, selected_rule_id)
    if rule is None:
        raise HTTPException(status_code=404, detail="Alarm parse rule not found")
    if not rule.is_active:
        raise HTTPException(status_code=400, detail="Selected alarm parse rule is inactive")

    return _parse_csv_preview(payload.csv_content, AlarmParseRule.model_validate(rule))


def seed_default_alarm_parse_rules(db: Session) -> None:
    if alarm_parse_rule_crud.get_alarm_parse_rules(db):
        return

    for rule in _build_default_rules():
        alarm_parse_rule_crud.create_alarm_parse_rule(db, rule)


def _build_default_rules() -> List[AlarmParseRuleCreate]:
    return [
        AlarmParseRuleCreate(
            name="Keyence VTシリーズ",
            description="Keyence VTシリーズの [n]Dxxxx:bit 形式を行番号ベースで解釈します。",
            is_active=True,
            skip_header_rows=1,
            offset_mode=AlarmParseRuleOffsetMode.ROW_INDEX_WORD,
            patterns=[
                AlarmParseRulePatternCreate(
                    pattern_name="legacy_d_format",
                    sort_order=1,
                    regex_pattern=r"\[(\d+)\]D(\d+)\s*:(\d+)",
                    address_type_value="D",
                    alarm_no_mode="line_index",
                    address_group=2,
                    bit_group=3,
                    comment_mode="csv_columns",
                    comment_columns_start=1,
                    address_pad_length=4,
                )
            ],
        ),
        AlarmParseRuleCreate(
            name="Dアンダースコア形式",
            description="Dxxxx_bit:value 形式を行番号ベースで解釈します。",
            is_active=True,
            skip_header_rows=1,
            offset_mode=AlarmParseRuleOffsetMode.ROW_INDEX_WORD,
            patterns=[
                AlarmParseRulePatternCreate(
                    pattern_name="d_underscore_format",
                    sort_order=1,
                    regex_pattern=r"D(\d+)_(\d+)\s*:(\d+)",
                    address_type_value="D",
                    alarm_no_mode="line_index",
                    address_group=1,
                    bit_group=2,
                    comment_mode="csv_columns",
                    comment_columns_start=1,
                    address_pad_length=4,
                )
            ],
        ),
        AlarmParseRuleCreate(
            name="GP-Pro EX",
            description="GP-Pro EX の Alarm Data CSV から Bit Log セクションを解釈します。",
            is_active=True,
            skip_header_rows=1,
            offset_mode=AlarmParseRuleOffsetMode.PRESERVE_ADDRESS,
            patterns=[
                AlarmParseRulePatternCreate(
                    pattern_name="plc_export_format",
                    sort_order=1,
                    regex_pattern=r"^(\d+),\[PLC\d+\](\d+\.\d{2}),\d,(.*?)(?=\s*,|$)",
                    address_type_value="",
                    alarm_no_mode="regex_group",
                    alarm_no_group=1,
                    combined_address_bit_group=2,
                    combined_address_bit_separator=".",
                    comment_mode="regex_group",
                    comment_group=3,
                    address_pad_length=4,
                )
            ],
        ),
    ]


def _parse_csv_preview(csv_content: str, rule: AlarmParseRule) -> AlarmAddressParsePreview:
    if any(pattern.pattern_name == "plc_export_format" for pattern in rule.patterns):
        return _parse_plc_export_csv_preview(csv_content, rule)

    lines = csv_content.splitlines()
    candidate_lines = lines[rule.skip_header_rows:]

    addresses: List[AlarmAddressPreview] = []
    warnings: List[str] = []
    processed_line_count = 0
    unmatched_line_count = 0

    for line_index, raw_line in enumerate(candidate_lines):
        if not raw_line.strip():
            continue

        processed_line_count += 1
        parsed_address = _parse_line(raw_line, line_index, rule)
        if parsed_address is None:
            if _should_warn_for_unmatched_line(raw_line, rule):
                warnings.append(f"{line_index + rule.skip_header_rows + 1}行目を解釈できませんでした")
                unmatched_line_count += 1
            continue

        addresses.append(parsed_address)

    return AlarmAddressParsePreview(
        parse_rule_id=rule.id,
        rule_name=rule.name,
        offset_mode=rule.offset_mode,
        addresses=sorted(addresses, key=lambda address: address.alarm_no),
        warnings=warnings,
        processed_line_count=processed_line_count,
        matched_line_count=len(addresses),
        unmatched_line_count=unmatched_line_count,
    )


def _parse_plc_export_csv_preview(csv_content: str, rule: AlarmParseRule) -> AlarmAddressParsePreview:
    lines = csv_content.splitlines()
    pattern = next(pattern for pattern in rule.patterns if pattern.pattern_name == "plc_export_format")
    addresses: List[AlarmAddressPreview] = []
    warnings: List[str] = []
    processed_line_count = 0
    unmatched_line_count = 0
    in_bit_log_section = False
    awaiting_bit_log_header = False

    for raw_line in lines[rule.skip_header_rows:]:
        stripped_line = raw_line.strip()
        if not stripped_line:
            continue

        if stripped_line == "Bit Log":
            in_bit_log_section = True
            awaiting_bit_log_header = True
            continue

        if stripped_line.startswith("Summary Setting") or stripped_line.startswith("Word Log") or re.fullmatch(r"Block\d+", stripped_line):
            in_bit_log_section = False
            awaiting_bit_log_header = False
            continue

        if not in_bit_log_section:
            continue

        if awaiting_bit_log_header:
            awaiting_bit_log_header = False
            continue

        processed_line_count += 1
        parsed_address = _parse_plc_export_line(raw_line, pattern, comment_index=3)
        if parsed_address is None:
            if _should_warn_for_unmatched_line(raw_line, rule):
                warnings.append("Bit Log セクション内の未解釈行があります")
                unmatched_line_count += 1
            continue

        addresses.append(parsed_address)

    return AlarmAddressParsePreview(
        parse_rule_id=rule.id,
        rule_name=rule.name,
        offset_mode=rule.offset_mode,
        addresses=sorted(addresses, key=lambda address: address.alarm_no),
        warnings=warnings,
        processed_line_count=processed_line_count,
        matched_line_count=len(addresses),
        unmatched_line_count=unmatched_line_count,
    )


def _parse_line(raw_line: str, line_index: int, rule: AlarmParseRule) -> Optional[AlarmAddressPreview]:
    for pattern in rule.patterns:
        match = re.search(pattern.regex_pattern, raw_line)
        if match is None:
            continue

        alarm_no = _extract_alarm_no(match, line_index, pattern.alarm_no_mode, pattern.alarm_no_group, pattern.alarm_no_offset)
        address_type = _extract_optional_group(match, pattern.address_type_group)
        if address_type is None:
            address_type = pattern.address_type_value or ""

        address, bit = _extract_address_and_bit(match, pattern.address_group, pattern.bit_group, pattern.combined_address_bit_group, pattern.combined_address_bit_separator)
        comments = _extract_comments(raw_line, match, pattern.comment_mode, pattern.comment_group, pattern.comment_columns_start)

        return AlarmAddressPreview(
            alarm_no=alarm_no,
            address_type=address_type,
            address=_normalize_address(address, pattern.address_pad_length),
            address_bit=bit,
            comments=comments,
        )

    return None


def _parse_plc_export_line(raw_line: str, pattern, comment_index: int) -> Optional[AlarmAddressPreview]:
    parsed_row = next(csv.reader(io.StringIO(raw_line)))
    if len(parsed_row) <= comment_index:
        return None

    alarm_no_value = parsed_row[0].strip()
    address_value = parsed_row[1].strip()
    comment_value = parsed_row[comment_index].strip()

    if not alarm_no_value.isdigit():
        return None

    address_match = re.fullmatch(r"\[PLC\d+\](\d+)\.(\d{2})", address_value)
    if address_match is None:
        return None

    comments = []
    cleaned_comment = _clean_comment(comment_value)
    if cleaned_comment:
        comments.append(AlarmCommentCreate(comment_id=1, comment=cleaned_comment))

    return AlarmAddressPreview(
        alarm_no=int(alarm_no_value),
        address_type=pattern.address_type_value or "",
        address=_normalize_address(address_match.group(1), pattern.address_pad_length),
        address_bit=int(address_match.group(2)),
        comments=comments,
    )


def _extract_alarm_no(match: re.Match[str], line_index: int, mode: str, group_index: Optional[int], offset: int) -> int:
    if mode == "regex_group" and group_index is not None:
        return int(match.group(group_index)) + offset
    return line_index + offset


def _extract_optional_group(match: re.Match[str], group_index: Optional[int]) -> Optional[str]:
    if group_index is None:
        return None
    value = match.group(group_index)
    return value.strip() if value is not None else None


def _extract_address_and_bit(
    match: re.Match[str],
    address_group: Optional[int],
    bit_group: Optional[int],
    combined_group: Optional[int],
    separator: str,
) -> tuple[str, int]:
    if combined_group is not None:
        combined_value = match.group(combined_group)
        if separator not in combined_value:
            raise HTTPException(status_code=400, detail=f"Combined address value '{combined_value}' does not contain separator '{separator}'")
        address, bit = combined_value.split(separator, 1)
        return address.strip(), int(bit.strip())

    if address_group is None or bit_group is None:
        raise HTTPException(status_code=400, detail="Parse rule pattern must define either address/bit groups or a combined address group")

    return match.group(address_group).strip(), int(match.group(bit_group).strip())


def _extract_comments(
    raw_line: str,
    match: re.Match[str],
    mode: str,
    group_index: Optional[int],
    column_start: Optional[int],
) -> List[AlarmCommentCreate]:
    if mode == "regex_group" and group_index is not None:
        comment = _clean_comment(match.group(group_index))
        if comment:
            return [AlarmCommentCreate(comment_id=1, comment=comment)]
        return []

    if mode == "csv_columns" and column_start is not None:
        parsed_row = next(csv.reader(io.StringIO(raw_line)))
        comments = []
        for index, value in enumerate(parsed_row[column_start:], start=1):
            comment = _clean_comment(value)
            if comment:
                comments.append(AlarmCommentCreate(comment_id=index, comment=comment))
        return comments

    return []


def _clean_comment(value: str) -> str:
    return value.strip().strip('"').strip()


def _normalize_address(value: str, pad_length: int) -> str:
    normalized = value.strip()
    if re.fullmatch(r"\d+", normalized):
        return normalized.zfill(pad_length)
    if re.fullmatch(r"[0-9A-Fa-f]+", normalized):
        return normalized.upper().zfill(pad_length)
    return normalized


def _should_warn_for_unmatched_line(raw_line: str, rule: AlarmParseRule) -> bool:
    stripped_line = raw_line.strip()
    if not stripped_line:
        return False

    if any(pattern.pattern_name == "plc_export_format" for pattern in rule.patterns):
        parsed_row = next(csv.reader(io.StringIO(raw_line)))
        return len(parsed_row) >= 2 and parsed_row[0].strip().isdigit() and parsed_row[1].strip().startswith("[PLC")

    if any(pattern.pattern_name == "legacy_d_format" for pattern in rule.patterns):
        return stripped_line.startswith("[") and ":" in stripped_line

    if any(pattern.pattern_name == "d_underscore_format" for pattern in rule.patterns):
        return stripped_line.startswith("D") and "_" in stripped_line and ":" in stripped_line

    return True