# RTMSフロントエンド 翻訳ガイドライン

## 概要

このドキュメントは、RTMSフロントエンドアプリケーションにおける日本語翻訳の標準ガイドラインです。統一された翻訳パターンと用語使用により、一貫性のあるユーザーエクスペリエンスを提供することを目的としています。

## 基本原則

### 1. 翻訳の基本方針

- **統一性**: アプリケーション全体で一貫した用語と表現を使用する
- **自然性**: 日本のユーザーにとって自然で理解しやすい日本語を使用する
- **技術性**: 国際標準の技術用語は英語表記を維持する
- **丁寧性**: ユーザーに対して丁寧で分かりやすい表現を使用する

### 2. 対象範囲

- ナビゲーションメニュー
- ページタイトルと説明文
- フォームラベルとプレースホルダー
- テーブルヘッダーとコンテンツ
- ボタンとアクションラベル
- エラーメッセージとバリデーション
- ステータス表示
- 日付・時刻表示
- 確認ダイアログ
- トースト通知

## 用語分類と翻訳ルール

### 技術用語（英語維持）

**原則**: 国際標準の技術用語は英語表記を維持し、技術者間のコミュニケーションを円滑にする

**対象用語**:
```typescript
// ネットワーク関連
IP_ADDRESS: 'IP Address'
MAC_ADDRESS: 'MAC Address'
URL: 'URL'
API: 'API'
PORT: 'Port'

// プロトコル
HTTP: 'HTTP'
HTTPS: 'HTTPS'
MQTT: 'MQTT'
TCP: 'TCP'
UDP: 'UDP'

// データ形式
JSON: 'JSON'
XML: 'XML'
CSV: 'CSV'

// 識別子
ID: 'ID'
UUID: 'UUID'

// 産業機器
PLC: 'PLC'
IO: 'IO'
```

**使用例**:
- ✅ 正しい: "IP Addressを入力してください"
- ❌ 間違い: "IPアドレスを入力してください"

### 業務用語（日本語翻訳）

**原則**: システム固有の業務用語は適切な日本語に翻訳し、ユーザーの理解を促進する

**主要な翻訳マッピング**:
```typescript
// エンティティ
DEVICE: 'デバイス'
USER: 'ユーザー'
GROUP: 'グループ'
PRODUCT: '製品'
CUSTOMER: '顧客'
CLASSIFICATION: '分類'
ALARM: 'アラーム'

// 設定関連
SETTINGS: '設定'
CONFIGURATION: '設定'
MANAGEMENT: '管理'

// データ関連
DATA: 'データ'
INFORMATION: '情報'
DETAILS: '詳細'
```

**使用例**:
- ✅ 正しい: "デバイス管理"
- ❌ 間違い: "Device管理"

### アクションラベル（日本語翻訳）

**原則**: ユーザーの操作を示すアクションは統一された日本語ラベルを使用する

**基本的なCRUD操作**:
```typescript
CREATE: '作成'
CREATE_NEW: '新規作成'
EDIT: '編集'
UPDATE: '更新'
DELETE: '削除'
SAVE: '保存'
CANCEL: 'キャンセル'
```

**データ操作**:
```typescript
SEARCH: '検索'
FILTER: 'フィルター'
SORT: 'ソート'
DOWNLOAD: 'ダウンロード'
UPLOAD: 'アップロード'
IMPORT: 'インポート'
EXPORT: 'エクスポート'
```

### ステータス表示（日本語翻訳）

**原則**: システムの状態を直感的に理解できる日本語表現を使用する

**デバイスステータス**:
```typescript
ONLINE: 'オンライン'
OFFLINE: 'オフライン'
ERROR: 'エラー'
CONNECTING: '接続中'
```

**処理ステータス**:
```typescript
COMPLETED: '完了'
PROCESSING: '処理中'
FAILED: '失敗'
PENDING: '待機中'
```

**ユーザーロール**:
```typescript
SUPER_USER: 'スーパーユーザー'
ADMIN_USER: '管理者'
COMMON_USER: '一般ユーザー'
```

## メッセージパターン

### バリデーションメッセージ

**基本パターン**:
- 必須フィールド: `${fieldName}は必須です`
- 文字数制限: `${fieldName}は${maxLength}文字以内で入力してください`
- フォーマットエラー: `正しい${formatName}を入力してください`
- 重複エラー: `この${fieldName}は既に使用されています`

**使用例**:
```typescript
// ✅ 正しい
VALIDATION_MESSAGES.REQUIRED('ユーザー名') // "ユーザー名は必須です"
VALIDATION_MESSAGES.MAX_LENGTH('説明', 100) // "説明は100文字以内で入力してください"
VALIDATION_MESSAGES.INVALID_EMAIL() // "正しいメールアドレスを入力してください"
```

### 成功・エラーメッセージ

