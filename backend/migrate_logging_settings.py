#!/usr/bin/env python3
"""
ロギング設定テーブルのマイグレーションスクリプト
- description列を追加
- logging_type列を削除
"""

from sqlalchemy import text
from app.database import engine

def migrate_logging_settings():
    """ロギング設定テーブルのマイグレーション"""
    
    with engine.connect() as connection:
        # トランザクション開始
        trans = connection.begin()
        
        try:
            print("ロギング設定テーブルのマイグレーションを開始します...")
            
            # 1. description列を追加
            print("1. description列を追加中...")
            connection.execute(text("""
                ALTER TABLE logging_settings 
                ADD COLUMN description TEXT
            """))
            print("   ✓ description列を追加しました")
            
            # 2. logging_type列を削除
            print("2. logging_type列を削除中...")
            connection.execute(text("""
                ALTER TABLE logging_settings 
                DROP COLUMN IF EXISTS logging_type
            """))
            print("   ✓ logging_type列を削除しました")
            
            # コミット
            trans.commit()
            print("\n✓ マイグレーションが正常に完了しました")
            
        except Exception as e:
            # ロールバック
            trans.rollback()
            print(f"\n✗ マイグレーション中にエラーが発生しました: {e}")
            raise

if __name__ == "__main__":
    migrate_logging_settings()