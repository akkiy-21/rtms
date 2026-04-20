# 開発者向け翻訳実装ガイド

## 概要

このガイドは、RTMSフロントエンドアプリケーションで新機能を開発する際の翻訳実装方法を説明します。実際のコード例と共に、効率的で一貫性のある翻訳実装を行うための実践的な手順を提供します。

## クイックスタート

### 1. 基本的な翻訳実装

**新しいページコンポーネントの作成例**:

```typescript
// ❌ 翻訳なしの実装
import React from 'react';
import { PageHeader } from '@/components/layout/page-header';

export const NewFeaturePage: React.FC = () => {
  return (
    <div>
      <PageHeader 
        title="New Feature" 
        description="Manage new features in the system" 
      />
      <button>Create New Item</button>
    </div>
  );
};

// ✅ 翻訳ありの実装
import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
import { ACTION_LABELS } from '@/localization/constants/action-labels';

export const NewFeaturePage: React.FC = () => {
  return (
    <div>
      <PageHeader 
        title={BUSINESS_TERMS.NEW_FEATURE} 
        description={`システムの${BUSINESS_TERMS.NEW_FEATURE}を管理します`} 
      />
      <button>{ACTION_LABELS.CREATE_NEW}アイテム</button>
    </div>
  );
};
```

### 2. フォームの翻訳実装

**Zodスキーマでのバリデーション翻訳**:

```typescript
import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/localization/constants/validation-messages';

// ❌ 翻訳なしの実装
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  age: z.number().min(0, "Age must be positive"),
});

// ✅ 翻訳ありの実装
const userSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED("名前")),
  email: z.string().email(VALIDATION_MESSAGES.INVALID_EMAIL()),
  age: z.number().min(0, VALIDATION_MESSAGES.MIN_VALUE("年齢", 0)),
});
```

### 3. テーブルカラムの翻訳実装

```typescript
import { ColumnDef } from '@tanstack/react-table';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
import { TECHNICAL_TERMS } from '@/localization/constants/technical-terms';

// ✅ 翻訳ありのカラム定義
export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: TECHNICAL_TERMS.ID,
  },
  {
    accessorKey: "name",
    header: "名前",
  },
  {
    accessorKey: "email",
    header: "メールアドレス",
  },
  {
    accessorKey: "role",
    header: "ロール",
  },
  {
    id: "actions",
    header: "アクション",
    cell: ({ row }) => <ActionButtons row={row} />,
  },
];
```

## 翻訳定数の使用方法

### 利用可能な翻訳定数

```typescript
// 技術用語（英語維持）
import { TECHNICAL_TERMS } from '@/localization/constants/technical-terms';
// 使用例: TECHNICAL_TERMS.IP_ADDRESS, TECHNICAL_TERMS.API

// 業務用語（日本語翻訳）
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
// 使用例: BUSINESS_TERMS.USER, BUSINESS_TERMS.DEVICE

// アクションラベル
import { ACTION_LABELS } from '@/localization/constants/action-labels';
// 使用例: ACTION_LABELS.CREATE, ACTION_LABELS.EDIT

// ステータスラベル
import { STATUS_LABELS } from '@/localization/constants/status-labels';
// 使用例: STATUS_LABELS.ONLINE, STATUS_LABELS.PROCESSING

// ナビゲーションラベル
import { NAVIGATION_LABELS } from '@/localization/constants/navigation-labels';
// 使用例: NAVIGATION_LABELS.USERS, NAVIGATION_LABELS.SETTINGS
```

### 翻訳定数の組み合わせ

```typescript
// ✅ 推奨パターン
const pageTitle = BUSINESS_TERMS.USERS; // "ユーザー"
const createButtonLabel = `${ACTION_LABELS.CREATE_NEW}${BUSINESS_TERMS.USER}`; // "新規作成ユーザー"
const managementTitle = `${BUSINESS_TERMS.USER}${BUSINESS_TERMS.MANAGEMENT}`; // "ユーザー管理"

// ✅ 説明文の作成
const pageDescription = `システムの${BUSINESS_TERMS.USERS}を管理します`;
```

## メッセージフォーマッターの使用

### 基本的な使用方法

