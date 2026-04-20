# Design Document

## Overview

このドキュメントは、RTMSフロントエンドアプリケーションのUI日本語化プロジェクトの技術設計を定義します。現在のアプリケーションでは英語と日本語が混在しており、ユーザーエクスペリエンスの一貫性が損なわれています。この設計により、統一された日本語UIを提供し、日本のユーザーにとってより使いやすいインターフェースを実現します。

主な目標：
1. **統一された言語体験**: すべてのUI要素で一貫した日本語を使用
2. **技術用語の適切な処理**: 国際標準の技術用語は英語を維持
3. **自然な日本語表現**: ユーザーにとって理解しやすい日本語の使用
4. **翻訳パターンの標準化**: 将来の開発で一貫した翻訳を適用

## Architecture

### 翻訳アーキテクチャ

```
frontend/src/
├── localization/
│   ├── constants/
│   │   ├── technical-terms.ts      # 英語維持する技術用語
│   │   ├── business-terms.ts       # 業務用語の日英マッピング
│   │   ├── action-labels.ts        # アクションラベルの翻訳
│   │   ├── status-labels.ts        # ステータス表示の翻訳
│   │   └── validation-messages.ts  # バリデーションメッセージテンプレート
│   ├── utils/
│   │   ├── message-formatter.ts    # メッセージフォーマット関数
│   │   ├── date-formatter.ts       # 日付・時刻フォーマット関数
│   │   └── term-validator.ts       # 用語一貫性チェック関数
│   └── types/
│       └── localization.types.ts   # 翻訳関連の型定義
├── components/
│   ├── ui/                         # shadcn/ui基本コンポーネント（日本語化）
│   ├── common/                     # 共通コンポーネント（日本語化）
│   └── features/                   # 機能別コンポーネント（日本語化）
└── pages/                          # ページコンポーネント（日本語化）
```

### 翻訳レイヤー構造

1. **定数レイヤー**: 翻訳マッピングと用語定義
2. **ユーティリティレイヤー**: フォーマット関数と検証ロジック
3. **コンポーネントレイヤー**: UI要素での翻訳適用
4. **ページレイヤー**: ページレベルでの統一された翻訳

## Components and Interfaces

### 翻訳定数の定義

#### 技術用語（英語維持）

```typescript
// localization/constants/technical-terms.ts
export const TECHNICAL_TERMS = {
  // ネットワーク関連
  IP_ADDRESS: 'IP Address',
  MAC_ADDRESS: 'MAC Address',
  URL: 'URL',
  API: 'API',
  PORT: 'Port',
  
  // プロトコル
  HTTP: 'HTTP',
  HTTPS: 'HTTPS',
  MQTT: 'MQTT',
  TCP: 'TCP',
  UDP: 'UDP',
  
  // データ形式
  JSON: 'JSON',
  XML: 'XML',
  CSV: 'CSV',
  
  // その他
  ID: 'ID',
  UUID: 'UUID',
} as const;

export type TechnicalTerm = typeof TECHNICAL_TERMS[keyof typeof TECHNICAL_TERMS];
```

#### 業務用語の翻訳マッピング

```typescript
// localization/constants/business-terms.ts
export const BUSINESS_TERMS = {
  // エンティティ
  DEVICE: 'デバイス',
  DEVICES: 'デバイス',
  USER: 'ユーザー',
  USERS: 'ユーザー',
  GROUP: 'グループ',
  GROUPS: 'グループ',
  PRODUCT: '製品',
  PRODUCTS: '製品',
  CUSTOMER: '顧客',
  CUSTOMERS: '顧客',
  CLASSIFICATION: '分類',
  CLASSIFICATIONS: '分類',
  PLC: 'PLC',
  PLCS: 'PLC',
  ALARM: 'アラーム',
  ALARMS: 'アラーム',
  
  // 設定関連
  SETTINGS: '設定',
  CONFIGURATION: '設定',
  MANAGEMENT: '管理',
  
  // データ関連
  DATA: 'データ',
  INFORMATION: '情報',
  DETAILS: '詳細',
} as const;

export type BusinessTerm = typeof BUSINESS_TERMS[keyof typeof BUSINESS_TERMS];
```

