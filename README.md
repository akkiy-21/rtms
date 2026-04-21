# RTMS (Real-Time Monitoring System)

リアルタイム監視システムのモノレポ構成プロジェクト

## 技術スタック

### フロントエンド
- **React** + **TypeScript** - メインフレームワーク
- **Tailwind CSS** - ユーティリティファーストCSSフレームワーク
- **shadcn/ui** - Radix UIとTailwind CSSをベースにしたコンポーネントライブラリ
- **React Hook Form** + **Zod** - フォーム管理とバリデーション
- **TanStack Table** - 高性能なテーブルコンポーネント
- **Lucide React** - アイコンライブラリ
- **日本語化システム** - 統一された日本語UIの提供

### バックエンド
- **FastAPI** + **Python** - REST API フレームワーク
- **SQLAlchemy** - ORM
- **PostgreSQL** - データベース
- **MQTT** - リアルタイムメッセージング

## プロジェクト構成

```
rtms-monorepo/
├── frontend/                    # React + TypeScript フロントエンド
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui 基本コンポーネント
│   │   │   ├── layout/         # レイアウトコンポーネント
│   │   │   ├── common/         # 共通コンポーネント
│   │   │   └── features/       # 機能別コンポーネント
│   │   ├── pages/              # ページコンポーネント
│   │   ├── hooks/              # カスタムフック
│   │   ├── lib/                # ユーティリティ
│   │   ├── localization/       # 日本語化システム
│   │   │   ├── constants/      # 翻訳定数
│   │   │   ├── utils/          # 翻訳ユーティリティ
│   │   │   └── types/          # 翻訳関連型定義
│   │   └── styles/             # Tailwind CSS スタイル
│   ├── components.json         # shadcn/ui 設定
│   └── tailwind.config.js      # Tailwind CSS 設定
├── backend/                     # FastAPI + Python バックエンド
│   ├── app/
│   │   ├── mqtt_worker.py      # MQTT メッセージ処理（独立プロセス）
│   │   └── main.py             # FastAPI アプリケーション
├── package.json                 # ルート package.json (npm workspaces)
└── README.md
```

## アーキテクチャ

### MQTT メッセージ処理

MQTT メッセージは **独立したワーカープロセス** (`mqtt_worker.py`) で処理されます。

- **FastAPI サーバー**: REST API を提供（複数ワーカーで起動可能）
- **MQTT ワーカー**: MQTT メッセージを受信してデータベースに書き込み（単一プロセス）

この設計により、FastAPI を複数ワーカーで起動しても、MQTT メッセージは1回だけ処理されます。

## 必要な環境

- Node.js (v18以上推奨)
- Python 3.12以上
- uv (Python パッケージマネージャー)
- Docker & Docker Compose (PostgreSQL用)

## セットアップ

### 1. PostgreSQL と Mosquitto の起動

```bash
# Docker Compose で PostgreSQL と Mosquitto (MQTT ブローカー) を起動
docker-compose up -d
```

### 2. 依存関係のインストール

```bash
# フロントエンドの依存関係（Tailwind CSS、shadcn/ui含む）
npm install

# バックエンドの依存関係
cd backend
uv sync
```

### 2.1. 環境変数の準備

プロジェクトルートの .env.example を .env にコピーし、少なくとも以下を設定してください。

```bash
RTMS_JWT_SECRET=十分に長いランダム文字列
RTMS_INITIAL_ADMIN_ID=admin
RTMS_INITIAL_ADMIN_PASSWORD=初期管理者パスワード
```

backend は起動時、Alembic 実行時、init_db 実行時にプロジェクトルートの .env を自動で読み込みます。

### 2.2. shadcn/ui の初期セットアップ（初回のみ）

shadcn/ui は既に設定済みですが、新しいコンポーネントを追加する場合は以下のコマンドを使用します：

```bash
cd frontend

# 利用可能なコンポーネントを確認
npx shadcn-ui@latest add --help

# 新しいコンポーネントを追加（例：calendar）
npx shadcn-ui@latest add calendar
```

### 3. データベースの初期化

```bash
# 初回のみ: テーブル作成とシードデータ投入
cd backend
uv run python -m app.init_db

# 既存データを削除して再初期化する場合
uv run python -m app.init_db --drop
```

