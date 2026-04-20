#!/usr/bin/env python3
"""
devices テーブルから計画生産系カラムを削除し、SSH 接続情報カラムを追加するマイグレーションスクリプト
"""

from sqlalchemy import text

from app.database import engine


def migrate_device_ssh_settings() -> None:
    with engine.connect() as connection:
        trans = connection.begin()

        try:
            print("devices テーブルの SSH 設定マイグレーションを開始します...")

            connection.execute(text("""
                ALTER TABLE devices
                ADD COLUMN IF NOT EXISTS ssh_username VARCHAR(100),
                ADD COLUMN IF NOT EXISTS ssh_password VARCHAR(255)
            """))
            print("   ✓ ssh_username / ssh_password 列を追加しました")

            connection.execute(text("""
                ALTER TABLE devices
                DROP COLUMN IF EXISTS ssh_remote_path,
                DROP COLUMN IF EXISTS planned_production_quantity,
                DROP COLUMN IF EXISTS planned_production_time
            """))
            print("   ✓ ssh_remote_path / planned_production_quantity / planned_production_time 列を削除しました")

            trans.commit()
            print("\n✓ マイグレーションが正常に完了しました")
        except Exception as e:
            trans.rollback()
            print(f"\n✗ マイグレーション中にエラーが発生しました: {e}")
            raise


if __name__ == "__main__":
    migrate_device_ssh_settings()