#### アクションラベルの翻訳

```typescript
// localization/constants/action-labels.ts
export const ACTION_LABELS = {
  // CRUD操作
  CREATE: '作成',
  CREATE_NEW: '新規作成',
  EDIT: '編集',
  UPDATE: '更新',
  DELETE: '削除',
  SAVE: '保存',
  CANCEL: 'キャンセル',
  
  // ナビゲーション
  BACK: '戻る',
  NEXT: '次へ',
  PREVIOUS: '前へ',
  
  // データ操作
  SEARCH: '検索',
  FILTER: 'フィルター',
  SORT: 'ソート',
  DOWNLOAD: 'ダウンロード',
  UPLOAD: 'アップロード',
  IMPORT: 'インポート',
  EXPORT: 'エクスポート',
  
  // 確認・実行
  CONFIRM: '確認',
  SUBMIT: '送信',
  APPLY: '適用',
  RESET: 'リセット',
  CLEAR: 'クリア',
  
  // 表示制御
  SHOW: '表示',
  HIDE: '非表示',
  EXPAND: '展開',
  COLLAPSE: '折りたたみ',
} as const;

export type ActionLabel = typeof ACTION_LABELS[keyof typeof ACTION_LABELS];
```

#### ステータス表示の翻訳

```typescript
// localization/constants/status-labels.ts
export const STATUS_LABELS = {
  // ユーザーロール
  SUPER_USER: 'スーパーユーザー',
  ADMIN_USER: '管理者',
  COMMON_USER: '一般ユーザー',
  
  // デバイスステータス
  ONLINE: 'オンライン',
  OFFLINE: 'オフライン',
  ERROR: 'エラー',
  CONNECTING: '接続中',
  DISCONNECTED: '切断',
  
  // 処理ステータス
  COMPLETED: '完了',
  PROCESSING: '処理中',
  FAILED: '失敗',
  PENDING: '待機中',
  CANCELLED: 'キャンセル済み',
  
  // 一般的な状態
  ACTIVE: 'アクティブ',
  INACTIVE: '非アクティブ',
  ENABLED: '有効',
  DISABLED: '無効',
  AVAILABLE: '利用可能',
  UNAVAILABLE: '利用不可',
} as const;

export type StatusLabel = typeof STATUS_LABELS[keyof typeof STATUS_LABELS];
```

### バリデーションメッセージテンプレート

```typescript
// localization/constants/validation-messages.ts
export const VALIDATION_MESSAGES = {
  REQUIRED: (fieldName: string) => `${fieldName}は必須です`,
  MAX_LENGTH: (fieldName: string, maxLength: number) => 
    `${fieldName}は${maxLength}文字以内で入力してください`,
  MIN_LENGTH: (fieldName: string, minLength: number) => 
    `${fieldName}は${minLength}文字以上で入力してください`,
  INVALID_FORMAT: (formatName: string) => 
    `正しい${formatName}を入力してください`,
  ALREADY_EXISTS: (fieldName: string) => 
    `この${fieldName}は既に使用されています`,
  INVALID_RANGE: (min: number, max: number) => 
    `${min}から${max}の範囲で入力してください`,
  INVALID_EMAIL: () => '正しいメールアドレスを入力してください',
  INVALID_URL: () => '正しいURLを入力してください',
  INVALID_IP_ADDRESS: () => '正しいIP Addressを入力してください',
  INVALID_MAC_ADDRESS: () => '正しいMAC Addressを入力してください',
} as const;
```

### メッセージフォーマット関数

