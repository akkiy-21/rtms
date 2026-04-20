# app/services/scan_service.py

from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from ..models import CodeLengthRule, CodeType, Users, UserMeasurements
from .. import schemas
from ..crud import scan_crud, user_crud, data_crud

def process_scan(db: Session, device_id: int, scan_data: str):
    # CodeLengthRuleからUserIDの長さ制限とチェックデジットの有無を取得
    user_id_rule = scan_crud.get_code_length_rule(db, CodeType.UserID)

    if not user_id_rule:
        return {"error": "User ID length rule not found"}
    
    # スキャンコードの長さが許容範囲内であることを確認
    if not (user_id_rule.min_length <= len(scan_data) <= user_id_rule.max_length + 1):
        return {"error": "Invalid scan data length"}

    # チェックデジットが有効な場合、検証を行う
    if user_id_rule.check_digit:
        main_code = scan_data[:-1]  # 最後の1文字をチェックデジットとして分離
        check_digit = scan_data[-1]

        # チェックデジットの検証関数を呼び出す
        if not validate_check_digit(main_code, check_digit):
            return {"error": "Invalid check digit"}
        
        scan_data = main_code  # チェックデジットが正しければ、チェックデジットを除いたコードを使用

    # Usersテーブルからユーザーを取得
    user = user_crud.get_user_from_id(db, scan_data)
    if not user:
        return {"error": "User not found"}

    # 最新のUserMeasurementを取得
    latest_measurement = data_crud.get_latest_user_measurement(db, device_id, user.id)

    # 新しい状態を決定
    new_state = not latest_measurement.state if latest_measurement else True

    # JST (UTC +9) のタイムゾーンを設定
    jst = timezone(timedelta(hours=9))

    new_measurement = schemas.UserMeasurementCreate(
        device_id=device_id,
        user_id=user.id,
        state=new_state,
        event_time=datetime.now(jst)  # JSTの現在時刻を取得
    )
    data_crud.create_user_measurement(db, new_measurement)

    return {
        "category": "UserID",
        "user_id": user.id,
        "user_name": user.name,
        "state": new_state
    }

def calculate_check_digit(main_code: str) -> str:
    """
    与えられたコードからチェックデジットを計算します。
    提供された例に基づいてアルファベットまたは数字のチェックデジットを返します。
    例:
    - "123456" -> "L"
    - "710002" -> "A"
    - "710001" -> "9"
    - "101152" -> "A"
    """
    total = sum(int(char) for char in main_code)
    remainder = total % 36

    # 0-9 の場合はそのまま数字を返し、10-35 の場合はアルファベットA-Zを返す
    if remainder < 10:
        return str(remainder)
    else:
        # 10から始まるので、Aが10、Bが11...となる
        return chr(remainder - 10 + ord('A'))

def validate_check_digit(main_code: str, check_digit: str) -> bool:
    """
    チェックデジットを検証するための関数。
    メインコードとチェックデジットを元に検証を行います。
    """
    calculated_check_digit = calculate_check_digit(main_code)
    return calculated_check_digit == check_digit