**成功メッセージパターン**:
- 作成成功: `${entityName}を作成しました`
- 更新成功: `${entityName}を更新しました`
- 削除成功: `${entityName}を削除しました`

**エラーメッセージパターン**:
- 取得エラー: `${entityName}の取得に失敗しました`
- 作成エラー: `${entityName}の作成に失敗しました`
- ネットワークエラー: `接続に問題があります。しばらく待ってから再試行してください`

**使用例**:
```typescript
// ✅ 正しい
MESSAGE_FORMATTER.SUCCESS_CREATE('ユーザー') // "ユーザーを作成しました"
MESSAGE_FORMATTER.ERROR_FETCH('デバイス') // "デバイスの取得に失敗しました"
```

### 確認メッセージ

**削除確認パターン**:
```typescript
CONFIRM_DELETE: (entityName: string) => 
  `この${entityName}を削除してもよろしいですか？この操作は取り消せません。`
```

**変更確認パターン**:
```typescript
CONFIRM_UNSAVED_CHANGES: () => 
  '保存されていない変更があります。このページを離れてもよろしいですか？'
```

### ローディングメッセージ

**基本パターン**:
```typescript
LOADING: () => '読み込み中...'
PROCESSING: () => '処理中...'
SAVING: () => '保存中...'
DELETING: () => '削除中...'
```

## 日付・時刻表示

### 日付フォーマット

**基本形式**:
- 短縮形: `YYYY/MM/DD` (例: 2023/12/25)
- 長い形式: `YYYY年MM月DD日` (例: 2023年12月25日)

**使用例**:
```typescript
// ✅ 正しい
DATE_FORMATTER.formatDate(new Date()) // "2023/12/25"
DATE_FORMATTER.formatDateLong(new Date()) // "2023年12月25日"
```

### 時刻フォーマット

**基本形式**:
- 短縮形: `HH:MM` (例: 14:30)
- 秒付き: `HH:MM:SS` (例: 14:30:45)

### 相対時間表示

**パターン**:
- 1分未満: `たった今`
- 1時間未満: `○分前`
- 1日未満: `○時間前`
- 1週間未満: `○日前`
- それ以上: 日付表示

**使用例**:
```typescript
// ✅ 正しい
DATE_FORMATTER.formatRelativeTime(pastDate) // "5分前"
```

### 期間表示

**パターン**:
- 秒単位: `○秒間`
- 分単位: `○分間`
- 時間単位: `○時間`
- 日単位: `○日間`

## 実装ガイドライン

### 翻訳定数の使用

**基本ルール**:
1. ハードコードされた文字列は使用しない
2. 適切な翻訳定数を使用する
3. 動的メッセージはフォーマッター関数を使用する

**使用例**:
```typescript
// ❌ 間違い
<PageHeader title="Users" />

// ✅ 正しい
<PageHeader title={BUSINESS_TERMS.USERS} />

// ❌ 間違い
<Button>Create New User</Button>

// ✅ 正しい
<Button>{ACTION_LABELS.CREATE_NEW}{BUSINESS_TERMS.USER}</Button>
```

### フォームバリデーション

**Zodスキーマでの使用例**:
```typescript
// ✅ 正しい
const userSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED("名前")),
  email: z.string().email(VALIDATION_MESSAGES.INVALID_EMAIL()),
  age: z.number().min(0, VALIDATION_MESSAGES.MIN_VALUE("年齢", 0)),
});
```

### テーブルカラム定義

**使用例**:
```typescript
// ✅ 正しい
const columns = [
  {
    accessorKey: "id",
    header: TECHNICAL_TERMS.ID,
  },
  {
    accessorKey: "name",
    header: "名前",
  },
  {
    accessorKey: "role",
    header: "ロール",
  },
];
```

### エラーハンドリング

**APIエラーの処理例**:
```typescript
// ✅ 正しい
try {
  await createUser(userData);
  toast.success(MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER));
} catch (error) {
  toast.error(MESSAGE_FORMATTER.ERROR_CREATE(BUSINESS_TERMS.USER));
}
```

## 品質保証

### 翻訳品質チェックリスト

**用語の一貫性**:
- [ ] 同じ概念に対して一貫した用語を使用している
- [ ] 技術用語と業務用語が適切に分類されている
- [ ] 同義語マッピングが適切に実装されている

**日本語表現**:
- [ ] 自然で理解しやすい日本語を使用している
- [ ] 丁寧語（です・ます調）を適切に使用している
- [ ] 敬語表現が適切に使用されている

**メッセージ品質**:
- [ ] エラーメッセージが分かりやすく具体的である
- [ ] 確認メッセージが適切な警告を含んでいる
- [ ] 成功メッセージが肯定的で明確である

**技術的品質**:
- [ ] 翻訳定数が適切に定義されている
- [ ] 動的メッセージが正しくフォーマットされる
- [ ] エラーハンドリングが適切に実装されている