```typescript
// localization/utils/message-formatter.ts
export const MESSAGE_FORMATTER = {
  // 成功メッセージ
  SUCCESS_CREATE: (entityName: string) => `${entityName}を作成しました`,
  SUCCESS_UPDATE: (entityName: string) => `${entityName}を更新しました`,
  SUCCESS_DELETE: (entityName: string) => `${entityName}を削除しました`,
  SUCCESS_SAVE: () => '正常に保存されました',
  
  // エラーメッセージ
  ERROR_FETCH: (entityName: string) => `${entityName}の取得に失敗しました`,
  ERROR_CREATE: (entityName: string) => `${entityName}の作成に失敗しました`,
  ERROR_UPDATE: (entityName: string) => `${entityName}の更新に失敗しました`,
  ERROR_DELETE: (entityName: string) => `${entityName}の削除に失敗しました`,
  ERROR_NETWORK: () => '接続に問題があります。しばらく待ってから再試行してください',
  ERROR_PERMISSION: () => 'この操作を実行する権限がありません',
  ERROR_UNKNOWN: () => '予期しないエラーが発生しました',
  
  // 確認メッセージ
  CONFIRM_DELETE: (entityName: string) => 
    `この${entityName}を削除してもよろしいですか？この操作は取り消せません。`,
  CONFIRM_UNSAVED_CHANGES: () => 
    '保存されていない変更があります。このページを離れてもよろしいですか？',
  
  // ローディングメッセージ
  LOADING: () => '読み込み中...',
  PROCESSING: () => '処理中...',
  SAVING: () => '保存中...',
  DELETING: () => '削除中...',
} as const;
```

### 日付・時刻フォーマット関数

```typescript
// localization/utils/date-formatter.ts
export const DATE_FORMATTER = {
  // 日付フォーマット
  formatDate: (date: Date): string => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  },
  
  // 時刻フォーマット
  formatTime: (date: Date): string => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },
  
  // 日時フォーマット
  formatDateTime: (date: Date): string => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },
  
  // 相対時間フォーマット
  formatRelativeTime: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'たった今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 30) return `${diffDays}日前`;
    
    return DATE_FORMATTER.formatDate(date);
  },
  
  // 期間フォーマット
  formatDuration: (durationMs: number): string => {
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}日間`;
    if (hours > 0) return `${hours}時間`;
    if (minutes > 0) return `${minutes}分間`;
    return `${seconds}秒間`;
  },
} as const;
```

## Data Models

### 翻訳対象コンポーネントの分類

#### 1. ページレベルコンポーネント

```typescript
// 翻訳が必要なページコンポーネント
interface PageLocalization {
  title: string;           // ページタイトル
  description?: string;    // ページ説明
  breadcrumbs?: Array<{   // パンくずリスト
    label: string;
    href?: string;
  }>;
}

// 例: DevicesPage
const DEVICES_PAGE_LOCALIZATION: PageLocalization = {
  title: BUSINESS_TERMS.DEVICES,
  description: `システムの${BUSINESS_TERMS.DEVICES}を管理します`,
  breadcrumbs: [
    { label: BUSINESS_TERMS.DEVICES, href: '/devices' }
  ],
};
```

#### 2. フォームコンポーネント

```typescript
// フォームフィールドの翻訳定義
interface FormFieldLocalization {
  label: string;
  placeholder?: string;
  helpText?: string;
  validation?: {
    required?: string;
    maxLength?: string;
    minLength?: string;
    pattern?: string;
  };
}

// 例: UserForm
const USER_FORM_LOCALIZATION = {
  id: {
    label: '従業員ID',
    placeholder: '例: EMP001',
    helpText: '英数字10文字以内で入力してください',
    validation: {
      required: VALIDATION_MESSAGES.REQUIRED('従業員ID'),
      maxLength: VALIDATION_MESSAGES.MAX_LENGTH('従業員ID', 10),
    },
  },
  name: {
    label: '名前',
    placeholder: '例: 田中太郎',
    validation: {
      required: VALIDATION_MESSAGES.REQUIRED('名前'),
      maxLength: VALIDATION_MESSAGES.MAX_LENGTH('名前', 100),
    },
  },
  role: {
    label: 'ロール',
    helpText: 'ユーザーの権限レベルを選択してください',
  },
} as const;
```

#### 3. テーブルコンポーネント

```typescript
// テーブルカラムの翻訳定義
interface TableColumnLocalization {
  header: string;
  searchPlaceholder?: string;
  sortLabel?: string;
}