初期管理者は .env の RTMS_INITIAL_ADMIN_ID と RTMS_INITIAL_ADMIN_PASSWORD から作成されます。未設定の場合、初期化は失敗します。

### 4. 開発サーバーの起動

```bash
# ターミナル1: MQTT ワーカー（必須）
npm run mqtt:worker

# ターミナル2: バックエンド API サーバー
npm run backend:dev

# ターミナル3: フロントエンド
npm run frontend:start
```

**重要**: MQTT ワーカーは必ず起動してください。これがないと MQTT メッセージが処理されません。

## 利用可能なスクリプト

### フロントエンド
- `npm run frontend:start` - 開発サーバー起動
- `npm run frontend:build` - ビルド
- `npm run frontend:test` - テスト実行

#### shadcn/ui コンポーネント管理
- `cd frontend && npx shadcn-ui@latest add [component-name]` - 新しいコンポーネント追加
- `cd frontend && npx shadcn-ui@latest diff` - コンポーネントの更新確認

### バックエンド
- `npm run backend:start` - API サーバー起動（uvicorn、開発用）
- `npm run backend:dev` - API サーバー起動（本番用、4ワーカー）
- `npm run mqtt:worker` - MQTT ワーカー起動（必須）
- `cd backend && uv run python -m app.init_db` - データベース初期化
- `cd backend && uv run python -m app.init_db --drop` - データベース再初期化

### Docker
- `docker-compose up -d` - PostgreSQL と Mosquitto 起動
- `docker-compose down` - コンテナ停止
- `docker-compose logs -f postgres` - PostgreSQL ログ確認
- `docker-compose logs -f mosquitto` - Mosquitto ログ確認

## 開発ガイド

### UI コンポーネント開発

このプロジェクトでは統一されたデザインシステムを使用しています：

- **[コンポーネント使用ガイド](COMPONENT_GUIDE.md)** - shadcn/ui コンポーネントの使用方法
- **[スタイリングガイド](STYLING_GUIDE.md)** - Tailwind CSS とカスタマイズ方法
- **[移行パターン](MIGRATION_PATTERNS.md)** - MUI から shadcn/ui への移行パターン

### 日本語化システム

このプロジェクトは統一された日本語UIを提供するための包括的な日本語化システムを実装しています：

- **[翻訳ガイドライン](frontend/TRANSLATION_GUIDELINES.md)** - 翻訳の基本方針と用語統一ルール
- **[翻訳用語集](frontend/TRANSLATION_GLOSSARY.md)** - 技術用語と業務用語の翻訳マッピング
- **[開発者向け翻訳ガイド](frontend/DEVELOPER_TRANSLATION_GUIDE.md)** - 開発時の翻訳実装方法
- **[ローカライゼーション実装ガイド](frontend/LOCALIZATION_IMPLEMENTATION_GUIDE.md)** - 翻訳システムの技術詳細
- **[翻訳定数使用方法](frontend/TRANSLATION_CONSTANTS_USAGE.md)** - 翻訳定数の使用例とベストプラクティス
- **[メッセージフォーマット例](frontend/MESSAGE_FORMATTER_EXAMPLES.md)** - 動的メッセージ生成の使用例
- **[ローカライゼーション例](frontend/LOCALIZATION_EXAMPLES.md)** - 実際の翻訳適用例

### トラブルシューティング

問題が発生した場合は **[トラブルシューティングガイド](TROUBLESHOOTING.md)** を参照してください。

### 主な設計原則

1. **統一されたデザインシステム**: すべてのページで一貫したUI/UXを提供
2. **コンポーネントの再利用性**: 共通コンポーネントを活用した効率的な開発
3. **アクセシビリティ**: WCAG 2.1 AA レベルに準拠
4. **パフォーマンス**: Tree shaking とコード分割による最適化

### ディレクトリ構造の説明

#### フロントエンド (`frontend/src/`)