```typescript
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';

// 成功メッセージ
const successMessage = MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER);
// "ユーザーを作成しました"

// エラーメッセージ
const errorMessage = MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.DEVICE);
// "デバイスの取得に失敗しました"

// 確認メッセージ
const confirmMessage = MESSAGE_FORMATTER.CONFIRM_DELETE(BUSINESS_TERMS.PRODUCT);
// "この製品を削除してもよろしいですか？この操作は取り消せません。"
```

### API呼び出しでの使用例

```typescript
import { toast } from '@/hooks/use-toast';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';

const handleCreateUser = async (userData: CreateUserRequest) => {
  try {
    // ローディング表示
    toast.info(MESSAGE_FORMATTER.CREATING());
    
    await createUser(userData);
    
    // 成功メッセージ
    toast.success(MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER));
    
  } catch (error) {
    // エラーメッセージ
    toast.error(MESSAGE_FORMATTER.ERROR_CREATE(BUSINESS_TERMS.USER));
  }
};

const handleDeleteUser = async (userId: string) => {
  // 確認ダイアログ
  const confirmed = window.confirm(
    MESSAGE_FORMATTER.CONFIRM_DELETE(BUSINESS_TERMS.USER)
  );
  
  if (!confirmed) return;
  
  try {
    toast.info(MESSAGE_FORMATTER.DELETING());
    await deleteUser(userId);
    toast.success(MESSAGE_FORMATTER.SUCCESS_DELETE(BUSINESS_TERMS.USER));
  } catch (error) {
    toast.error(MESSAGE_FORMATTER.ERROR_DELETE(BUSINESS_TERMS.USER));
  }
};
```

## 日付・時刻フォーマッターの使用

### 基本的な使用方法

```typescript
import { DATE_FORMATTER } from '@/localization/utils/date-formatter';

const now = new Date();

// 日付表示
const dateStr = DATE_FORMATTER.formatDate(now); // "2023/12/25"
const dateLongStr = DATE_FORMATTER.formatDateLong(now); // "2023年12月25日"

// 時刻表示
const timeStr = DATE_FORMATTER.formatTime(now); // "14:30"
const timeWithSecondsStr = DATE_FORMATTER.formatTimeWithSeconds(now); // "14:30:45"

// 日時表示
const dateTimeStr = DATE_FORMATTER.formatDateTime(now); // "2023/12/25 14:30:45"

// 相対時間表示
const relativeTimeStr = DATE_FORMATTER.formatRelativeTime(pastDate); // "5分前"

// 期間表示
const durationStr = DATE_FORMATTER.formatDuration(3600000); // "1時間"
```

### テーブルでの日付表示例

```typescript
export const dataColumns: ColumnDef<DataItem>[] = [
  {
    accessorKey: "createdAt",
    header: "作成日時",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return DATE_FORMATTER.formatDateTime(date);
    },
  },
  {
    accessorKey: "updatedAt",
    header: "更新日時",
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
      return DATE_FORMATTER.formatRelativeTime(date);
    },
  },
];
```

## 新しい翻訳定数の追加

### 手順

1. **適切なファイルを特定**:
   - 技術用語 → `technical-terms.ts`
   - 業務用語 → `business-terms.ts`
   - アクション → `action-labels.ts`
   - ステータス → `status-labels.ts`
   - ナビゲーション → `navigation-labels.ts`

2. **定数を追加**:

```typescript
// frontend/src/localization/constants/business-terms.ts
export const BUSINESS_TERMS = {
  // 既存の定数...
  
  // 新しい業務用語を追加
  REPORT: 'レポート',
  REPORTS: 'レポート',
  ANALYTICS: '分析',
  DASHBOARD: 'ダッシュボード',
} as const;
```

3. **ナビゲーションラベルに追加**（必要に応じて）:

```typescript
// frontend/src/localization/constants/navigation-labels.ts
export const NAVIGATION_LABELS = {
  // 既存のラベル...
  
  // 新しいナビゲーションラベルを追加
  REPORTS: BUSINESS_TERMS.REPORTS,
  ANALYTICS: BUSINESS_TERMS.ANALYTICS,
  DASHBOARD: BUSINESS_TERMS.DASHBOARD,
} as const;
```

4. **使用箇所で適用**:

```typescript
// 新しいページコンポーネント
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';

export const ReportsPage: React.FC = () => {
  return (
    <PageHeader 
      title={BUSINESS_TERMS.REPORTS}
      description={`システムの${BUSINESS_TERMS.REPORTS}を表示します`}
    />
  );
};
```