// 例: UserColumns
const USER_TABLE_LOCALIZATION = {
  id: {
    header: TECHNICAL_TERMS.ID,
    sortLabel: `${TECHNICAL_TERMS.ID}でソート`,
  },
  name: {
    header: '名前',
    searchPlaceholder: 'ユーザー名で検索...',
    sortLabel: '名前でソート',
  },
  role: {
    header: 'ロール',
    sortLabel: 'ロールでソート',
  },
  actions: {
    header: 'アクション',
  },
} as const;
```

### ナビゲーション翻訳マッピング

```typescript
// サイドバーナビゲーションの翻訳
export const NAVIGATION_LABELS = {
  DEVICES: BUSINESS_TERMS.DEVICES,
  CLASSIFICATIONS: BUSINESS_TERMS.CLASSIFICATIONS,
  PLCS: BUSINESS_TERMS.PLCS,
  ALARM_GROUPS: 'アラームグループ',
  TIME_TABLE: 'タイムテーブル',
  CUSTOMERS: BUSINESS_TERMS.CUSTOMERS,
  PRODUCTS: BUSINESS_TERMS.PRODUCTS,
  USERS: BUSINESS_TERMS.USERS,
  GROUPS: BUSINESS_TERMS.GROUPS,
  DATA_DOWNLOAD: 'データダウンロード',
  LOGGING_SETTINGS: 'ロギング設定',
  EFFICIENCY_SETTINGS: '効率性設定',
  IO_SETTINGS: 'IO設定',
  QUALITY_CONTROL_SIGNALS: '品質管理シグナル',
} as const;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 技術用語の英語表記維持

*For any* UI要素において技術用語（IP Address、MAC Address、JSON、API、URLなど）が表示される場合、システムは定義された英語表記を維持する
**Validates: Requirements 1.1, 10.1, 10.2, 10.3, 10.4, 10.5**

### Property 2: 業務用語の日本語翻訳一貫性

*For any* UI要素において業務用語（Device、User、Group、Product、Customerなど）が表示される場合、システムは定義された日本語翻訳マッピングに従って一貫した日本語を使用する
**Validates: Requirements 1.2, 12.1**

### Property 3: アクションラベルの日本語化

*For any* アクションボタンやメニュー項目において、システムは定義されたアクションラベル翻訳に従って日本語を使用する
**Validates: Requirements 1.3, 6.1**

### Property 4: ページタイトルとナビゲーションの日本語統一

*For any* ページタイトル、サイドバーナビゲーション、パンくずリストにおいて、システムは統一された日本語ラベルを使用する
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 5: テーブル要素の日本語化

*For any* データテーブルのカラムヘッダー、検索プレースホルダー、ソート指示、ページネーション情報において、システムは適切な日本語を使用する
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 6: フォーム要素の日本語化

*For any* フォームフィールドのラベル、プレースホルダー、必須フィールド指示、選択肢において、システムは適切な日本語を使用する
**Validates: Requirements 4.1, 4.2, 4.3, 4.5**

### Property 7: バリデーションメッセージの日本語形式

*For any* フォームバリデーションエラーにおいて、システムは定義されたメッセージテンプレートに従って適切な日本語形式のエラーメッセージを表示する
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 8: 削除確認ダイアログの日本語警告

*For any* 削除確認ダイアログにおいて、システムは「この操作は取り消せません」などの適切な日本語警告メッセージを表示する
**Validates: Requirements 6.3**

### Property 9: 成功・ローディングメッセージの日本語形式

*For any* 成功通知やローディング状態において、システムは定義されたメッセージフォーマッターに従って適切な日本語メッセージを表示する
**Validates: Requirements 6.4, 6.5**

### Property 10: ステータス表示の日本語化

*For any* ユーザーロール、デバイスステータス、処理ステータス、分類・カテゴリ、数値・統計情報において、システムは定義された日本語ステータスラベルを使用する
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 11: エラーメッセージの日本語化

