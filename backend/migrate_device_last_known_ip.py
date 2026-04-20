#!/usr/bin/env python3
"""
devices テーブルへ last_known_ip_address 列を追加するマイグレーションスクリプト
"""

from sqlalchemy import text

from app.database import engine


def migrate_device_last_known_ip() -> None:
    """devices テーブルにクライアント到達用IP列を追加する。"""

    with engine.connect() as connection:
        trans = connection.begin()

        try:
            print("devices テーブルのマイグレーションを開始します...")

            connection.execute(text("""
                ALTER TABLE devices
                ADD COLUMN IF NOT EXISTS last_known_ip_address VARCHAR(45)
            """))
            print("   ✓ last_known_ip_address 列を追加しました")

            trans.commit()
            print("\n✓ マイグレーションが正常に完了しました")
        except Exception as e:
            trans.rollback()
            print(f"\n✗ マイグレーション中にエラーが発生しました: {e}")
            raise


if __name__ == "__main__":
    migrate_device_last_known_ip()