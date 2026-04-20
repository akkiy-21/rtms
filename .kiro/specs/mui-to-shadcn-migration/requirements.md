# Requirements Document

## Introduction

このドキュメントは、RTMSフロントエンドアプリケーションのUIライブラリをMaterial-UI (MUI)からshadcn/uiへ段階的に移行するための要件を定義します。現在のアプリケーションには42個のページと34個のコンポーネントがあり、すべてMUIを使用しています。移行は各ページ単位で順次実行され、既存の機能を維持しながら、モダンなUIコンポーネントシステムへの移行を実現します。

## Glossary

- **MUI (Material-UI)**: 現在使用しているReact UIコンポーネントライブラリ
- **shadcn/ui**: Radix UIとTailwind CSSをベースにした、コピー&ペースト可能なコンポーネントコレクション
- **Tailwind CSS**: ユーティリティファーストのCSSフレームワーク
- **Radix UI**: アクセシブルなヘッドレスUIコンポーネントライブラリ
- **RTMS**: Real-Time Monitoring System（リアルタイム監視システム）
- **コンポーネント移行**: MUIコンポーネントをshadcn/uiコンポーネントに置き換えるプロセス
- **ページ移行**: 特定のページとそれに関連するコンポーネントを移行するプロセス

## Requirements

### Requirement 1

**User Story:** 開発者として、shadcn/uiの基盤をセットアップしたい。これにより、段階的な移行を開始できる。

#### Acceptance Criteria

1. WHEN 開発者がプロジェクトにTailwind CSSを追加する THEN システムはTailwind CSSの設定ファイルを生成し、既存のスタイルに影響を与えない
2. WHEN 開発者がshadcn/uiを初期化する THEN システムはcomponents.jsonとshadcn/ui用のディレクトリ構造を作成する
3. WHEN 開発者がTypeScript設定を更新する THEN システムはパスエイリアス（@/components）を正しく解決する
4. WHEN 開発者がグローバルCSSを設定する THEN システムはTailwindのベーススタイルとshadcn/uiのカスタムCSSを適用する
5. WHEN 既存のMUIコンポーネントが表示される THEN システムは既存のスタイルを維持し、視覚的な変更がない

### Requirement 2

**User Story:** 開発者として、基本的なshadcn/uiコンポーネントをインストールしたい。これにより、移行作業で使用できる。

#### Acceptance Criteria

1. WHEN 開発者がButtonコンポーネントを追加する THEN システムはsrc/components/ui/button.tsxを生成する
2. WHEN 開発者がInputコンポーネントを追加する THEN システムはsrc/components/ui/input.tsxを生成する
3. WHEN 開発者がDialogコンポーネントを追加する THEN システムはsrc/components/ui/dialog.tsxとその依存関係を生成する
4. WHEN 開発者がTableコンポーネントを追加する THEN システムはsrc/components/ui/table.tsxを生成する
5. WHEN 開発者がCardコンポーネントを追加する THEN システムはsrc/components/ui/card.tsxを生成する
6. WHEN 開発者がSelectコンポーネントを追加する THEN システムはsrc/components/ui/select.tsxとその依存関係を生成する
7. WHEN 開発者がFormコンポーネントを追加する THEN システムはsrc/components/ui/form.tsxとreact-hook-formの統合を生成する

### Requirement 3

**User Story:** 開発者として、最初のページ（UsersPage）を移行したい。これにより、移行パターンを確立できる。

#### Acceptance Criteria

1. WHEN UsersPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してユーザー一覧を表示する
2. WHEN UserListコンポーネントがレンダリングされる THEN システムはshadcn/ui Tableコンポーネントを使用してデータを表示する
3. WHEN ユーザーが「新規作成」ボタンをクリックする THEN システムはshadcn/ui Buttonコンポーネントで実装されたボタンに反応する
4. WHEN ユーザーが編集または削除アクションを実行する THEN システムは既存の機能を維持しながらshadcn/uiコンポーネントを使用する
5. WHEN 移行後のページが表示される THEN システムは既存のAPIエンドポイントとの統合を維持する