*For any* APIエラー、ネットワークエラー、権限エラー、成功通知、警告メッセージにおいて、システムは適切な日本語メッセージを表示する
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 12: 日付・時刻表示の日本形式

*For any* 日付、時刻、相対時間、期間、タイムゾーン情報において、システムは定義された日本形式のフォーマッターを使用する
**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 13: 注意事項とヘルプテキストの日本語化

*For any* 注意事項やヘルプテキストにおいて、システムは適切な日本語を使用する
**Validates: Requirements 11.4**

### Property 14: 用語使用の一貫性

*For any* 階層表現、動詞形、状態表現において、システムは統一された日本語パターンを使用する
**Validates: Requirements 12.2, 12.3, 12.4**

## Error Handling

### 翻訳エラーの処理

```typescript
// 翻訳キーが見つからない場合のフォールバック
export const getTranslation = (key: string, fallback?: string): string => {
  const translation = TRANSLATIONS[key];
  if (!translation) {
    console.warn(`Translation key not found: ${key}`);
    return fallback || key;
  }
  return translation;
};

// 動的メッセージ生成時のエラーハンドリング
export const formatMessage = (
  template: (param: string) => string,
  param: string
): string => {
  try {
    return template(param);
  } catch (error) {
    console.error('Message formatting error:', error);
    return `メッセージの生成に失敗しました: ${param}`;
  }
};
```

### バリデーションメッセージのエラーハンドリング

```typescript
// バリデーションメッセージ生成の安全な実装
export const getValidationMessage = (
  type: keyof typeof VALIDATION_MESSAGES,
  ...args: any[]
): string => {
  try {
    const messageGenerator = VALIDATION_MESSAGES[type];
    if (typeof messageGenerator === 'function') {
      return messageGenerator(...args);
    }
    return messageGenerator || '入力エラーが発生しました';
  } catch (error) {
    console.error('Validation message generation error:', error);
    return '入力内容を確認してください';
  }
};
```

## Testing Strategy

### Unit Testing

各翻訳関数とコンポーネントの単体テストを実装します。

**テスト対象:**
- 翻訳定数の正確性
- メッセージフォーマット関数の動作
- 日付・時刻フォーマット関数の出力
- コンポーネントでの翻訳適用

**テストツール:**
- Jest
- React Testing Library

**例:**

```typescript
// localization/utils/__tests__/message-formatter.test.ts
describe('MESSAGE_FORMATTER', () => {
  it('should format success create message correctly', () => {
    const result = MESSAGE_FORMATTER.SUCCESS_CREATE('ユーザー');
    expect(result).toBe('ユーザーを作成しました');
  });

  it('should format validation required message correctly', () => {
    const result = VALIDATION_MESSAGES.REQUIRED('名前');
    expect(result).toBe('名前は必須です');
  });

  it('should format date in Japanese format', () => {
    const date = new Date('2023-12-25T10:30:00');
    const result = DATE_FORMATTER.formatDate(date);
    expect(result).toBe('2023/12/25');
  });
});
```

### Property-Based Testing

翻訳の一貫性と正確性を検証するプロパティベーステストを実装します。

**テストライブラリ:** fast-check

**プロパティテスト例:**