```
components/
├── ui/                 # shadcn/ui 基本コンポーネント（自動生成）
├── layout/             # レイアウト関連（ヘッダー、サイドバーなど）
├── common/             # 共通コンポーネント（テーブル、フォームなど）
└── features/           # 機能別コンポーネント（users、devices など）

pages/                  # ページコンポーネント
hooks/                  # カスタムフック
lib/                    # ユーティリティ関数
localization/           # 日本語化システム
├── constants/          # 翻訳定数ファイル
│   ├── technical-terms.ts      # 技術用語（英語維持）
│   ├── business-terms.ts       # 業務用語の日英マッピング
│   ├── action-labels.ts        # アクションラベルの翻訳
│   ├── status-labels.ts        # ステータス表示の翻訳
│   ├── navigation-labels.ts    # ナビゲーションラベル
│   ├── table-labels.ts         # テーブル関連ラベル
│   ├── validation-messages.ts  # バリデーションメッセージテンプレート
│   ├── user-labels.ts          # ユーザー関連ラベル
│   ├── group-labels.ts         # グループ関連ラベル
│   ├── device-labels.ts        # デバイス関連ラベル
│   ├── plc-labels.ts           # PLC関連ラベル
│   ├── classification-labels.ts # 分類関連ラベル
│   ├── customer-labels.ts      # 顧客関連ラベル
│   ├── product-labels.ts       # 製品関連ラベル
│   ├── alarm-labels.ts         # アラーム関連ラベル
│   ├── logging-labels.ts       # ロギング関連ラベル
│   └── settings-labels.ts      # 設定関連ラベル
├── utils/              # 翻訳ユーティリティ関数
│   ├── message-formatter.ts    # メッセージフォーマット関数
│   ├── date-formatter.ts       # 日付・時刻フォーマット関数
│   └── term-validator.ts       # 用語一貫性チェック関数
└── types/              # 翻訳関連型定義
    └── localization.types.ts   # 翻訳システムの型定義
styles/                 # グローバルスタイル
```

#### 新しいページの作成手順

1. `pages/` にページコンポーネントを作成
2. 必要に応じて `components/features/` に機能別コンポーネントを作成
3. フォームがある場合は zod スキーマを定義
4. テーブルがある場合はカラム定義を作成
5. 共通コンポーネント（PageHeader、DataTable、FormWrapper）を活用
6. **翻訳定数を使用してすべてのテキストを日本語化**

### 日本語化システムの詳細

#### 翻訳アーキテクチャ

このプロジェクトの日本語化システムは以下の原則に基づいて設計されています：

1. **技術用語の英語維持**: IP Address、MAC Address、JSON、API、URLなどの国際標準技術用語は英語表記を維持
2. **業務用語の日本語化**: Device（デバイス）、User（ユーザー）、Group（グループ）などの業務用語は適切な日本語に翻訳
3. **一貫した翻訳パターン**: アプリケーション全体で統一された用語使用
4. **自然な日本語表現**: ユーザーにとって理解しやすい日本語の使用

#### 翻訳定数の使用方法

```typescript
// 技術用語（英語維持）
import { TECHNICAL_TERMS } from '@/localization/constants/technical-terms';
<FormField label={TECHNICAL_TERMS.IP_ADDRESS} />

// 業務用語（日本語翻訳）
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
<PageHeader title={BUSINESS_TERMS.DEVICES} />

// アクションラベル
import { ACTION_LABELS } from '@/localization/constants/action-labels';
<Button>{ACTION_LABELS.CREATE}</Button>

// バリデーションメッセージ
import { VALIDATION_MESSAGES } from '@/localization/constants/validation-messages';
const schema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED("名前"))
});
```

#### メッセージフォーマット関数

動的なメッセージ生成には専用のフォーマッター関数を使用：

```typescript
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

// 成功メッセージ
const successMessage = MESSAGE_FORMATTER.SUCCESS_CREATE("ユーザー");
// → "ユーザーを作成しました"

// エラーメッセージ
const errorMessage = MESSAGE_FORMATTER.ERROR_FETCH("デバイス");
// → "デバイスの取得に失敗しました"
```

#### 日付・時刻フォーマット

日本の形式に合わせた日付・時刻表示：

```typescript
import { DATE_FORMATTER } from '@/localization/utils/date-formatter';

const date = new Date();
const formattedDate = DATE_FORMATTER.formatDate(date);        // "2023/12/25"
const formattedTime = DATE_FORMATTER.formatTime(date);        // "10:30:00"
const relativeTime = DATE_FORMATTER.formatRelativeTime(date); // "5分前"
```

#### 翻訳品質保証

- **プロパティベーステスト**: 翻訳の一貫性と正確性を自動検証
- **統合テスト**: ページレベルでの翻訳適用を確認
- **用語一貫性チェック**: 同じ概念に対する統一された用語使用を保証

## ライセンス

ISC
