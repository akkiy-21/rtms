# 翻訳実装ガイド

このドキュメントは、RTMSフロントエンドアプリケーションの翻訳システムの実装方法と使用例を説明します。

## 目次

1. [翻訳システムの概要](#翻訳システムの概要)
2. [翻訳定数の使用方法](#翻訳定数の使用方法)
3. [メッセージフォーマット関数の使用方法](#メッセージフォーマット関数の使用方法)
4. [バリデーションメッセージの実装](#バリデーションメッセージの実装)
5. [日付・時刻フォーマットの使用方法](#日付時刻フォーマットの使用方法)
6. [コンポーネントでの実装例](#コンポーネントでの実装例)
7. [新機能開発時のガイドライン](#新機能開発時のガイドライン)
8. [トラブルシューティング](#トラブルシューティング)

## 翻訳システムの概要

RTMSの翻訳システムは以下の構造で構成されています：

```
frontend/src/localization/
├── constants/          # 翻訳定数ファイル
│   ├── technical-terms.ts      # 技術用語（英語維持）
│   ├── business-terms.ts       # 業務用語（日本語翻訳）
│   ├── action-labels.ts        # アクションラベル
│   ├── status-labels.ts        # ステータス表示
│   ├── validation-messages.ts  # バリデーションメッセージ
│   └── [feature]-labels.ts     # 機能別ラベル
├── utils/              # ユーティリティ関数
│   ├── message-formatter.ts    # メッセージフォーマット
│   ├── date-formatter.ts       # 日付・時刻フォーマット
│   └── term-validator.ts       # 用語検証
└── types/              # 型定義
    └── localization.types.ts
```

### インポート方法

```typescript
// 全ての翻訳定数とユーティリティをインポート
import { 
  TECHNICAL_TERMS, 
  BUSINESS_TERMS, 
  ACTION_LABELS,
  MESSAGE_FORMATTER,
  DATE_FORMATTER 
} from '@/localization';

// 個別にインポート
import { USER_LABELS } from '@/localization/constants/user-labels';
import { VALIDATION_MESSAGES } from '@/localization/constants/validation-messages';
```

## 翻訳定数の使用方法

### 1. 技術用語（英語維持）

国際標準の技術用語は英語表記を維持します。

```typescript
import { TECHNICAL_TERMS } from '@/localization/constants/technical-terms';

// 使用例
<FormLabel>{TECHNICAL_TERMS.IP_ADDRESS}</FormLabel>
// 出力: "IP Address"

<TableHeader>{TECHNICAL_TERMS.API}</TableHeader>
// 出力: "API"

<Input placeholder={`例: 192.168.1.1 (${TECHNICAL_TERMS.IP_ADDRESS})`} />
// 出力: "例: 192.168.1.1 (IP Address)"
```

**利用可能な技術用語：**
- `IP_ADDRESS`, `MAC_ADDRESS`, `URL`, `API`, `PORT`
- `HTTP`, `HTTPS`, `MQTT`, `TCP`, `UDP`
- `JSON`, `XML`, `CSV`, `ID`, `UUID`
- `PLC`, `IO` など

### 2. 業務用語（日本語翻訳）

システム固有の業務用語は日本語に翻訳します。

```typescript
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';

// 使用例
<PageTitle>{BUSINESS_TERMS.USERS}</PageTitle>
// 出力: "ユーザー"

<Button>{ACTION_LABELS.CREATE_NEW}{BUSINESS_TERMS.DEVICE}</Button>
// 出力: "新規作成デバイス"

const description = `システムの${BUSINESS_TERMS.DEVICES}を管理します`;
// 出力: "システムのデバイスを管理します"
```

**利用可能な業務用語：**
- エンティティ: `DEVICE`, `USER`, `GROUP`, `PRODUCT`, `CUSTOMER`
- 設定: `SETTINGS`, `CONFIGURATION`, `MANAGEMENT`
- データ: `DATA`, `INFORMATION`, `DETAILS`, `RECORD`

### 3. アクションラベル

ボタンやメニューのアクションラベルを統一します。

```typescript
import { ACTION_LABELS } from '@/localization/constants/action-labels';

// 基本的なCRUD操作
<Button>{ACTION_LABELS.CREATE}</Button>          // "作成"
<Button>{ACTION_LABELS.EDIT}</Button>            // "編集"
<Button>{ACTION_LABELS.DELETE}</Button>          // "削除"
<Button>{ACTION_LABELS.SAVE}</Button>            // "保存"
<Button>{ACTION_LABELS.CANCEL}</Button>          // "キャンセル"

// データ操作
<Button>{ACTION_LABELS.SEARCH}</Button>          // "検索"
<Button>{ACTION_LABELS.FILTER}</Button>          // "フィルター"
<Button>{ACTION_LABELS.DOWNLOAD}</Button>        // "ダウンロード"
<Button>{ACTION_LABELS.IMPORT}</Button>          // "インポート"

// 組み合わせ例
<Button>{ACTION_LABELS.CREATE_NEW} {BUSINESS_TERMS.USER}</Button>
// 出力: "新規作成 ユーザー"
```

### 4. ステータス表示

ステータスやバッジの表示を統一します。

```typescript
import { STATUS_LABELS } from '@/localization/constants/status-labels';

// ユーザーロール
const getRoleLabel = (role: string) => {
  const roleMap = {
    'SU': STATUS_LABELS.SUPER_USER,     // "スーパーユーザー"
    'AD': STATUS_LABELS.ADMIN_USER,     // "管理者"
    'CU': STATUS_LABELS.COMMON_USER,    // "一般ユーザー"
  };
  return roleMap[role] || role;
};

// デバイスステータス
const getDeviceStatus = (status: string) => {
  const statusMap = {
    'online': STATUS_LABELS.ONLINE,      // "オンライン"
    'offline': STATUS_LABELS.OFFLINE,    // "オフライン"
    'error': STATUS_LABELS.ERROR,        // "エラー"
  };
  return statusMap[status] || status;
};

// 使用例
<Badge>{getRoleLabel(user.role)}</Badge>
<StatusIndicator>{getDeviceStatus(device.status)}</StatusIndicator>
```

### 5. 機能別ラベル

各機能に特化したラベルを使用します。

```typescript
import { USER_LABELS } from '@/localization/constants/user-labels';
import { DEVICE_LABELS } from '@/localization/constants/device-labels';

// ユーザー関連
<FormLabel>{USER_LABELS.FORM.EMPLOYEE_ID}</FormLabel>     // "従業員ID"
<FormLabel>{USER_LABELS.FORM.NAME}</FormLabel>            // "名前"
<FormLabel>{USER_LABELS.FORM.ROLE}</FormLabel>            // "ロール"

// デバイス関連
<FormLabel>{DEVICE_LABELS.FORM.DEVICE_NAME}</FormLabel>   // "デバイス名"
<FormLabel>{DEVICE_LABELS.FORM.IP_ADDRESS}</FormLabel>    // "IP Address"
<FormLabel>{DEVICE_LABELS.FORM.PORT}</FormLabel>          // "Port"

// テーブルヘッダー
<TableHeader>{USER_LABELS.TABLE.HEADERS.NAME}</TableHeader>
<TableHeader>{DEVICE_LABELS.TABLE.HEADERS.STATUS}</TableHeader>
```

## メッセージフォーマット関数の使用方法

### 1. 基本的な使用方法

```typescript
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

// 成功メッセージ
const successMessage = MESSAGE_FORMATTER.SUCCESS_CREATE('ユーザー');
// 出力: "ユーザーを作成しました"

const updateMessage = MESSAGE_FORMATTER.SUCCESS_UPDATE('デバイス');
// 出力: "デバイスを更新しました"

// エラーメッセージ
const errorMessage = MESSAGE_FORMATTER.ERROR_FETCH('データ');
// 出力: "データの取得に失敗しました"

const networkError = MESSAGE_FORMATTER.ERROR_NETWORK();
// 出力: "接続に問題があります。しばらく待ってから再試行してください"
```

### 2. ヘルパー関数の使用

```typescript
import { 
  createEntityMessage, 
  createMultipleDeleteMessage,
  createFileMessage 
} from '@/localization/utils/message-formatter';

// エンティティメッセージの生成
const message1 = createEntityMessage('success_create', 'ユーザー');
// 出力: "ユーザーを作成しました"

const message2 = createEntityMessage('error_delete', 'デバイス');
// 出力: "デバイスの削除に失敗しました"

// 複数削除確認メッセージ
const deleteMessage = createMultipleDeleteMessage(5, 'ユーザー');
// 出力: "選択した5件のユーザーを削除してもよろしいですか？この操作は取り消せません。"

// ファイル関連メッセージ
const fileMessage = createFileMessage('confirm_overwrite', 'data.csv');
// 出力: "ファイル「data.csv」は既に存在します。上書きしてもよろしいですか？"
```

### 3. React コンポーネントでの使用例

```typescript
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { MESSAGE_FORMATTER, BUSINESS_TERMS } from '@/localization';

const UserManagement: React.FC = () => {
  const handleCreateUser = async (userData: UserData) => {
    try {
      await createUser(userData);
      toast({
        title: MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER),
        variant: "default",
      });
    } catch (error) {
      toast({
        title: MESSAGE_FORMATTER.ERROR_CREATE(BUSINESS_TERMS.USER),
        description: MESSAGE_FORMATTER.ERROR_NETWORK(),
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = (userName: string) => {
    const confirmMessage = MESSAGE_FORMATTER.CONFIRM_DELETE(
      `${BUSINESS_TERMS.USER}「${userName}」`
    );
    
    if (window.confirm(confirmMessage)) {
      handleDeleteUser();
    }
  };

  return (
    <div>
      {/* コンポーネントの実装 */}
    </div>
  );
};
```

### 4. ローディング状態での使用

```typescript
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const [loading, setLoading] = useState(false);
const [loadingMessage, setLoadingMessage] = useState('');

const fetchUsers = async () => {
  setLoading(true);
  setLoadingMessage(MESSAGE_FORMATTER.LOADING_DATA(BUSINESS_TERMS.USERS));
  // 出力: "ユーザーを読み込み中..."
  
  try {
    const users = await api.getUsers();
    // 成功処理
  } catch (error) {
    toast({
      title: MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.USERS),
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

// ローディングコンポーネント
{loading && (
  <div className="flex items-center space-x-2">
    <Spinner />
    <span>{loadingMessage}</span>
  </div>
)}
```

## バリデーションメッセージの実装

### 1. Zodスキーマでの使用

```typescript
import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/localization/constants/validation-messages';

const userFormSchema = z.object({
  id: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED('従業員ID'))
    .max(10, VALIDATION_MESSAGES.MAX_LENGTH('従業員ID', 10)),
  
  name: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED('名前'))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH('名前', 100)),
  
  email: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED('メールアドレス'))
    .email(VALIDATION_MESSAGES.INVALID_EMAIL()),
  
  role: z.enum(['SU', 'AD', 'CU'], {
    required_error: VALIDATION_MESSAGES.SELECTION_REQUIRED('ロール'),
  }),
  
  password: z.string()
    .min(8, VALIDATION_MESSAGES.MIN_LENGTH('パスワード', 8))
    .optional(),
});
```

### 2. カスタムバリデーション

```typescript
import { VALIDATION_MESSAGES, getValidationMessage } from '@/localization/constants/validation-messages';

// IPアドレスのバリデーション
const validateIPAddress = (value: string): string | undefined => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(value)) {
    return VALIDATION_MESSAGES.INVALID_IP_ADDRESS();
  }
  return undefined;
};

// ポート番号のバリデーション
const validatePort = (value: number): string | undefined => {
  if (value < 1 || value > 65535) {
    return VALIDATION_MESSAGES.INVALID_RANGE(1, 65535);
  }
  return undefined;
};

// 安全なメッセージ生成
const safeValidationMessage = (key: string, ...args: any[]) => {
  return getValidationMessage(key as any, ...args);
};
```

### 3. プリセットメッセージの使用

```typescript
import { COMMON_VALIDATION_PRESETS } from '@/localization/constants/validation-messages';

const deviceFormSchema = z.object({
  name: z.string()
    .min(1, COMMON_VALIDATION_PRESETS.DEVICE_NAME_REQUIRED()),
  
  deviceId: z.string()
    .min(1, COMMON_VALIDATION_PRESETS.DEVICE_ID_REQUIRED()),
  
  ipAddress: z.string()
    .min(1, COMMON_VALIDATION_PRESETS.IP_ADDRESS_REQUIRED())
    .refine(validateIPAddress, COMMON_VALIDATION_PRESETS.IP_ADDRESS_INVALID()),
  
  port: z.number()
    .min(1, COMMON_VALIDATION_PRESETS.POSITIVE_NUMBER_REQUIRED())
    .max(65535, COMMON_VALIDATION_PRESETS.PORT_INVALID_RANGE()),
});
```

### 4. 動的バリデーションメッセージ

```typescript
// 関連フィールドのバリデーション
const validateDateRange = (startDate: Date, endDate: Date, startFieldName: string, endFieldName: string) => {
  if (endDate <= startDate) {
    return VALIDATION_MESSAGES.INVALID_DATE_RANGE(startFieldName, endFieldName);
    // 出力: "終了日は開始日より後の日付を入力してください"
  }
  return undefined;
};

// 重複チェック
const validateUniqueness = async (value: string, fieldName: string) => {
  const exists = await checkIfExists(value);
  if (exists) {
    return VALIDATION_MESSAGES.ALREADY_EXISTS(fieldName);
    // 出力: "このユーザーIDは既に使用されています"
  }
  return undefined;
};
```

## 日付・時刻フォーマットの使用方法

### 1. 基本的な日付・時刻フォーマット

```typescript
import { DATE_FORMATTER } from '@/localization/utils/date-formatter';

const now = new Date();

// 日付フォーマット
const dateStr = DATE_FORMATTER.formatDate(now);
// 出力: "2023/12/25"

const dateLongStr = DATE_FORMATTER.formatDateLong(now);
// 出力: "2023年12月25日"

// 時刻フォーマット
const timeStr = DATE_FORMATTER.formatTime(now);
// 出力: "14:30"

const timeWithSecondsStr = DATE_FORMATTER.formatTimeWithSeconds(now);
// 出力: "14:30:45"

// 日時フォーマット
const dateTimeStr = DATE_FORMATTER.formatDateTime(now);
// 出力: "2023/12/25 14:30:45"
```

### 2. 相対時間の表示

```typescript
// 相対時間フォーマット
const pastDate = new Date(Date.now() - 30 * 60 * 1000); // 30分前
const relativeTime = DATE_FORMATTER.formatRelativeTime(pastDate);
// 出力: "30分前"

const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2時間後
const futureRelativeTime = DATE_FORMATTER.formatRelativeTime(futureDate);
// 出力: "2時間後"

// コンポーネントでの使用例
const TimeDisplay: React.FC<{ timestamp: string }> = ({ timestamp }) => {
  const date = new Date(timestamp);
  const relativeTime = DATE_FORMATTER.formatRelativeTime(date);
  const fullDateTime = DATE_FORMATTER.formatDateTime(date);
  
  return (
    <span title={fullDateTime}>
      {relativeTime}
    </span>
  );
};
```

### 3. 期間の表示

```typescript
// 期間フォーマット
const duration = 2 * 60 * 60 * 1000 + 30 * 60 * 1000; // 2時間30分
const durationStr = DATE_FORMATTER.formatDuration(duration);
// 出力: "2時間"

const detailedDurationStr = DATE_FORMATTER.formatDurationDetailed(duration);
// 出力: "2時間30分"

// 営業日計算
const startDate = new Date('2023-12-25');
const endDate = new Date('2023-12-29');
const businessDays = DATE_FORMATTER.formatBusinessDays(startDate, endDate);
// 出力: "4営業日"
```

### 4. タイムゾーン対応

```typescript
// タイムゾーン情報付きフォーマット
const dateTimeWithTZ = DATE_FORMATTER.formatDateTimeWithTimezone(now);
// 出力: "2023/12/25 14:30:45 (JST)"

const dateTimeWithFullTZ = DATE_FORMATTER.formatDateTimeWithTimezone(now, true);
// 出力: "2023/12/25 14:30:45 (日本標準時)"

// ISO文字列からの変換
const isoString = "2023-12-25T14:30:45.000Z";
const jstDateTime = DATE_FORMATTER.formatISOStringToJST(isoString);
// 出力: "2023/12/25 23:30:45" (JST変換済み)
```

### 5. ヘルパー関数

```typescript
// 年齢計算
const birthDate = new Date('1990-05-15');
const age = DATE_FORMATTER.calculateAge(birthDate);
// 出力: "33歳"

// 月名・曜日名の取得
const monthName = DATE_FORMATTER.getMonthName(11); // 12月（0ベース）
// 出力: "12月"

const dayName = DATE_FORMATTER.getDayOfWeekName(0); // 日曜日
// 出力: "日曜日"

const dayShort = DATE_FORMATTER.getDayOfWeekShort(1); // 月曜日
// 出力: "月"
```

## コンポーネントでの実装例

### 1. テーブルコンポーネント

```typescript
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { USER_LABELS, TECHNICAL_TERMS, ACTION_LABELS } from "@/localization";
import { DataTableColumnHeader } from "@/components/common/data-table-column-header";

export const createUserColumns = (
  onEdit: (userId: string) => void,
  onDelete: (userId: string) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title={TECHNICAL_TERMS.ID} 
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title={USER_LABELS.TABLE.HEADERS.NAME} 
      />
    ),
  },
  {
    accessorKey: "role",
    header: USER_LABELS.TABLE.HEADERS.ROLE,
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge>
          {USER_LABELS.ROLES[role as keyof typeof USER_LABELS.ROLES] || role}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: ACTION_LABELS.ACTIONS,
    cell: ({ row }) => (
      <ActionButtons
        onEdit={() => onEdit(row.original.id)}
        onDelete={() => onDelete(row.original.id)}
        editLabel={ACTION_LABELS.EDIT}
        deleteLabel={ACTION_LABELS.DELETE}
      />
    ),
  },
];
```

### 2. フォームコンポーネント

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { USER_LABELS, ACTION_LABELS } from '@/localization';
import { userFormSchema, UserFormData } from './user-form-schema';

const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmit }) => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{USER_LABELS.FORM.EMPLOYEE_ID}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={USER_LABELS.FORM.PLACEHOLDERS.EMPLOYEE_ID}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{USER_LABELS.FORM.NAME}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={USER_LABELS.FORM.PLACEHOLDERS.NAME}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{USER_LABELS.FORM.ROLE}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={USER_LABELS.FORM.PLACEHOLDERS.ROLE} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SU">{USER_LABELS.ROLES.SU}</SelectItem>
                  <SelectItem value="AD">{USER_LABELS.ROLES.AD}</SelectItem>
                  <SelectItem value="CU">{USER_LABELS.ROLES.CU}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex space-x-2">
          <Button type="submit">{ACTION_LABELS.SAVE}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
        </div>
      </form>
    </Form>
  );
};
```

### 3. ページコンポーネント

```typescript
import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { 
  BUSINESS_TERMS, 
  ACTION_LABELS, 
  MESSAGE_FORMATTER,
  USER_LABELS 
} from '@/localization';

const UsersPage: React.FC = () => {
  const handleCreateUser = () => {
    navigate('/users/create');
  };

  const handleEditUser = (userId: string) => {
    navigate(`/users/${userId}/edit`);
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmMessage = MESSAGE_FORMATTER.CONFIRM_DELETE(
      `${BUSINESS_TERMS.USER}「${getUserName(userId)}」`
    );
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteUser(userId);
        toast({
          title: MESSAGE_FORMATTER.SUCCESS_DELETE(BUSINESS_TERMS.USER),
        });
        refetch();
      } catch (error) {
        toast({
          title: MESSAGE_FORMATTER.ERROR_DELETE(BUSINESS_TERMS.USER),
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={BUSINESS_TERMS.USERS}
        description={`システムの${BUSINESS_TERMS.USERS}を管理します`}
        action={{
          label: `${ACTION_LABELS.CREATE_NEW}${BUSINESS_TERMS.USER}`,
          onClick: handleCreateUser,
        }}
      />
      
      <DataTable
        columns={createUserColumns(handleEditUser, handleDeleteUser)}
        data={users}
        searchPlaceholder={USER_LABELS.TABLE.SEARCH_PLACEHOLDER}
        noDataMessage={MESSAGE_FORMATTER.INFO_NO_DATA(BUSINESS_TERMS.USERS)}
      />
    </div>
  );
};
```

## 新機能開発時のガイドライン

### 1. 翻訳定数の追加

新しい機能を開発する際は、以下の手順で翻訳定数を追加します：

```typescript
// 1. 機能別ラベルファイルを作成
// frontend/src/localization/constants/new-feature-labels.ts

export const NEW_FEATURE_LABELS = {
  // ページ関連
  PAGE: {
    TITLE: '新機能',
    DESCRIPTION: '新機能の説明',
  },
  
  // フォーム関連
  FORM: {
    FIELD_NAME: 'フィールド名',
    PLACEHOLDERS: {
      FIELD_NAME: '例: サンプル値',
    },
  },
  
  // テーブル関連
  TABLE: {
    HEADERS: {
      COLUMN_NAME: 'カラム名',
    },
    SEARCH_PLACEHOLDER: '新機能で検索...',
  },
  
  // メッセージ関連
  MESSAGES: {
    SUCCESS_ACTION: '操作が完了しました',
    ERROR_ACTION: '操作に失敗しました',
  },
} as const;

// 2. インデックスファイルに追加
// frontend/src/localization/constants/index.ts
export * from './new-feature-labels';
```

### 2. バリデーションスキーマの作成

```typescript
// 新機能のバリデーションスキーマ
import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/localization/constants/validation-messages';

export const newFeatureFormSchema = z.object({
  name: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED('名前'))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH('名前', 100)),
  
  description: z.string()
    .max(500, VALIDATION_MESSAGES.MAX_LENGTH('説明', 500))
    .optional(),
  
  category: z.enum(['type1', 'type2', 'type3'], {
    required_error: VALIDATION_MESSAGES.SELECTION_REQUIRED('カテゴリ'),
  }),
});

export type NewFeatureFormData = z.infer<typeof newFeatureFormSchema>;
```

### 3. コンポーネントの実装

```typescript
// 新機能コンポーネントの実装例
import React from 'react';
import { 
  NEW_FEATURE_LABELS, 
  ACTION_LABELS, 
  MESSAGE_FORMATTER,
  BUSINESS_TERMS 
} from '@/localization';

const NewFeatureComponent: React.FC = () => {
  // 翻訳定数を使用した実装
  return (
    <div>
      <h1>{NEW_FEATURE_LABELS.PAGE.TITLE}</h1>
      <p>{NEW_FEATURE_LABELS.PAGE.DESCRIPTION}</p>
      
      {/* フォームやテーブルの実装 */}
    </div>
  );
};
```

### 4. チェックリスト

新機能開発時は以下をチェックしてください：

- [ ] 技術用語は `TECHNICAL_TERMS` を使用
- [ ] 業務用語は `BUSINESS_TERMS` を使用
- [ ] アクションは `ACTION_LABELS` を使用
- [ ] バリデーションは `VALIDATION_MESSAGES` を使用
- [ ] 日付・時刻は `DATE_FORMATTER` を使用
- [ ] メッセージは `MESSAGE_FORMATTER` を使用
- [ ] ハードコードされた文字列がない
- [ ] 機能別ラベルファイルを作成
- [ ] インデックスファイルに追加

## トラブルシューティング

### 1. 翻訳キーが見つからない場合

```typescript
// エラー例
console.error('Translation key not found: UNKNOWN_KEY');

// 解決方法
// 1. キーが正しく定義されているか確認
// 2. インポートが正しいか確認
// 3. タイポがないか確認

// 安全な使用方法
const getTranslation = (key: string, fallback: string = key) => {
  return TRANSLATIONS[key] || fallback;
};
```

### 2. メッセージフォーマットエラー

```typescript
// エラー例
console.error('Message formatting error:', error);

// 解決方法
import { formatMessage } from '@/localization/utils/message-formatter';

const safeMessage = formatMessage(
  MESSAGE_FORMATTER.SUCCESS_CREATE,
  entityName
);
```

### 3. 日付フォーマットエラー

```typescript
// エラー例：無効な日付
const invalidDate = new Date('invalid');

// 解決方法：日付の妥当性チェック
const formatSafeDate = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return '無効な日付';
  }
  return DATE_FORMATTER.formatDate(date);
};
```

### 4. TypeScriptエラー

```typescript
// エラー例：型エラー
// Type 'string' is not assignable to type 'keyof typeof USER_LABELS.ROLES'

// 解決方法：型アサーションまたは型ガード
const getRoleLabel = (role: string) => {
  if (role in USER_LABELS.ROLES) {
    return USER_LABELS.ROLES[role as keyof typeof USER_LABELS.ROLES];
  }
  return role;
};
```

### 5. パフォーマンス最適化

```typescript
// 重い処理の最適化
import { useMemo } from 'react';

const OptimizedComponent: React.FC<{ data: any[] }> = ({ data }) => {
  // メッセージの生成をメモ化
  const formattedMessages = useMemo(() => {
    return data.map(item => 
      MESSAGE_FORMATTER.SUCCESS_CREATE(item.name)
    );
  }, [data]);

  // 日付フォーマットをメモ化
  const formattedDates = useMemo(() => {
    return data.map(item => 
      DATE_FORMATTER.formatDate(new Date(item.createdAt))
    );
  }, [data]);

  return (
    <div>
      {/* レンダリング */}
    </div>
  );
};
```

## まとめ

このガイドに従って翻訳システムを使用することで、統一された日本語UIを提供できます。新機能開発時は必ずこのガイドラインに従い、一貫した翻訳パターンを維持してください。

質問や問題が発生した場合は、開発チームに相談してください。