```typescript
// __tests__/localization-properties.test.ts
import fc from 'fast-check';

describe('Localization Properties', () => {
  it('Property 1: Technical terms maintain English notation', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.keys(TECHNICAL_TERMS)),
      (termKey) => {
        const term = TECHNICAL_TERMS[termKey as keyof typeof TECHNICAL_TERMS];
        // 技術用語は英語のパターンにマッチする
        expect(term).toMatch(/^[A-Za-z\s]+$/);
        // 日本語文字が含まれていない
        expect(term).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      }
    ));
  });

  it('Property 2: Business terms use consistent Japanese translation', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.keys(BUSINESS_TERMS)),
      (termKey) => {
        const term = BUSINESS_TERMS[termKey as keyof typeof BUSINESS_TERMS];
        // 業務用語は日本語文字を含む
        expect(term).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
        // 同じ概念の用語は一貫している
        const relatedTerms = Object.entries(BUSINESS_TERMS)
          .filter(([key, value]) => key.includes(termKey.replace(/S$/, '')) || termKey.includes(key.replace(/S$/, '')))
          .map(([, value]) => value);
        
        if (relatedTerms.length > 1) {
          // 単数形と複数形で同じ翻訳を使用
          expect(new Set(relatedTerms).size).toBeLessThanOrEqual(1);
        }
      }
    ));
  });

  it('Property 7: Validation messages follow Japanese format', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\w]/.test(s)),
      fc.integer({ min: 1, max: 1000 }),
      (fieldName, maxLength) => {
        const message = VALIDATION_MESSAGES.MAX_LENGTH(fieldName, maxLength);
        // 正しい日本語形式のパターンにマッチ
        expect(message).toMatch(new RegExp(`${fieldName}は${maxLength}文字以内で入力してください`));
        // 日本語の丁寧語形式
        expect(message).toMatch(/ください$/);
      }
    ));
  });

  it('Property 12: Date formatting uses Japanese format', () => {
    fc.assert(fc.property(
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      (date) => {
        const formatted = DATE_FORMATTER.formatDate(date);
        // 日本の日付形式 YYYY/MM/DD にマッチ
        expect(formatted).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
        
        const relativeTime = DATE_FORMATTER.formatRelativeTime(date);
        if (relativeTime !== formatted && relativeTime !== 'たった今') {
          // 相対時間は日本語形式
          expect(relativeTime).toMatch(/(分前|時間前|日前)$/);
        }
      }
    ));
  });
});
```

### Integration Testing

ページレベルでの翻訳統合テストを実装します。

**テスト対象:**
- ページ全体の翻訳適用
- ナビゲーション要素の翻訳
- フォームとテーブルの翻訳
- エラーメッセージの表示

**例:**

```typescript
// pages/__tests__/users-page-localization.test.tsx
describe('UsersPage Localization', () => {
  it('should display all elements in Japanese', async () => {
    render(<UsersPage />);
    
    // ページタイトルが日本語
    expect(screen.getByText('ユーザー')).toBeInTheDocument();
    
    // アクションボタンが日本語
    expect(screen.getByText('新規作成')).toBeInTheDocument();
    
    // テーブルヘッダーが適切に翻訳されている
    expect(screen.getByText('名前')).toBeInTheDocument();
    expect(screen.getByText('ロール')).toBeInTheDocument();
    expect(screen.getByText('アクション')).toBeInTheDocument();
    
    // 検索プレースホルダーが日本語
    const searchInput = screen.getByPlaceholderText('ユーザー名で検索...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should show Japanese error messages on API failure', async () => {
    // APIエラーをモック
    jest.spyOn(api, 'getUsers').mockRejectedValue(new Error('Network error'));
    
    render(<UsersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('ユーザーの取得に失敗しました')).toBeInTheDocument();
    });
  });
});
```

### Visual Regression Testing

翻訳後のUIの視覚的確認を行います。

**テストツール:**
- Storybook
- Chromatic または Percy

**対象:**
- 翻訳後のすべてのページ
- 各種ダイアログとモーダル
- エラー状態とローディング状態
- 異なる画面サイズでの表示

## Implementation Strategy

### Phase 1: 翻訳基盤の構築

1. 翻訳定数ファイルの作成
2. メッセージフォーマット関数の実装
3. 日付・時刻フォーマット関数の実装
4. 翻訳ユーティリティ関数の実装

### Phase 2: 共通コンポーネントの翻訳

1. PageHeaderコンポーネントの翻訳対応
2. DataTableコンポーネントの翻訳対応
3. FormWrapperコンポーネントの翻訳対応
4. ActionButtonsコンポーネントの翻訳対応
5. ConfirmationDialogコンポーネントの翻訳対応

### Phase 3: ページ単位での翻訳適用