## フォーム実装のベストプラクティス

### React Hook Formとの組み合わせ

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/localization/constants/validation-messages';

// スキーマ定義
const deviceSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED("デバイス名")),
  ipAddress: z.string().ip(VALIDATION_MESSAGES.INVALID_IP_ADDRESS()),
  port: z.number().min(1).max(65535, VALIDATION_MESSAGES.INVALID_RANGE(1, 65535)),
  description: z.string().max(500, VALIDATION_MESSAGES.MAX_LENGTH("説明", 500)).optional(),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

export const DeviceForm: React.FC = () => {
  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>デバイス名</FormLabel>
            <FormControl>
              <Input placeholder="例: Device001" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="ipAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{TECHNICAL_TERMS.IP_ADDRESS}</FormLabel>
            <FormControl>
              <Input placeholder="例: 192.168.1.100" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
};
```

### 選択肢の翻訳

```typescript
import { STATUS_LABELS } from '@/localization/constants/status-labels';

// ステータス選択肢の定義
const statusOptions = [
  { value: 'active', label: STATUS_LABELS.ACTIVE },
  { value: 'inactive', label: STATUS_LABELS.INACTIVE },
  { value: 'pending', label: STATUS_LABELS.PENDING },
];

// ユーザーロール選択肢の定義
const roleOptions = [
  { value: 'super_user', label: STATUS_LABELS.SUPER_USER },
  { value: 'admin', label: STATUS_LABELS.ADMIN_USER },
  { value: 'user', label: STATUS_LABELS.COMMON_USER },
];
```

## エラーハンドリングの実装

### APIエラーの翻訳

```typescript
import { useApiError } from '@/hooks/use-api-error';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';

export const useUserOperations = () => {
  const { handleApiError } = useApiError();

  const createUser = async (userData: CreateUserRequest) => {
    try {
      const result = await api.createUser(userData);
      toast.success(MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER));
      return result;
    } catch (error) {
      handleApiError(error, {
        defaultMessage: MESSAGE_FORMATTER.ERROR_CREATE(BUSINESS_TERMS.USER),
        context: 'user_creation',
      });
      throw error;
    }
  };

  const fetchUsers = async () => {
    try {
      return await api.getUsers();
    } catch (error) {
      handleApiError(error, {
        defaultMessage: MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.USERS),
        context: 'user_fetch',
      });
      throw error;
    }
  };

  return { createUser, fetchUsers };
};
```

### カスタムエラーメッセージ

```typescript
// 特定のエラーケースに対するカスタムメッセージ
const handleSpecificError = (error: ApiError) => {
  switch (error.code) {
    case 'DUPLICATE_EMAIL':
      return VALIDATION_MESSAGES.ALREADY_EXISTS('メールアドレス');
    case 'INVALID_CREDENTIALS':
      return 'ユーザー名またはパスワードが正しくありません';
    case 'ACCOUNT_LOCKED':
      return 'アカウントがロックされています。管理者にお問い合わせください';
    default:
      return MESSAGE_FORMATTER.ERROR_UNKNOWN();
  }
};
```

## テスト実装

### 翻訳の単体テスト

```typescript
// __tests__/translation.test.ts
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';
import { DATE_FORMATTER } from '@/localization/utils/date-formatter';

describe('翻訳定数', () => {
  it('業務用語が適切に定義されている', () => {
    expect(BUSINESS_TERMS.USER).toBe('ユーザー');
    expect(BUSINESS_TERMS.DEVICE).toBe('デバイス');
    expect(BUSINESS_TERMS.SETTINGS).toBe('設定');
  });
});

describe('メッセージフォーマッター', () => {
  it('成功メッセージが正しくフォーマットされる', () => {
    const message = MESSAGE_FORMATTER.SUCCESS_CREATE('テストエンティティ');
    expect(message).toBe('テストエンティティを作成しました');
  });

  it('エラーメッセージが正しくフォーマットされる', () => {
    const message = MESSAGE_FORMATTER.ERROR_FETCH('テストデータ');
    expect(message).toBe('テストデータの取得に失敗しました');
  });
});