### Requirement 4

**User Story:** 開発者として、UserCreatePageとUserEditPageを移行したい。これにより、フォーム処理の移行パターンを確立できる。

#### Acceptance Criteria

1. WHEN UserCreatePageがレンダリングされる THEN システムはshadcn/ui FormコンポーネントとInputコンポーネントを使用する
2. WHEN UserFormコンポーネントがレンダリングされる THEN システムはreact-hook-formとshadcn/uiの統合を使用してバリデーションを実行する
3. WHEN ユーザーがフォームを送信する THEN システムは既存のバリデーションルールを維持する
4. WHEN バリデーションエラーが発生する THEN システムはshadcn/uiのエラー表示スタイルでエラーメッセージを表示する
5. WHEN フォーム送信が成功する THEN システムは既存のナビゲーション動作を維持する

### Requirement 5

**User Story:** 開発者として、GroupsPage関連のページを移行したい。これにより、リレーション管理UIの移行パターンを確立できる。

#### Acceptance Criteria

1. WHEN GroupsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してグループ一覧を表示する
2. WHEN GroupUsersPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してユーザーとグループの関連付けUIを表示する
3. WHEN ユーザーがグループにユーザーを追加または削除する THEN システムは既存の機能を維持しながらshadcn/uiコンポーネントを使用する
4. WHEN GroupCreatePageとGroupEditPageがレンダリングされる THEN システムはshadcn/ui Formコンポーネントを使用する

### Requirement 6

**User Story:** 開発者として、PLC関連のページを移行したい。これにより、複雑なフォームの移行パターンを確立できる。

#### Acceptance Criteria

1. WHEN PLCsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してPLC一覧を表示する
2. WHEN PLCCreatePageとPLCEditPageがレンダリングされる THEN システムはshadcn/ui Formコンポーネントを使用する
3. WHEN PLCFormコンポーネントがレンダリングされる THEN システムはSelectコンポーネントを使用してメーカーとプロトコルを選択できる
4. WHEN ユーザーがPLCを作成または編集する THEN システムは既存のバリデーションとAPI統合を維持する

### Requirement 7

**User Story:** 開発者として、Device関連のページを移行したい。これにより、複数の設定ページを持つエンティティの移行パターンを確立できる。

#### Acceptance Criteria

1. WHEN DevicesPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してデバイス一覧を表示する
2. WHEN DeviceCreatePageとDeviceEditPageがレンダリングされる THEN システムはshadcn/ui Formコンポーネントを使用する
3. WHEN DeviceDetailSettingsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用して詳細設定UIを表示する
4. WHEN DeviceProductSettingsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用して製品関連付けUIを表示する
5. WHEN ClientSettingsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してクライアント設定UIを表示する

### Requirement 8

**User Story:** 開発者として、Classification関連のページを移行したい。これにより、階層構造を持つデータの移行パターンを確立できる。

#### Acceptance Criteria

1. WHEN ClassificationsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用して分類一覧を表示する
2. WHEN ClassificationCreatePageとClassificationEditPageがレンダリングされる THEN システムはshadcn/ui Formコンポーネントを使用する
3. WHEN 分類グループと分類の階層関係が表示される THEN システムはshadcn/uiコンポーネントを使用して階層構造を視覚化する

### Requirement 9

**User Story:** 開発者として、Customer/Product関連のページを移行したい。これにより、マスターデータ管理UIの移行パターンを確立できる。

#### Acceptance Criteria

1. WHEN CustomersPageとProductsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してデータ一覧を表示する
2. WHEN 各作成・編集ページがレンダリングされる THEN システムはshadcn/ui Formコンポーネントを使用する
3. WHEN 顧客と製品の関連が表示される THEN システムはshadcn/uiコンポーネントを使用してリレーションを表示する