### テスト戦略

**単体テスト**:
- 翻訳定数の正確性
- メッセージフォーマット関数の動作
- 日付・時刻フォーマット関数の出力

**統合テスト**:
- ページレベルでの翻訳適用
- フォームバリデーションメッセージ
- エラーハンドリングの翻訳

**プロパティベーステスト**:
- 翻訳一貫性の検証
- メッセージフォーマットの正確性
- 日付フォーマットの形式チェック

## 新機能開発時の注意点

### 翻訳対応チェックリスト

**新しいページ作成時**:
- [ ] ページタイトルを翻訳定数で定義
- [ ] ナビゲーションラベルを追加
- [ ] パンくずリストの翻訳対応

**新しいフォーム作成時**:
- [ ] フィールドラベルの翻訳
- [ ] プレースホルダーの翻訳
- [ ] バリデーションメッセージの翻訳
- [ ] 送信・キャンセルボタンの翻訳

**新しいテーブル作成時**:
- [ ] カラムヘッダーの翻訳
- [ ] 検索プレースホルダーの翻訳
- [ ] ソート指示の翻訳
- [ ] アクションボタンの翻訳

**新しいAPI連携時**:
- [ ] 成功メッセージの翻訳
- [ ] エラーメッセージの翻訳
- [ ] ローディングメッセージの翻訳

### 翻訳定数の追加手順

1. **適切なファイルの特定**:
   - 技術用語: `technical-terms.ts`
   - 業務用語: `business-terms.ts`
   - アクション: `action-labels.ts`
   - ステータス: `status-labels.ts`
   - ナビゲーション: `navigation-labels.ts`

2. **定数の追加**:
   ```typescript
   // 例: 新しい業務用語の追加
   export const BUSINESS_TERMS = {
     // 既存の定数...
     NEW_ENTITY: '新しいエンティティ',
   } as const;
   ```

3. **型定義の更新**:
   - TypeScriptの型推論により自動的に更新される

4. **使用箇所での適用**:
   ```typescript
   // コンポーネントでの使用
   <PageHeader title={BUSINESS_TERMS.NEW_ENTITY} />
   ```

5. **テストの追加**:
   - 新しい翻訳定数のテストを追加
   - 統合テストでの翻訳確認

## トラブルシューティング

### よくある問題と解決方法

**問題**: 翻訳定数が見つからない
```typescript
// ❌ エラーが発生
console.log(BUSINESS_TERMS.UNKNOWN_TERM); // undefined
```

**解決方法**: 適切な翻訳定数を使用するか、新しく定義する
```typescript
// ✅ 解決方法1: 既存の定数を使用
console.log(BUSINESS_TERMS.DEVICE);

// ✅ 解決方法2: 新しい定数を定義
export const BUSINESS_TERMS = {
  // ...
  NEW_TERM: '新しい用語',
} as const;
```

**問題**: メッセージフォーマットでエラーが発生
```typescript
// ❌ エラーが発生
MESSAGE_FORMATTER.SUCCESS_CREATE(); // 引数不足
```

**解決方法**: 必要な引数を提供する
```typescript
// ✅ 正しい使用方法
MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER);
```

**問題**: 日付フォーマットが期待通りに動作しない
```typescript
// ❌ 問題のあるコード
DATE_FORMATTER.formatDate("2023-12-25"); // 文字列を渡している
```

**解決方法**: Dateオブジェクトを渡す
```typescript
// ✅ 正しい使用方法
DATE_FORMATTER.formatDate(new Date("2023-12-25"));
```

## 参考資料

### 関連ファイル

- `frontend/src/localization/constants/` - 翻訳定数ファイル
- `frontend/src/localization/utils/` - 翻訳ユーティリティ関数
- `frontend/src/localization/types/` - 翻訳関連の型定義
- `frontend/src/__tests__/` - 翻訳品質テスト

### 設計ドキュメント

- `.kiro/specs/ui-localization-japanese/requirements.md` - 要件定義
- `.kiro/specs/ui-localization-japanese/design.md` - 設計ドキュメント
- `frontend/src/__tests__/translation-quality-report.md` - 品質確認レポート

### テストファイル

- `frontend/src/localization/constants/__tests__/` - 翻訳定数のテスト
- `frontend/src/localization/utils/__tests__/` - ユーティリティ関数のテスト
- `frontend/src/__tests__/localization-integration.test.tsx` - 統合テスト

## 更新履歴

- **2023年12月**: 初版作成
- RTMSフロントエンドアプリケーションの日本語化プロジェクト完了に伴い、翻訳ガイドラインを策定

---

このガイドラインに従うことで、RTMSフロントエンドアプリケーションにおいて一貫性のある高品質な日本語翻訳を実現できます。新機能開発時や翻訳の更新時は、このガイドラインを参照して適切な翻訳を実装してください。