1. ナビゲーション（Sidebar）の翻訳
2. 各ページコンポーネントの翻訳
3. フォームコンポーネントの翻訳
4. テーブルカラム定義の翻訳

### Phase 4: エラーハンドリングとメッセージの翻訳

1. API エラーメッセージの翻訳
2. バリデーションメッセージの翻訳
3. トースト通知の翻訳
4. ローディング状態の翻訳

### Phase 5: テストとQA

1. 翻訳プロパティテストの実装
2. 統合テストの実行
3. 視覚的回帰テストの実行
4. 翻訳品質の確認

## Migration Guidelines

### 既存コンポーネントの翻訳手順

1. **翻訳対象の特定**
   ```typescript
   // 翻訳前
   <PageHeader title="Users" description="Manage users in the system" />
   
   // 翻訳後
   <PageHeader 
     title={BUSINESS_TERMS.USERS} 
     description={`システムの${BUSINESS_TERMS.USERS}を管理します`} 
   />
   ```

2. **アクションボタンの翻訳**
   ```typescript
   // 翻訳前
   <Button>Create New User</Button>
   
   // 翻訳後
   <Button>{ACTION_LABELS.CREATE_NEW}{BUSINESS_TERMS.USER}</Button>
   ```

3. **バリデーションメッセージの翻訳**
   ```typescript
   // 翻訳前
   name: z.string().min(1, "Name is required")
   
   // 翻訳後
   name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED("名前"))
   ```

### 新規コンポーネント開発時の注意点

1. 翻訳定数を使用する
2. ハードコードされた文字列を避ける
3. メッセージフォーマッター関数を活用する
4. 技術用語と業務用語を適切に区別する

## Performance Considerations

### 翻訳データの最適化

1. **Tree Shaking**: 使用されない翻訳定数は自動的に除外
2. **Code Splitting**: ページ単位での翻訳データの分割
3. **Memoization**: フォーマット関数の結果をメモ化

```typescript
// メモ化されたメッセージフォーマット
export const memoizedFormatMessage = useMemo(() => {
  return MESSAGE_FORMATTER.SUCCESS_CREATE(entityName);
}, [entityName]);
```

### レンダリング最適化

1. **React.memo**: 翻訳されたコンポーネントのメモ化
2. **useMemo**: 翻訳結果のメモ化
3. **useCallback**: 翻訳関数のメモ化

## Accessibility

### 日本語アクセシビリティ

1. **適切な言語属性**: `<html lang="ja">`の設定
2. **読み上げ対応**: スクリーンリーダーでの自然な日本語読み上げ
3. **フォーカス管理**: 日本語UIでの適切なフォーカス順序

### 国際化対応の準備

将来的な多言語対応を考慮した設計：

```typescript
// 将来の国際化対応を考慮した構造
interface LocalizationConfig {
  locale: 'ja' | 'en';
  messages: Record<string, string>;
  dateFormat: Intl.DateTimeFormatOptions;
}
```

## Maintenance and Documentation

### 翻訳品質の維持

1. **翻訳ガイドライン**: 一貫した翻訳パターンの文書化
2. **用語集**: 技術用語と業務用語の定義
3. **レビュープロセス**: 翻訳品質のチェック体制

### 開発者向けドキュメント

```typescript
/**
 * 翻訳定数の使用例
 * 
 * @example
 * ```tsx
 * // 業務用語の使用
 * <PageHeader title={BUSINESS_TERMS.USERS} />
 * 
 * // アクションラベルの使用
 * <Button>{ACTION_LABELS.CREATE}</Button>
 * 
 * // バリデーションメッセージの使用
 * const schema = z.object({
 *   name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED("名前"))
 * });
 * ```
 */
```

## Conclusion

この設計により、RTMSフロントエンドアプリケーションは統一された日本語UIを提供し、日本のユーザーにとってより使いやすく、理解しやすいインターフェースを実現します。技術用語の適切な処理と業務用語の自然な日本語化により、国際標準に準拠しながらも日本のユーザーに最適化されたシステムとなります。