### Requirement 10

**User Story:** 開発者として、Alarm関連のページを移行したい。これにより、複雑なネストされたデータ構造の移行パターンを確立できる。

#### Acceptance Criteria

1. WHEN AlarmGroupsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してアラームグループ一覧を表示する
2. WHEN AlarmAddressesPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してアラームアドレスとコメントを表示する
3. WHEN AlarmGroupCreatePageとAlarmGroupEditPageがレンダリングされる THEN システムはshadcn/ui Formコンポーネントを使用する
4. WHEN ネストされたアラームコメントが表示される THEN システムはshadcn/uiコンポーネントを使用して階層構造を表示する

### Requirement 11

**User Story:** 開発者として、Logging関連のページを移行したい。これにより、親子関係を持つ設定UIの移行パターンを確立できる。

#### Acceptance Criteria

1. WHEN LoggingSettingsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してロギング設定一覧を表示する
2. WHEN LoggingDataSettingsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してロギングデータ設定を表示する
3. WHEN 各作成・編集ページがレンダリングされる THEN システムはshadcn/ui Formコンポーネントを使用する
4. WHEN ロギング設定とデータ設定の親子関係が表示される THEN システムはshadcn/uiコンポーネントを使用して関連を視覚化する

### Requirement 12

**User Story:** 開発者として、その他の設定ページを移行したい。これにより、すべてのページの移行を完了できる。

#### Acceptance Criteria

1. WHEN EfficiencySettingsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用して効率設定UIを表示する
2. WHEN IOSettingsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してIO設定UIを表示する
3. WHEN QualityControlSignalsPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用して品質管理シグナルUIを表示する
4. WHEN TimeTablePageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してタイムテーブルUIを表示する
5. WHEN DataDownloadPageがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してデータダウンロードUIを表示する

### Requirement 13

**User Story:** 開発者として、共通コンポーネント（Layout、CSVImporter、ResultDialog）を移行したい。これにより、アプリケーション全体で一貫したUIを提供できる。

#### Acceptance Criteria

1. WHEN Layoutコンポーネントがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してナビゲーションとレイアウト構造を表示する
2. WHEN CSVImporterコンポーネントがレンダリングされる THEN システムはshadcn/uiコンポーネントを使用してファイルアップロードUIを表示する
3. WHEN ResultDialogコンポーネントがレンダリングされる THEN システムはshadcn/ui Dialogコンポーネントを使用して結果を表示する
4. WHEN 共通コンポーネントが各ページで使用される THEN システムは一貫したスタイルと動作を提供する

### Requirement 14

**User Story:** 開発者として、MUI依存関係を削除したい。これにより、バンドルサイズを削減し、メンテナンス性を向上できる。

#### Acceptance Criteria

1. WHEN すべてのページとコンポーネントがshadcn/uiに移行される THEN システムはMUIコンポーネントへの参照を含まない
2. WHEN 開発者がMUI依存関係をpackage.jsonから削除する THEN システムはビルドエラーを発生させない
3. WHEN アプリケーションがビルドされる THEN システムはMUIライブラリをバンドルに含まない
4. WHEN アプリケーションが実行される THEN システムはすべての機能を正常に動作させる

### Requirement 15

**User Story:** 開発者として、移行ガイドとドキュメントを作成したい。これにより、将来の開発者が新しいコンポーネントシステムを理解できる。

#### Acceptance Criteria

1. WHEN 開発者がドキュメントを参照する THEN システムはshadcn/uiコンポーネントの使用方法を説明する
2. WHEN 開発者が新しいページを作成する THEN システムは移行パターンとベストプラクティスを提供する
3. WHEN 開発者がカスタムコンポーネントを作成する THEN システムはTailwind CSSとshadcn/uiのスタイリング規約を説明する
4. WHEN 開発者がトラブルシューティングを行う THEN システムは一般的な問題と解決策を提供する
