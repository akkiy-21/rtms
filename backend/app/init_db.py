# init_db.py
"""
データベースの初期化とシードデータの投入を行うスクリプト
"""
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import engine, Base, SQLALCHEMY_DATABASE_URL
from app.services import alarm_parse_rule_service
from app.services import user_service
# 全モデルをインポートしてBase.metadataに登録
from app import models
from app.models import (
    ClassificationGroup,
    Classification,
    PLC,
    AddressRange,
    AlarmParseRule,
    AlarmParseRulePattern,
    CodeLengthRule,
    Manufacturer,
    CodeType
)


BASE_DIR = Path(__file__).resolve().parents[1]


def drop_all_tables():
    """全テーブルを削除"""
    print("全テーブルを削除中...")
    Base.metadata.drop_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(text("DROP TABLE IF EXISTS alembic_version"))
    print("削除完了")


def create_all_tables():
    """全テーブルを作成"""
    print("全テーブルを作成中...")
    Base.metadata.create_all(bind=engine)
    print("作成完了")


def seed_classification_data(session: Session):
    """分類データの初期投入"""
    print("分類データを投入中...")
    
    # 分類グループの作成
    operating_time_group = ClassificationGroup(name="操業時間")
    performance_loss_group = ClassificationGroup(name="性能ロス時間")
    stop_loss_group = ClassificationGroup(name="停止ロス時間")
    planned_stop_group = ClassificationGroup(name="計画停止時間")

    session.add_all([
        operating_time_group,
        performance_loss_group,
        stop_loss_group,
        planned_stop_group
    ])
    session.commit()

    # 分類の作成
    classifications = [
        Classification(name="稼働", group=operating_time_group),
        Classification(name="速度低下", group=performance_loss_group),
        Classification(name="チョコ停", group=performance_loss_group),
        Classification(name="故障", group=stop_loss_group),
        Classification(name="段取り・調整", group=stop_loss_group),
        Classification(name="立上り", group=stop_loss_group),
        Classification(name="前干渉", group=stop_loss_group),
        Classification(name="後干渉", group=stop_loss_group),
        Classification(name="計画停止中", group=planned_stop_group),
        Classification(name="休憩時間", group=planned_stop_group),
        Classification(name="その他時間", group=planned_stop_group),
    ]
    
    session.add_all(classifications)
    session.commit()
    print(f"分類データ投入完了: {len(classifications)}件")


def seed_plc_data(session: Session):
    """PLCデータの初期投入"""
    print("PLCデータを投入中...")
    
    # PLCの作成
    plc_keyence = PLC(
        model="GeneralPLC",
        manufacturer=Manufacturer.KEYENCE,
        protocol="MC"
    )
    plc_omron = PLC(
        model="GeneralPLC",
        manufacturer=Manufacturer.OMRON,
        protocol="FINS"
    )
    
    session.add_all([plc_keyence, plc_omron])
    session.commit()

    # KEYENCEのアドレス範囲
    keyence_ranges = [
        AddressRange(
            plc_id=plc_keyence.id,
            address_type="M",
            address_range="0-399915",
            numerical_base="decimal",
            data_type="bit"
        ),
        AddressRange(
            plc_id=plc_keyence.id,
            address_type="B",
            address_range="0-7FFF",
            numerical_base="hex",
            data_type="bit"
        ),
        AddressRange(
            plc_id=plc_keyence.id,
            address_type="D",
            address_range="0-65534",
            numerical_base="decimal",
            data_type="word"
        ),
        AddressRange(
            plc_id=plc_keyence.id,
            address_type="W",
            address_range="0-7FFF",
            numerical_base="hex",
            data_type="word"
        ),
    ]

    # OMRONのアドレス範囲
    omron_ranges = [
        AddressRange(
            plc_id=plc_omron.id,
            address_type="W",
            address_range="0-127",
            numerical_base="decimal",
            data_type="bit"
        ),
        AddressRange(
            plc_id=plc_omron.id,
            address_type="D",
            address_range="0-16383",
            numerical_base="decimal",
            data_type="word"
        ),
        AddressRange(
            plc_id=plc_omron.id,
            address_type="CIO",
            address_range="0-6143",
            numerical_base="decimal",
            data_type="word"
        ),
    ]
    
    session.add_all(keyence_ranges + omron_ranges)
    session.commit()
    print(f"PLCデータ投入完了: PLC {2}件, アドレス範囲 {len(keyence_ranges) + len(omron_ranges)}件")


def seed_code_length_rules(session: Session):
    """コード長ルールの初期投入"""
    print("コード長ルールを投入中...")
    
    rules = [
        CodeLengthRule(
            min_length=10,
            max_length=15,
            code_type=CodeType.ProductNumber,
            check_digit=False
        ),
    ]
    
    session.add_all(rules)
    session.commit()
    print(f"コード長ルール投入完了: {len(rules)}件")


def seed_alarm_parse_rules(session: Session):
    """アラームパースルールの初期投入"""
    print("アラームパースルールを投入中...")
    alarm_parse_rule_service.seed_default_alarm_parse_rules(session)
    print("アラームパースルール投入完了")


def seed_initial_admin_user(session: Session):
    """初期管理者の投入"""
    result = user_service.ensure_initial_admin_user(session)
    if result is None:
        print("初期管理者は既に存在します")
        return

    user, temporary_password = result
    print(f"初期管理者を投入しました: id={user.id}, role={user.role}")
    print(f"初期管理者の初回ログイン用パスワード: {temporary_password}")


def stamp_alembic_head():
    """新規作成したDBを Alembic head として記録する。"""
    alembic_config = Config(str(BASE_DIR / "alembic.ini"))
    alembic_config.set_main_option("script_location", str(BASE_DIR / "alembic"))
    alembic_config.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URL.replace("%", "%%"))
    command.stamp(alembic_config, "head")
    print("Alembic revision を head に設定しました")


def init_db(drop_existing: bool = False):
    """
    データベースの初期化
    
    Args:
        drop_existing: 既存のテーブルを削除するかどうか
    """
    from app.database import SessionLocal
    
    if drop_existing:
        drop_all_tables()
    
    create_all_tables()
    
    # シードデータの投入
    session = SessionLocal()
    try:
        seed_classification_data(session)
        seed_plc_data(session)
        seed_code_length_rules(session)
        seed_alarm_parse_rules(session)
        seed_initial_admin_user(session)
        stamp_alembic_head()
        print("\n[OK] データベースの初期化が完了しました")
    except Exception as e:
        session.rollback()
        print(f"\n[ERROR] エラーが発生しました: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    import sys
    
    # コマンドライン引数で既存テーブルの削除を制御
    drop_existing = "--drop" in sys.argv or "-d" in sys.argv
    
    if drop_existing:
        confirm = input("既存のテーブルを削除してよろしいですか？ (yes/no): ")
        if confirm.lower() != "yes":
            print("キャンセルしました")
            sys.exit(0)
    
    init_db(drop_existing=drop_existing)
