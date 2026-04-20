# 翻訳定数使用マニュアル

このドキュメントは、RTMSフロントエンドアプリケーションで使用する翻訳定数の詳細な使用方法を説明します。

## 目次

1. [翻訳定数の分類](#翻訳定数の分類)
2. [技術用語（TECHNICAL_TERMS）](#技術用語technical_terms)
3. [業務用語（BUSINESS_TERMS）](#業務用語business_terms)
4. [アクションラベル（ACTION_LABELS）](#アクションラベルaction_labels)
5. [ステータスラベル（STATUS_LABELS）](#ステータスラベルstatus_labels)
6. [機能別ラベル](#機能別ラベル)
7. [実践的な使用例](#実践的な使用例)
8. [ベストプラクティス](#ベストプラクティス)

## 翻訳定数の分類

RTMSの翻訳システムでは、以下の分類で翻訳定数を管理しています：

### 1. 共通定数
- **技術用語**: 英語表記を維持する国際標準用語
- **業務用語**: 日本語に翻訳するシステム固有用語
- **アクションラベル**: ボタンやメニューのアクション
- **ステータスラベル**: 状態表示用のラベル

### 2. 機能別定数
- **ユーザー関連**: USER_LABELS
- **デバイス関連**: DEVICE_LABELS
- **グループ関連**: GROUP_LABELS
- **製品関連**: PRODUCT_LABELS
- **顧客関連**: CUSTOMER_LABELS
- **分類関連**: CLASSIFICATION_LABELS
- **アラーム関連**: ALARM_LABELS
- **ロギング関連**: LOGGING_LABELS
- **設定関連**: SETTINGS_LABELS

## 技術用語（TECHNICAL_TERMS）

### 概要
国際標準の技術用語は英語表記を維持します。これにより技術者間のコミュニケーションを円滑にし、国際的な標準に準拠します。

### 利用可能な技術用語

#### ネットワーク関連
```typescript
TECHNICAL_TERMS.IP_ADDRESS     // "IP Address"
TECHNICAL_TERMS.MAC_ADDRESS    // "MAC Address"
TECHNICAL_TERMS.URL            // "URL"
TECHNICAL_TERMS.API            // "API"
TECHNICAL_TERMS.PORT           // "Port"
```

#### プロトコル
```typescript
TECHNICAL_TERMS.HTTP           // "HTTP"
TECHNICAL_TERMS.HTTPS          // "HTTPS"
TECHNICAL_TERMS.MQTT           // "MQTT"
TECHNICAL_TERMS.TCP            // "TCP"
TECHNICAL_TERMS.UDP            // "UDP"
TECHNICAL_TERMS.SSL            // "SSL"
TECHNICAL_TERMS.TLS            // "TLS"
```

#### データ形式
```typescript
TECHNICAL_TERMS.JSON           // "JSON"
TECHNICAL_TERMS.XML            // "XML"
TECHNICAL_TERMS.CSV            // "CSV"
TECHNICAL_TERMS.PDF            // "PDF"
TECHNICAL_TERMS.XLSX           // "XLSX"
```

#### 識別子
```typescript
TECHNICAL_TERMS.ID             // "ID"
TECHNICAL_TERMS.UUID           // "UUID"
```

#### 産業機器
```typescript
TECHNICAL_TERMS.PLC            // "PLC"
TECHNICAL_TERMS.IO             // "IO"
```

### 使用例

```typescript
// フォームラベル
<FormLabel>{TECHNICAL_TERMS.IP_ADDRESS}</FormLabel>

// テーブルヘッダー
<TableHeader>{TECHNICAL_TERMS.API}</TableHeader>

// プレースホルダー
<Input placeholder={`例: 192.168.1.1 (${TECHNICAL_TERMS.IP_ADDRESS})`} />

// エラーメッセージ
const errorMessage = `正しい${TECHNICAL_TERMS.MAC_ADDRESS}を入力してください`;

// 組み合わせ使用
const description = `${TECHNICAL_TERMS.PLC}の${TECHNICAL_TERMS.IP_ADDRESS}を設定してください`;
// 出力: "PLCのIP Addressを設定してください"
```

## 業務用語（BUSINESS_TERMS）

### 概要
システム固有の業務用語を適切な日本語に翻訳します。一貫した用語使用により、ユーザーの理解を促進します。

### 利用可能な業務用語

#### エンティティ（単数形・複数形）
```typescript
BUSINESS_TERMS.DEVICE          // "デバイス"
BUSINESS_TERMS.DEVICES         // "デバイス"
BUSINESS_TERMS.USER            // "ユーザー"
BUSINESS_TERMS.USERS           // "ユーザー"
BUSINESS_TERMS.GROUP           // "グループ"
BUSINESS_TERMS.GROUPS          // "グループ"
BUSINESS_TERMS.PRODUCT         // "製品"
BUSINESS_TERMS.PRODUCTS        // "製品"
BUSINESS_TERMS.CUSTOMER        // "顧客"
BUSINESS_TERMS.CUSTOMERS       // "顧客"
```

#### 設定関連
```typescript
BUSINESS_TERMS.SETTINGS        // "設定"
BUSINESS_TERMS.CONFIGURATION   // "設定"
BUSINESS_TERMS.MANAGEMENT      // "管理"
BUSINESS_TERMS.ADMINISTRATION  // "管理"
```

#### データ関連
```typescript
BUSINESS_TERMS.DATA            // "データ"
BUSINESS_TERMS.INFORMATION     // "情報"
BUSINESS_TERMS.DETAILS         // "詳細"
BUSINESS_TERMS.RECORD          // "レコード"
BUSINESS_TERMS.RECORDS         // "レコード"
```

#### システム関連
```typescript
BUSINESS_TERMS.SYSTEM          // "システム"
BUSINESS_TERMS.APPLICATION     // "アプリケーション"
BUSINESS_TERMS.SERVICE         // "サービス"
BUSINESS_TERMS.FUNCTION        // "機能"
BUSINESS_TERMS.FEATURE         // "機能"
```

### 使用例

```typescript
// ページタイトル
<PageTitle>{BUSINESS_TERMS.USERS}</PageTitle>

// 説明文
const description = `システムの${BUSINESS_TERMS.DEVICES}を管理します`;

// ボタンラベル
<Button>{ACTION_LABELS.CREATE_NEW}{BUSINESS_TERMS.USER}</Button>

// メッセージ
const successMessage = `${BUSINESS_TERMS.DEVICE}を作成しました`;

// 複数形の使用
const listTitle = `登録済み${BUSINESS_TERMS.CUSTOMERS}`;
```

## アクションラベル（ACTION_LABELS）

### 概要
ボタンやメニューのアクションを示すラベルの日本語翻訳です。統一されたアクション表現により、直感的な操作を実現します。

### 利用可能なアクションラベル

#### CRUD操作
```typescript
ACTION_LABELS.CREATE           // "作成"
ACTION_LABELS.CREATE_NEW       // "新規作成"
ACTION_LABELS.ADD              // "追加"
ACTION_LABELS.ADD_NEW          // "新規追加"
ACTION_LABELS.EDIT             // "編集"
ACTION_LABELS.UPDATE           // "更新"
ACTION_LABELS.DELETE           // "削除"
ACTION_LABELS.REMOVE           // "削除"
ACTION_LABELS.SAVE             // "保存"
ACTION_LABELS.CANCEL           // "キャンセル"
```

#### 表示・閲覧
```typescript
ACTION_LABELS.VIEW             // "表示"
ACTION_LABELS.SHOW             // "表示"
ACTION_LABELS.HIDE             // "非表示"
ACTION_LABELS.PREVIEW          // "プレビュー"
ACTION_LABELS.DETAILS          // "詳細"
```

#### ナビゲーション
```typescript
ACTION_LABELS.BACK             // "戻る"
ACTION_LABELS.NEXT             // "次へ"
ACTION_LABELS.PREVIOUS         // "前へ"
ACTION_LABELS.CONTINUE         // "続行"
ACTION_LABELS.FINISH           // "完了"
```

#### データ操作
```typescript
ACTION_LABELS.SEARCH           // "検索"
ACTION_LABELS.FILTER           // "フィルター"
ACTION_LABELS.SORT             // "ソート"
ACTION_LABELS.REFRESH          // "更新"
ACTION_LABELS.RELOAD           // "再読み込み"
ACTION_LABELS.RETRY            // "再試行"
```

#### ファイル操作
```typescript
ACTION_LABELS.DOWNLOAD         // "ダウンロード"
ACTION_LABELS.UPLOAD           // "アップロード"
ACTION_LABELS.IMPORT           // "インポート"
ACTION_LABELS.EXPORT           // "エクスポート"
```

### 使用例

```typescript
// 基本的なボタン
<Button>{ACTION_LABELS.CREATE}</Button>
<Button>{ACTION_LABELS.EDIT}</Button>
<Button>{ACTION_LABELS.DELETE}</Button>

// 組み合わせ使用
<Button>{ACTION_LABELS.CREATE_NEW} {BUSINESS_TERMS.USER}</Button>
// 出力: "新規作成 ユーザー"

// メニュー項目
<MenuItem>{ACTION_LABELS.DOWNLOAD} {BUSINESS_TERMS.DATA}</MenuItem>
// 出力: "ダウンロード データ"

// 確認ダイアログ
<Button onClick={handleSave}>{ACTION_LABELS.SAVE}</Button>
<Button onClick={handleCancel}>{ACTION_LABELS.CANCEL}</Button>

// 検索・フィルター
<SearchInput placeholder={`${ACTION_LABELS.SEARCH}...`} />
<FilterButton>{ACTION_LABELS.FILTER}</FilterButton>
```

## ステータスラベル（STATUS_LABELS）

### 概要
ステータスやバッジの表示を統一します。システム全体で一貫したステータス表現を提供します。

### 利用可能なステータスラベル

#### ユーザーロール
```typescript
STATUS_LABELS.SUPER_USER       // "スーパーユーザー"
STATUS_LABELS.ADMIN_USER       // "管理者"
STATUS_LABELS.COMMON_USER      // "一般ユーザー"
```

#### デバイスステータス
```typescript
STATUS_LABELS.ONLINE           // "オンライン"
STATUS_LABELS.OFFLINE          // "オフライン"
STATUS_LABELS.ERROR            // "エラー"
STATUS_LABELS.CONNECTING       // "接続中"
STATUS_LABELS.DISCONNECTED     // "切断"
```

#### 処理ステータス
```typescript
STATUS_LABELS.COMPLETED        // "完了"
STATUS_LABELS.PROCESSING       // "処理中"
STATUS_LABELS.FAILED           // "失敗"
STATUS_LABELS.PENDING          // "待機中"
STATUS_LABELS.CANCELLED        // "キャンセル済み"
```

#### 一般的な状態
```typescript
STATUS_LABELS.ACTIVE           // "アクティブ"
STATUS_LABELS.INACTIVE         // "非アクティブ"
STATUS_LABELS.ENABLED          // "有効"
STATUS_LABELS.DISABLED         // "無効"
STATUS_LABELS.AVAILABLE        // "利用可能"
STATUS_LABELS.UNAVAILABLE      // "利用不可"
```

### 使用例

```typescript
// ユーザーロールの表示
const getRoleLabel = (role: string) => {
  const roleMap = {
    'SU': STATUS_LABELS.SUPER_USER,
    'AD': STATUS_LABELS.ADMIN_USER,
    'CU': STATUS_LABELS.COMMON_USER,
  };
  return roleMap[role] || role;
};

<Badge>{getRoleLabel(user.role)}</Badge>

// デバイスステータスの表示
const getDeviceStatusLabel = (status: string) => {
  const statusMap = {
    'online': STATUS_LABELS.ONLINE,
    'offline': STATUS_LABELS.OFFLINE,
    'error': STATUS_LABELS.ERROR,
  };
  return statusMap[status] || status;
};

<StatusIndicator status={device.status}>
  {getDeviceStatusLabel(device.status)}
</StatusIndicator>

// 処理ステータスの表示
const getProcessStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return STATUS_LABELS.COMPLETED;
    case 'processing':
      return STATUS_LABELS.PROCESSING;
    case 'failed':
      return STATUS_LABELS.FAILED;
    default:
      return status;
  }
};

<ProcessStatus>{getProcessStatusLabel(process.status)}</ProcessStatus>
```

## 機能別ラベル

### USER_LABELS（ユーザー関連）

```typescript
// フォーム関連
USER_LABELS.FORM.EMPLOYEE_ID              // "従業員ID"
USER_LABELS.FORM.NAME                     // "名前"
USER_LABELS.FORM.ROLE                     // "ロール"
USER_LABELS.FORM.PASSWORD                 // "パスワード"

// プレースホルダー
USER_LABELS.FORM.PLACEHOLDERS.EMPLOYEE_ID // "例: EMP001"
USER_LABELS.FORM.PLACEHOLDERS.NAME        // "例: 田中太郎"
USER_LABELS.FORM.PLACEHOLDERS.ROLE        // "ロールを選択してください"

// テーブル関連
USER_LABELS.TABLE.HEADERS.NAME            // "名前"
USER_LABELS.TABLE.HEADERS.ROLE            // "ロール"
USER_LABELS.TABLE.SEARCH_PLACEHOLDER      // "ユーザー名で検索..."

// ロール
USER_LABELS.ROLES.SU                      // "スーパーユーザー"
USER_LABELS.ROLES.AD                      // "管理者"
USER_LABELS.ROLES.CU                      // "一般ユーザー"
```

### DEVICE_LABELS（デバイス関連）

```typescript
// フォーム関連
DEVICE_LABELS.FORM.DEVICE_NAME            // "デバイス名"
DEVICE_LABELS.FORM.DEVICE_ID              // "デバイスID"
DEVICE_LABELS.FORM.IP_ADDRESS             // "IP Address"
DEVICE_LABELS.FORM.PORT                   // "Port"
DEVICE_LABELS.FORM.PROTOCOL               // "プロトコル"

// ステータス
DEVICE_LABELS.STATUS.ONLINE               // "オンライン"
DEVICE_LABELS.STATUS.OFFLINE              // "オフライン"
DEVICE_LABELS.STATUS.ERROR                // "エラー"

// テーブル関連
DEVICE_LABELS.TABLE.HEADERS.NAME          // "デバイス名"
DEVICE_LABELS.TABLE.HEADERS.STATUS        // "ステータス"
DEVICE_LABELS.TABLE.HEADERS.IP_ADDRESS    // "IP Address"
```

### その他の機能別ラベル

各機能には専用のラベルファイルが用意されています：

- **GROUP_LABELS**: グループ管理関連
- **PLC_LABELS**: PLC管理関連
- **CLASSIFICATION_LABELS**: 分類管理関連
- **CUSTOMER_LABELS**: 顧客管理関連
- **PRODUCT_LABELS**: 製品管理関連
- **ALARM_LABELS**: アラーム管理関連
- **LOGGING_LABELS**: ロギング設定関連
- **SETTINGS_LABELS**: その他設定関連

## 実践的な使用例

### 1. ページコンポーネントでの使用

```typescript
import React from 'react';
import { 
  BUSINESS_TERMS, 
  ACTION_LABELS, 
  USER_LABELS 
} from '@/localization';

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title={BUSINESS_TERMS.USERS}
        description={`システムの${BUSINESS_TERMS.USERS}を管理します`}
        action={{
          label: `${ACTION_LABELS.CREATE_NEW}${BUSINESS_TERMS.USER}`,
          onClick: handleCreateUser,
        }}
      />
      
      {/* データテーブル */}
      <DataTable
        columns={userColumns}
        data={users}
        searchPlaceholder={USER_LABELS.TABLE.SEARCH_PLACEHOLDER}
      />
    </div>
  );
};
```

### 2. フォームコンポーネントでの使用

```typescript
import React from 'react';
import { USER_LABELS, ACTION_LABELS } from '@/localization';

const UserForm: React.FC = () => {
  return (
    <Form>
      {/* 従業員ID */}
      <FormField
        name="employeeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{USER_LABELS.FORM.EMPLOYEE_ID}</FormLabel>
            <FormControl>
              <Input 
                placeholder={USER_LABELS.FORM.PLACEHOLDERS.EMPLOYEE_ID}
                {...field} 
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      {/* 名前 */}
      <FormField
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
          </FormItem>
        )}
      />
      
      {/* ロール */}
      <FormField
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{USER_LABELS.FORM.ROLE}</FormLabel>
            <Select onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={USER_LABELS.FORM.PLACEHOLDERS.ROLE} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SU">{USER_LABELS.ROLES.SU}</SelectItem>
                <SelectItem value="AD">{USER_LABELS.ROLES.AD}</SelectItem>
                <SelectItem value="CU">{USER_LABELS.ROLES.CU}</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      
      {/* アクションボタン */}
      <div className="flex space-x-2">
        <Button type="submit">{ACTION_LABELS.SAVE}</Button>
        <Button type="button" variant="outline">
          {ACTION_LABELS.CANCEL}
        </Button>
      </div>
    </Form>
  );
};
```

### 3. テーブルカラム定義での使用

```typescript
import { ColumnDef } from "@tanstack/react-table";
import { 
  USER_LABELS, 
  TECHNICAL_TERMS, 
  ACTION_LABELS,
  STATUS_LABELS 
} from '@/localization';

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: TECHNICAL_TERMS.ID,
  },
  {
    accessorKey: "name",
    header: USER_LABELS.TABLE.HEADERS.NAME,
  },
  {
    accessorKey: "role",
    header: USER_LABELS.TABLE.HEADERS.ROLE,
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleLabel = USER_LABELS.ROLES[role as keyof typeof USER_LABELS.ROLES];
      return <Badge>{roleLabel}</Badge>;
    },
  },
  {
    id: "actions",
    header: ACTION_LABELS.ACTIONS,
    cell: ({ row }) => (
      <ActionButtons
        onEdit={() => handleEdit(row.original.id)}
        onDelete={() => handleDelete(row.original.id)}
        editLabel={ACTION_LABELS.EDIT}
        deleteLabel={ACTION_LABELS.DELETE}
      />
    ),
  },
];
```

### 4. 動的メッセージでの使用

```typescript
import { 
  BUSINESS_TERMS, 
  ACTION_LABELS, 
  MESSAGE_FORMATTER 
} from '@/localization';

const UserManagement: React.FC = () => {
  const handleCreateUser = async (userData: UserData) => {
    try {
      await createUser(userData);
      
      // 成功メッセージ
      toast({
        title: MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER),
        // 出力: "ユーザーを作成しました"
      });
    } catch (error) {
      // エラーメッセージ
      toast({
        title: MESSAGE_FORMATTER.ERROR_CREATE(BUSINESS_TERMS.USER),
        // 出力: "ユーザーの作成に失敗しました"
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = (userName: string) => {
    const confirmMessage = MESSAGE_FORMATTER.CONFIRM_DELETE(
      `${BUSINESS_TERMS.USER}「${userName}」`
    );
    // 出力: "このユーザー「田中太郎」を削除してもよろしいですか？この操作は取り消せません。"
    
    if (window.confirm(confirmMessage)) {
      deleteUser();
    }
  };
};
```

## ベストプラクティス

### 1. 一貫性の維持

```typescript
// ✅ 良い例：一貫した用語使用
<PageTitle>{BUSINESS_TERMS.USERS}</PageTitle>
<Button>{ACTION_LABELS.CREATE_NEW}{BUSINESS_TERMS.USER}</Button>
<TableHeader>{USER_LABELS.TABLE.HEADERS.NAME}</TableHeader>

// ❌ 悪い例：ハードコードされた文字列
<PageTitle>ユーザー</PageTitle>
<Button>新規作成ユーザー</Button>
<TableHeader>名前</TableHeader>
```

### 2. 適切な分類の使用

```typescript
// ✅ 良い例：技術用語は英語維持
<FormLabel>{TECHNICAL_TERMS.IP_ADDRESS}</FormLabel>
<FormLabel>{TECHNICAL_TERMS.API}</FormLabel>

// ❌ 悪い例：技術用語を日本語化
<FormLabel>IPアドレス</FormLabel>
<FormLabel>エーピーアイ</FormLabel>

// ✅ 良い例：業務用語は日本語化
<PageTitle>{BUSINESS_TERMS.DEVICES}</PageTitle>
<Button>{ACTION_LABELS.CREATE}{BUSINESS_TERMS.USER}</Button>

// ❌ 悪い例：業務用語を英語のまま
<PageTitle>Devices</PageTitle>
<Button>Create User</Button>
```

### 3. 組み合わせ使用

```typescript
// ✅ 良い例：適切な組み合わせ
const title = `${BUSINESS_TERMS.DEVICE}の${TECHNICAL_TERMS.IP_ADDRESS}設定`;
// 出力: "デバイスのIP Address設定"

const buttonLabel = `${ACTION_LABELS.DOWNLOAD} ${BUSINESS_TERMS.DATA}`;
// 出力: "ダウンロード データ"

// ❌ 悪い例：不適切な組み合わせ
const title = `${BUSINESS_TERMS.DEVICE}のIPアドレス設定`;
const buttonLabel = `Download ${BUSINESS_TERMS.DATA}`;
```

### 4. 型安全性の確保

```typescript
// ✅ 良い例：型安全な使用
const getRoleLabel = (role: string): string => {
  if (role in USER_LABELS.ROLES) {
    return USER_LABELS.ROLES[role as keyof typeof USER_LABELS.ROLES];
  }
  return role;
};

// ✅ 良い例：デフォルト値の提供
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'online': STATUS_LABELS.ONLINE,
    'offline': STATUS_LABELS.OFFLINE,
    'error': STATUS_LABELS.ERROR,
  };
  return statusMap[status] || status;
};
```

### 5. パフォーマンス最適化

```typescript
// ✅ 良い例：メモ化の使用
import { useMemo } from 'react';

const UserList: React.FC<{ users: User[] }> = ({ users }) => {
  const formattedUsers = useMemo(() => {
    return users.map(user => ({
      ...user,
      roleLabel: USER_LABELS.ROLES[user.role as keyof typeof USER_LABELS.ROLES],
    }));
  }, [users]);

  return (
    <div>
      {formattedUsers.map(user => (
        <div key={user.id}>
          {user.name} - {user.roleLabel}
        </div>
      ))}
    </div>
  );
};
```

### 6. エラーハンドリング

```typescript
// ✅ 良い例：安全な翻訳取得
const getTranslationSafely = (
  translations: Record<string, string>,
  key: string,
  fallback: string = key
): string => {
  return translations[key] || fallback;
};

// 使用例
const roleLabel = getTranslationSafely(
  USER_LABELS.ROLES,
  user.role,
  user.role
);
```

このマニュアルに従って翻訳定数を使用することで、統一された日本語UIを提供し、保守性の高いコードを実現できます。