describe('日付フォーマッター', () => {
  it('日付が正しい形式でフォーマットされる', () => {
    const date = new Date('2023-12-25T10:30:00');
    expect(DATE_FORMATTER.formatDate(date)).toBe('2023/12/25');
    expect(DATE_FORMATTER.formatTime(date)).toBe('10:30');
  });
});
```

### コンポーネントの翻訳テスト

```typescript
// __tests__/UserPage.test.tsx
import { render, screen } from '@testing-library/react';
import { UserPage } from '@/pages/UserPage';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
import { ACTION_LABELS } from '@/localization/constants/action-labels';

describe('UserPage', () => {
  it('日本語でページタイトルが表示される', () => {
    render(<UserPage />);
    expect(screen.getByText(BUSINESS_TERMS.USERS)).toBeInTheDocument();
  });

  it('アクションボタンが日本語で表示される', () => {
    render(<UserPage />);
    expect(screen.getByText(ACTION_LABELS.CREATE_NEW)).toBeInTheDocument();
  });

  it('テーブルヘッダーが日本語で表示される', () => {
    render(<UserPage />);
    expect(screen.getByText('名前')).toBeInTheDocument();
    expect(screen.getByText('ロール')).toBeInTheDocument();
    expect(screen.getByText('アクション')).toBeInTheDocument();
  });
});
```

## パフォーマンス最適化

### 翻訳定数のメモ化

```typescript
import { useMemo } from 'react';
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

export const UserManagementPage: React.FC = () => {
  // 静的な翻訳は直接使用
  const pageTitle = BUSINESS_TERMS.USERS;
  
  // 動的な翻訳はメモ化
  const successMessage = useMemo(
    () => MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER),
    []
  );

  const pageDescription = useMemo(
    () => `システムの${BUSINESS_TERMS.USERS}を管理します`,
    []
  );

  return (
    <PageHeader 
      title={pageTitle}
      description={pageDescription}
    />
  );
};
```

### 条件付き翻訳のメモ化

```typescript
import { useMemo } from 'react';
import { STATUS_LABELS } from '@/localization/constants/status-labels';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'error';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusLabel = useMemo(() => {
    switch (status) {
      case 'online':
        return STATUS_LABELS.ONLINE;
      case 'offline':
        return STATUS_LABELS.OFFLINE;
      case 'error':
        return STATUS_LABELS.ERROR;
      default:
        return STATUS_LABELS.UNKNOWN;
    }
  }, [status]);

  return <Badge variant={status}>{statusLabel}</Badge>;
};
```

## デバッグとトラブルシューティング

### 翻訳定数の確認

```typescript
// 開発環境でのデバッグ用ヘルパー
export const debugTranslation = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('翻訳定数の確認');
    console.log('業務用語:', BUSINESS_TERMS);
    console.log('アクションラベル:', ACTION_LABELS);
    console.log('ステータスラベル:', STATUS_LABELS);
    console.groupEnd();
  }
};

// 使用例
debugTranslation();
```

### 翻訳の動的確認

```typescript
// 翻訳定数の存在確認
const checkTranslationExists = (category: string, key: string) => {
  const translations = {
    business: BUSINESS_TERMS,
    action: ACTION_LABELS,
    status: STATUS_LABELS,
    technical: TECHNICAL_TERMS,
  };

  const translation = translations[category]?.[key];
  if (!translation) {
    console.warn(`翻訳が見つかりません: ${category}.${key}`);
    return key; // フォールバック
  }
  return translation;
};
```

## まとめ

このガイドに従うことで、RTMSフロントエンドアプリケーションにおいて一貫性のある翻訳実装を効率的に行うことができます。

### 重要なポイント

1. **翻訳定数を必ず使用する** - ハードコードされた文字列は避ける
2. **適切なフォーマッター関数を使用する** - 動的メッセージには専用の関数を使用
3. **技術用語と業務用語を適切に分類する** - 英語維持と日本語翻訳を正しく使い分ける
4. **テストで翻訳を確認する** - 翻訳が正しく適用されていることを検証
5. **パフォーマンスを考慮する** - 必要に応じてメモ化を使用

### 次のステップ

- 新機能開発時はこのガイドを参照
- 翻訳品質テストを定期的に実行
- ユーザーフィードバックに基づく翻訳改善
- チーム内での翻訳レビュープロセスの確立