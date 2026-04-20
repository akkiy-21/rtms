# メッセージフォーマット関数使用例集

このドキュメントは、RTMSフロントエンドアプリケーションのメッセージフォーマット関数の詳細な使用例を提供します。

## 目次

1. [メッセージフォーマット関数の概要](#メッセージフォーマット関数の概要)
2. [成功メッセージ](#成功メッセージ)
3. [エラーメッセージ](#エラーメッセージ)
4. [確認メッセージ](#確認メッセージ)
5. [ローディングメッセージ](#ローディングメッセージ)
6. [情報メッセージ](#情報メッセージ)
7. [警告メッセージ](#警告メッセージ)
8. [ヘルパー関数](#ヘルパー関数)
9. [React コンポーネントでの実装例](#reactコンポーネントでの実装例)
10. [エラーハンドリング](#エラーハンドリング)
11. [ベストプラクティス](#ベストプラクティス)

## メッセージフォーマット関数の概要

メッセージフォーマット関数は、アプリケーション全体で使用される各種メッセージの日本語フォーマットを提供します。統一されたメッセージ形式により、ユーザーエクスペリエンスの一貫性を保ちます。

### インポート方法

```typescript
// 基本的なインポート
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

// ヘルパー関数も含めてインポート
import { 
  MESSAGE_FORMATTER,
  createEntityMessage,
  createMultipleDeleteMessage,
  createFileMessage,
  formatMessage
} from '@/localization/utils/message-formatter';

// 業務用語と組み合わせて使用
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';
```

## 成功メッセージ

### 基本的な成功メッセージ

```typescript
// CRUD操作の成功メッセージ
const createSuccess = MESSAGE_FORMATTER.SUCCESS_CREATE('ユーザー');
// 出力: "ユーザーを作成しました"

const updateSuccess = MESSAGE_FORMATTER.SUCCESS_UPDATE('デバイス');
// 出力: "デバイスを更新しました"

const deleteSuccess = MESSAGE_FORMATTER.SUCCESS_DELETE('グループ');
// 出力: "グループを削除しました"

const saveSuccess = MESSAGE_FORMATTER.SUCCESS_SAVE();
// 出力: "正常に保存されました"
```

### ファイル操作の成功メッセージ

```typescript
const importSuccess = MESSAGE_FORMATTER.SUCCESS_IMPORT('ユーザーデータ');
// 出力: "ユーザーデータをインポートしました"

const exportSuccess = MESSAGE_FORMATTER.SUCCESS_EXPORT('デバイス一覧');
// 出力: "デバイス一覧をエクスポートしました"

const uploadSuccess = MESSAGE_FORMATTER.SUCCESS_UPLOAD();
// 出力: "ファイルをアップロードしました"

const downloadSuccess = MESSAGE_FORMATTER.SUCCESS_DOWNLOAD();
// 出力: "ダウンロードが完了しました"
```

### 業務用語と組み合わせた使用

```typescript
import { BUSINESS_TERMS } from '@/localization/constants/business-terms';

// エンティティ名を動的に指定
const userCreateSuccess = MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER);
// 出力: "ユーザーを作成しました"

const deviceUpdateSuccess = MESSAGE_FORMATTER.SUCCESS_UPDATE(BUSINESS_TERMS.DEVICE);
// 出力: "デバイスを更新しました"

const productDeleteSuccess = MESSAGE_FORMATTER.SUCCESS_DELETE(BUSINESS_TERMS.PRODUCT);
// 出力: "製品を削除しました"
```

### React コンポーネントでの使用例

```typescript
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { MESSAGE_FORMATTER, BUSINESS_TERMS } from '@/localization';

const UserForm: React.FC = () => {
  const handleSubmit = async (data: UserFormData) => {
    try {
      if (isEditMode) {
        await updateUser(data);
        toast({
          title: MESSAGE_FORMATTER.SUCCESS_UPDATE(BUSINESS_TERMS.USER),
          variant: "default",
        });
      } else {
        await createUser(data);
        toast({
          title: MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER),
          variant: "default",
        });
      }
      
      navigate('/users');
    } catch (error) {
      // エラーハンドリング
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* フォームの実装 */}
    </form>
  );
};
```

## エラーメッセージ

### 基本的なエラーメッセージ

```typescript
// CRUD操作のエラーメッセージ
const fetchError = MESSAGE_FORMATTER.ERROR_FETCH('ユーザー');
// 出力: "ユーザーの取得に失敗しました"

const createError = MESSAGE_FORMATTER.ERROR_CREATE('デバイス');
// 出力: "デバイスの作成に失敗しました"

const updateError = MESSAGE_FORMATTER.ERROR_UPDATE('グループ');
// 出力: "グループの更新に失敗しました"

const deleteError = MESSAGE_FORMATTER.ERROR_DELETE('製品');
// 出力: "製品の削除に失敗しました"

const saveError = MESSAGE_FORMATTER.ERROR_SAVE();
// 出力: "保存に失敗しました"
```

### ネットワーク・システムエラー

```typescript
const networkError = MESSAGE_FORMATTER.ERROR_NETWORK();
// 出力: "接続に問題があります。しばらく待ってから再試行してください"

const permissionError = MESSAGE_FORMATTER.ERROR_PERMISSION();
// 出力: "この操作を実行する権限がありません"

const notFoundError = MESSAGE_FORMATTER.ERROR_NOT_FOUND('ユーザー');
// 出力: "ユーザーが見つかりません"

const serverError = MESSAGE_FORMATTER.ERROR_SERVER();
// 出力: "サーバーでエラーが発生しました"

const unknownError = MESSAGE_FORMATTER.ERROR_UNKNOWN();
// 出力: "予期しないエラーが発生しました"
```

### ファイル関連エラー

```typescript
const uploadError = MESSAGE_FORMATTER.ERROR_UPLOAD();
// 出力: "ファイルのアップロードに失敗しました"

const downloadError = MESSAGE_FORMATTER.ERROR_DOWNLOAD();
// 出力: "ファイルのダウンロードに失敗しました"

const invalidDataError = MESSAGE_FORMATTER.ERROR_INVALID_DATA();
// 出力: "無効なデータです"

const fileFormatError = MESSAGE_FORMATTER.ERROR_FILE_FORMAT();
// 出力: "ファイル形式が正しくありません"

const fileSizeError = MESSAGE_FORMATTER.ERROR_FILE_SIZE();
// 出力: "ファイルサイズが大きすぎます"
```

### エラーハンドリングの実装例

```typescript
const ApiService = {
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      // エラーの種類に応じてメッセージを選択
      if (error instanceof TypeError) {
        throw new Error(MESSAGE_FORMATTER.ERROR_NETWORK());
      } else if (error.message.includes('404')) {
        throw new Error(MESSAGE_FORMATTER.ERROR_NOT_FOUND(BUSINESS_TERMS.USERS));
      } else if (error.message.includes('403')) {
        throw new Error(MESSAGE_FORMATTER.ERROR_PERMISSION());
      } else {
        throw new Error(MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.USERS));
      }
    }
  },

  async createUser(userData: UserData): Promise<User> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(MESSAGE_FORMATTER.ERROR_CREATE(BUSINESS_TERMS.USER));
    }
  },
};
```

## 確認メッセージ

### 削除確認メッセージ

```typescript
// 単一削除の確認
const deleteConfirm = MESSAGE_FORMATTER.CONFIRM_DELETE('ユーザー「田中太郎」');
// 出力: "このユーザー「田中太郎」を削除してもよろしいですか？この操作は取り消せません。"

// 複数削除の確認
const multipleDeleteConfirm = MESSAGE_FORMATTER.CONFIRM_DELETE_MULTIPLE(5, 'デバイス');
// 出力: "選択した5件のデバイスを削除してもよろしいですか？この操作は取り消せません。"
```

### その他の確認メッセージ

```typescript
const unsavedChangesConfirm = MESSAGE_FORMATTER.CONFIRM_UNSAVED_CHANGES();
// 出力: "保存されていない変更があります。このページを離れてもよろしいですか？"

const overwriteConfirm = MESSAGE_FORMATTER.CONFIRM_OVERWRITE('data.csv');
// 出力: "ファイル「data.csv」は既に存在します。上書きしてもよろしいですか？"

const resetConfirm = MESSAGE_FORMATTER.CONFIRM_RESET();
// 出力: "フォームの内容をリセットしてもよろしいですか？入力した内容は失われます。"

const logoutConfirm = MESSAGE_FORMATTER.CONFIRM_LOGOUT();
// 出力: "ログアウトしてもよろしいですか？"

const cancelConfirm = MESSAGE_FORMATTER.CONFIRM_CANCEL();
// 出力: "編集をキャンセルしてもよろしいですか？変更内容は保存されません。"
```

### 確認ダイアログの実装例

```typescript
import React from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MESSAGE_FORMATTER, ACTION_LABELS } from '@/localization';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  itemName?: string;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  itemName,
}) => {
  const confirmMessage = itemName
    ? MESSAGE_FORMATTER.CONFIRM_DELETE(`${entityName}「${itemName}」`)
    : MESSAGE_FORMATTER.CONFIRM_DELETE(entityName);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>削除の確認</AlertDialogTitle>
          <AlertDialogDescription>
            {confirmMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{ACTION_LABELS.CANCEL}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive">
            {ACTION_LABELS.DELETE}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// 使用例
const UserManagement: React.FC = () => {
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    userId: '',
    userName: '',
  });

  const handleDeleteClick = (user: User) => {
    setDeleteDialog({
      isOpen: true,
      userId: user.id,
      userName: user.name,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteDialog.userId);
      toast({
        title: MESSAGE_FORMATTER.SUCCESS_DELETE(BUSINESS_TERMS.USER),
      });
      setDeleteDialog({ isOpen: false, userId: '', userName: '' });
      refetch();
    } catch (error) {
      toast({
        title: MESSAGE_FORMATTER.ERROR_DELETE(BUSINESS_TERMS.USER),
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {/* ユーザー一覧 */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, userId: '', userName: '' })}
        onConfirm={handleDeleteConfirm}
        entityName={BUSINESS_TERMS.USER}
        itemName={deleteDialog.userName}
      />
    </div>
  );
};
```

## ローディングメッセージ

### 基本的なローディングメッセージ

```typescript
const loading = MESSAGE_FORMATTER.LOADING();
// 出力: "読み込み中..."

const processing = MESSAGE_FORMATTER.PROCESSING();
// 出力: "処理中..."

const saving = MESSAGE_FORMATTER.SAVING();
// 出力: "保存中..."

const deleting = MESSAGE_FORMATTER.DELETING();
// 出力: "削除中..."
```

### 具体的な操作のローディングメッセージ

```typescript
const loadingData = MESSAGE_FORMATTER.LOADING_DATA('ユーザー');
// 出力: "ユーザーを読み込み中..."

const creating = MESSAGE_FORMATTER.CREATING();
// 出力: "作成中..."

const updating = MESSAGE_FORMATTER.UPDATING();
// 出力: "更新中..."

const uploading = MESSAGE_FORMATTER.UPLOADING();
// 出力: "アップロード中..."

const downloading = MESSAGE_FORMATTER.DOWNLOADING();
// 出力: "ダウンロード中..."

const importing = MESSAGE_FORMATTER.IMPORTING();
// 出力: "インポート中..."

const exporting = MESSAGE_FORMATTER.EXPORTING();
// 出力: "エクスポート中..."

const connecting = MESSAGE_FORMATTER.CONNECTING();
// 出力: "接続中..."

const authenticating = MESSAGE_FORMATTER.AUTHENTICATING();
// 出力: "認証中..."
```

### ローディング状態の実装例

```typescript
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MESSAGE_FORMATTER, BUSINESS_TERMS } from '@/localization';

const DataFetcher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setLoadingMessage(MESSAGE_FORMATTER.LOADING_DATA(BUSINESS_TERMS.USERS));
    
    try {
      const users = await ApiService.getUsers();
      // データ処理
    } catch (error) {
      toast({
        title: MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.USERS),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const saveUser = async (userData: UserData) => {
    setLoading(true);
    setLoadingMessage(MESSAGE_FORMATTER.SAVING());
    
    try {
      await ApiService.createUser(userData);
      toast({
        title: MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER),
      });
    } catch (error) {
      toast({
        title: MESSAGE_FORMATTER.ERROR_CREATE(BUSINESS_TERMS.USER),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div>
      {loading && (
        <div className="flex items-center space-x-2 p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingMessage}</span>
        </div>
      )}
      
      <Button onClick={fetchUsers} disabled={loading}>
        {loading ? loadingMessage : 'データを読み込む'}
      </Button>
    </div>
  );
};
```

### 段階的ローディングメッセージ

```typescript
const MultiStepProcess: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    { message: MESSAGE_FORMATTER.CONNECTING(), action: connectToServer },
    { message: MESSAGE_FORMATTER.AUTHENTICATING(), action: authenticate },
    { message: MESSAGE_FORMATTER.LOADING_DATA(BUSINESS_TERMS.USERS), action: fetchUsers },
    { message: MESSAGE_FORMATTER.PROCESSING(), action: processData },
  ];

  const executeProcess = async () => {
    setLoading(true);
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      try {
        await steps[i].action();
      } catch (error) {
        toast({
          title: `ステップ ${i + 1} でエラーが発生しました`,
          description: MESSAGE_FORMATTER.ERROR_UNKNOWN(),
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }
    
    setLoading(false);
    toast({
      title: MESSAGE_FORMATTER.SUCCESS_SAVE(),
    });
  };

  return (
    <div>
      {loading && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{steps[currentStep]?.message}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      <Button onClick={executeProcess} disabled={loading}>
        プロセスを実行
      </Button>
    </div>
  );
};
```

## 情報メッセージ

### データ状態の情報メッセージ

```typescript
const noData = MESSAGE_FORMATTER.INFO_NO_DATA('ユーザー');
// 出力: "ユーザーがありません"

const emptySearch = MESSAGE_FORMATTER.INFO_EMPTY_SEARCH();
// 出力: "検索結果がありません"

const selectItem = MESSAGE_FORMATTER.INFO_SELECT_ITEM('デバイス');
// 出力: "デバイスを選択してください"

const requiredFields = MESSAGE_FORMATTER.INFO_REQUIRED_FIELDS();
// 出力: "必須項目を入力してください"
```

### 操作状態の情報メッセージ

```typescript
const changesSaved = MESSAGE_FORMATTER.INFO_CHANGES_SAVED();
// 出力: "変更が保存されました"

const noChanges = MESSAGE_FORMATTER.INFO_NO_CHANGES();
// 出力: "変更はありません"

const fileSelected = MESSAGE_FORMATTER.INFO_FILE_SELECTED('data.csv');
// 出力: "ファイル「data.csv」が選択されました"

const itemsSelected = MESSAGE_FORMATTER.INFO_ITEMS_SELECTED(3);
// 出力: "3件が選択されています"
```

### 情報メッセージの実装例

```typescript
const DataTable: React.FC<{ data: any[]; loading: boolean }> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>{MESSAGE_FORMATTER.LOADING_DATA(BUSINESS_TERMS.DATA)}</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <div className="mb-2">📋</div>
        <div>{MESSAGE_FORMATTER.INFO_NO_DATA(BUSINESS_TERMS.DATA)}</div>
      </div>
    );
  }

  return (
    <div>
      {/* テーブルの実装 */}
    </div>
  );
};

const SearchResults: React.FC<{ query: string; results: any[] }> = ({ query, results }) => {
  if (query && results.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <div className="mb-2">🔍</div>
        <div>{MESSAGE_FORMATTER.INFO_EMPTY_SEARCH()}</div>
        <div className="text-sm mt-2">「{query}」に一致する結果がありません</div>
      </div>
    );
  }

  return (
    <div>
      {results.map(result => (
        <div key={result.id}>{/* 結果の表示 */}</div>
      ))}
    </div>
  );
};
```

## 警告メッセージ

### 基本的な警告メッセージ

```typescript
const unsavedChanges = MESSAGE_FORMATTER.WARNING_UNSAVED_CHANGES();
// 出力: "保存されていない変更があります"

const largeFile = MESSAGE_FORMATTER.WARNING_LARGE_FILE();
// 出力: "ファイルサイズが大きいため、処理に時間がかかる場合があります"

const slowConnection = MESSAGE_FORMATTER.WARNING_SLOW_CONNECTION();
// 出力: "接続が不安定です"

const outdatedData = MESSAGE_FORMATTER.WARNING_OUTDATED_DATA();
// 出力: "データが古い可能性があります。最新の情報を取得してください"

const maintenance = MESSAGE_FORMATTER.WARNING_MAINTENANCE();
// 出力: "システムメンテナンス中です"
```

### 関連データの警告

```typescript
const deleteReferenced = MESSAGE_FORMATTER.WARNING_DELETE_REFERENCED('ユーザー');
// 出力: "このユーザーは他のデータから参照されています。削除すると関連データに影響する可能性があります"
```

### 警告メッセージの実装例

```typescript
const FileUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const newWarnings: string[] = [];

    // ファイルサイズチェック
    if (file.size > 10 * 1024 * 1024) { // 10MB
      newWarnings.push(MESSAGE_FORMATTER.WARNING_LARGE_FILE());
    }

    setWarnings(newWarnings);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
      
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              ⚠️
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                注意事項
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UnsavedChangesWarning: React.FC<{ hasUnsavedChanges: boolean }> = ({ hasUnsavedChanges }) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = MESSAGE_FORMATTER.WARNING_UNSAVED_CHANGES();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (!hasUnsavedChanges) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          ⚠️
        </div>
        <div className="ml-2 text-sm text-amber-700">
          {MESSAGE_FORMATTER.WARNING_UNSAVED_CHANGES()}
        </div>
      </div>
    </div>
  );
};
```

## ヘルパー関数

### createEntityMessage

エンティティ名を含むメッセージを簡単に生成します。

```typescript
import { createEntityMessage } from '@/localization/utils/message-formatter';

// 成功メッセージ
const createSuccess = createEntityMessage('success_create', 'ユーザー');
// 出力: "ユーザーを作成しました"

const updateSuccess = createEntityMessage('success_update', 'デバイス');
// 出力: "デバイスを更新しました"

const deleteSuccess = createEntityMessage('success_delete', 'グループ');
// 出力: "グループを削除しました"

// エラーメッセージ
const fetchError = createEntityMessage('error_fetch', 'データ');
// 出力: "データの取得に失敗しました"

const createError = createEntityMessage('error_create', 'ユーザー');
// 出力: "ユーザーの作成に失敗しました"

// 確認メッセージ
const deleteConfirm = createEntityMessage('confirm_delete', 'デバイス');
// 出力: "このデバイスを削除してもよろしいですか？この操作は取り消せません。"

// ローディングメッセージ
const loadingData = createEntityMessage('loading_data', 'ユーザー');
// 出力: "ユーザーを読み込み中..."

// 情報メッセージ
const noData = createEntityMessage('info_no_data', 'デバイス');
// 出力: "デバイスがありません"
```

### createMultipleDeleteMessage

複数削除の確認メッセージを生成します。

```typescript
import { createMultipleDeleteMessage } from '@/localization/utils/message-formatter';

const multipleDeleteConfirm = createMultipleDeleteMessage(5, 'ユーザー');
// 出力: "選択した5件のユーザーを削除してもよろしいですか？この操作は取り消せません。"

const bulkDeleteConfirm = createMultipleDeleteMessage(10, 'デバイス');
// 出力: "選択した10件のデバイスを削除してもよろしいですか？この操作は取り消せません。"
```

### createFileMessage

ファイル関連のメッセージを生成します。

```typescript
import { createFileMessage } from '@/localization/utils/message-formatter';

const overwriteConfirm = createFileMessage('confirm_overwrite', 'users.csv');
// 出力: "ファイル「users.csv」は既に存在します。上書きしてもよろしいですか？"

const fileSelected = createFileMessage('info_file_selected', 'data.xlsx');
// 出力: "ファイル「data.xlsx」が選択されました"
```

### createSelectionMessage

選択件数のメッセージを生成します。

```typescript
import { createSelectionMessage } from '@/localization/utils/message-formatter';

const selectionInfo = createSelectionMessage(3);
// 出力: "3件が選択されています"

const noSelection = createSelectionMessage(0);
// 出力: "0件が選択されています"
```

### formatMessage（安全なメッセージ生成）

エラーハンドリングを含む安全なメッセージ生成を行います。

```typescript
import { formatMessage, MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

// 安全なメッセージ生成
const safeMessage = formatMessage(
  MESSAGE_FORMATTER.SUCCESS_CREATE,
  'ユーザー'
);

// パラメータが不正でもエラーにならない
const safeBadMessage = formatMessage(
  MESSAGE_FORMATTER.SUCCESS_CREATE,
  null // 不正なパラメータ
);
// 出力: "メッセージの生成に失敗しました"
```

## React コンポーネントでの実装例

### 統合的なCRUDコンポーネント

```typescript
import React, { useState } from 'react';
import { 
  MESSAGE_FORMATTER, 
  BUSINESS_TERMS, 
  ACTION_LABELS,
  createEntityMessage,
  createMultipleDeleteMessage 
} from '@/localization';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // データ取得
  const fetchUsers = async () => {
    setLoading(true);
    setLoadingMessage(MESSAGE_FORMATTER.LOADING_DATA(BUSINESS_TERMS.USERS));
    
    try {
      const data = await ApiService.getUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.USERS),
        description: MESSAGE_FORMATTER.ERROR_NETWORK(),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // 単一ユーザー作成
  const createUser = async (userData: UserData) => {
    setLoading(true);
    setLoadingMessage(MESSAGE_FORMATTER.CREATING());
    
    try {
      const newUser = await ApiService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      
      toast({
        title: createEntityMessage('success_create', BUSINESS_TERMS.USER),
      });
    } catch (error) {
      toast({
        title: createEntityMessage('error_create', BUSINESS_TERMS.USER),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // 単一ユーザー更新
  const updateUser = async (userId: string, userData: UserData) => {
    setLoading(true);
    setLoadingMessage(MESSAGE_FORMATTER.UPDATING());
    
    try {
      const updatedUser = await ApiService.updateUser(userId, userData);
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      
      toast({
        title: createEntityMessage('success_update', BUSINESS_TERMS.USER),
      });
    } catch (error) {
      toast({
        title: createEntityMessage('error_update', BUSINESS_TERMS.USER),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // 単一ユーザー削除
  const deleteUser = async (userId: string, userName: string) => {
    const confirmMessage = MESSAGE_FORMATTER.CONFIRM_DELETE(
      `${BUSINESS_TERMS.USER}「${userName}」`
    );
    
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    setLoadingMessage(MESSAGE_FORMATTER.DELETING());
    
    try {
      await ApiService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: createEntityMessage('success_delete', BUSINESS_TERMS.USER),
      });
    } catch (error) {
      toast({
        title: createEntityMessage('error_delete', BUSINESS_TERMS.USER),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // 複数ユーザー削除
  const deleteSelectedUsers = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: MESSAGE_FORMATTER.INFO_SELECT_ITEM(BUSINESS_TERMS.USERS),
        variant: "default",
      });
      return;
    }

    const confirmMessage = createMultipleDeleteMessage(
      selectedUsers.length, 
      BUSINESS_TERMS.USERS
    );
    
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    setLoadingMessage(MESSAGE_FORMATTER.DELETING());
    
    try {
      await Promise.all(
        selectedUsers.map(userId => ApiService.deleteUser(userId))
      );
      
      setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      
      toast({
        title: MESSAGE_FORMATTER.SUCCESS_DELETE(
          `${selectedUsers.length}件の${BUSINESS_TERMS.USERS}`
        ),
      });
    } catch (error) {
      toast({
        title: MESSAGE_FORMATTER.ERROR_DELETE(BUSINESS_TERMS.USERS),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* ローディング表示 */}
      {loading && (
        <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-md">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingMessage}</span>
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{BUSINESS_TERMS.USERS}</h1>
        <div className="space-x-2">
          <Button onClick={() => navigate('/users/create')}>
            {ACTION_LABELS.CREATE_NEW}{BUSINESS_TERMS.USER}
          </Button>
          {selectedUsers.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={deleteSelectedUsers}
              disabled={loading}
            >
              {ACTION_LABELS.DELETE} ({selectedUsers.length})
            </Button>
          )}
        </div>
      </div>

      {/* データテーブル */}
      <DataTable
        data={users}
        columns={createUserColumns(updateUser, deleteUser)}
        selectedRows={selectedUsers}
        onSelectionChange={setSelectedUsers}
        loading={loading}
        emptyMessage={MESSAGE_FORMATTER.INFO_NO_DATA(BUSINESS_TERMS.USERS)}
      />

      {/* 選択状態の表示 */}
      {selectedUsers.length > 0 && (
        <div className="text-sm text-gray-600">
          {createSelectionMessage(selectedUsers.length)}
        </div>
      )}
    </div>
  );
};
```

### ファイルアップロード機能

```typescript
const FileUploadComponent: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    // ファイル選択の確認
    toast({
      title: createFileMessage('info_file_selected', file.name),
    });

    // ファイルサイズチェック
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: MESSAGE_FORMATTER.WARNING_LARGE_FILE(),
        variant: "default",
      });
    }

    // 既存ファイルの上書き確認（例）
    const existingFile = await checkFileExists(file.name);
    if (existingFile) {
      const confirmOverwrite = window.confirm(
        createFileMessage('confirm_overwrite', file.name)
      );
      if (!confirmOverwrite) return;
    }

    setUploading(true);
    
    try {
      // アップロード開始
      toast({
        title: MESSAGE_FORMATTER.UPLOADING(),
      });

      await uploadFileWithProgress(file, (progress) => {
        setUploadProgress(progress);
      });

      // 成功
      toast({
        title: MESSAGE_FORMATTER.SUCCESS_UPLOAD(),
      });

      // データのインポート
      toast({
        title: MESSAGE_FORMATTER.IMPORTING(),
      });

      await importData(file);

      toast({
        title: MESSAGE_FORMATTER.SUCCESS_IMPORT('ユーザーデータ'),
      });

    } catch (error) {
      if (error.message.includes('format')) {
        toast({
          title: MESSAGE_FORMATTER.ERROR_FILE_FORMAT(),
          variant: "destructive",
        });
      } else if (error.message.includes('size')) {
        toast({
          title: MESSAGE_FORMATTER.ERROR_FILE_SIZE(),
          variant: "destructive",
        });
      } else {
        toast({
          title: MESSAGE_FORMATTER.ERROR_UPLOAD(),
          description: MESSAGE_FORMATTER.ERROR_UNKNOWN(),
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        disabled={uploading}
      />

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{MESSAGE_FORMATTER.UPLOADING()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">
            {uploadProgress}% 完了
          </div>
        </div>
      )}
    </div>
  );
};
```

## エラーハンドリング

### 安全なメッセージ生成

```typescript
import { formatMessage, MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

// 安全なメッセージ生成関数
const createSafeMessage = (
  formatter: (...args: any[]) => string,
  ...params: any[]
): string => {
  try {
    return formatMessage(formatter, ...params);
  } catch (error) {
    console.error('Message formatting error:', error);
    return 'メッセージの生成に失敗しました';
  }
};

// 使用例
const safeSuccessMessage = createSafeMessage(
  MESSAGE_FORMATTER.SUCCESS_CREATE,
  entityName || 'データ'
);

const safeErrorMessage = createSafeMessage(
  MESSAGE_FORMATTER.ERROR_FETCH,
  entityName || 'データ'
);
```

### エラー種別に応じたメッセージ選択

```typescript
const getErrorMessage = (error: any, entityName: string): string => {
  if (error.response) {
    // HTTPエラー
    switch (error.response.status) {
      case 400:
        return MESSAGE_FORMATTER.ERROR_INVALID_DATA();
      case 401:
        return MESSAGE_FORMATTER.ERROR_PERMISSION();
      case 403:
        return MESSAGE_FORMATTER.ERROR_PERMISSION();
      case 404:
        return MESSAGE_FORMATTER.ERROR_NOT_FOUND(entityName);
      case 408:
        return MESSAGE_FORMATTER.ERROR_TIMEOUT();
      case 500:
        return MESSAGE_FORMATTER.ERROR_SERVER();
      default:
        return MESSAGE_FORMATTER.ERROR_UNKNOWN();
    }
  } else if (error.request) {
    // ネットワークエラー
    return MESSAGE_FORMATTER.ERROR_NETWORK();
  } else {
    // その他のエラー
    return MESSAGE_FORMATTER.ERROR_UNKNOWN();
  }
};

// 使用例
const handleApiError = (error: any, operation: string, entityName: string) => {
  const errorMessage = getErrorMessage(error, entityName);
  
  toast({
    title: `${entityName}の${operation}に失敗しました`,
    description: errorMessage,
    variant: "destructive",
  });
};
```

## ベストプラクティス

### 1. 一貫したメッセージパターン

```typescript
// ✅ 良い例：一貫したパターン
const handleCrudOperation = async (
  operation: 'create' | 'update' | 'delete',
  entityName: string,
  apiCall: () => Promise<any>
) => {
  const loadingMessages = {
    create: MESSAGE_FORMATTER.CREATING(),
    update: MESSAGE_FORMATTER.UPDATING(),
    delete: MESSAGE_FORMATTER.DELETING(),
  };

  const successMessages = {
    create: MESSAGE_FORMATTER.SUCCESS_CREATE(entityName),
    update: MESSAGE_FORMATTER.SUCCESS_UPDATE(entityName),
    delete: MESSAGE_FORMATTER.SUCCESS_DELETE(entityName),
  };

  const errorMessages = {
    create: MESSAGE_FORMATTER.ERROR_CREATE(entityName),
    update: MESSAGE_FORMATTER.ERROR_UPDATE(entityName),
    delete: MESSAGE_FORMATTER.ERROR_DELETE(entityName),
  };

  setLoading(true);
  setLoadingMessage(loadingMessages[operation]);

  try {
    await apiCall();
    toast({ title: successMessages[operation] });
  } catch (error) {
    toast({ 
      title: errorMessages[operation],
      variant: "destructive" 
    });
  } finally {
    setLoading(false);
  }
};
```

### 2. メッセージの国際化対応準備

```typescript
// 将来の多言語対応を考慮した構造
interface MessageConfig {
  locale: 'ja' | 'en';
  formatter: typeof MESSAGE_FORMATTER;
}

const createLocalizedMessage = (
  config: MessageConfig,
  messageType: keyof typeof MESSAGE_FORMATTER,
  ...params: any[]
) => {
  const formatter = config.formatter[messageType];
  if (typeof formatter === 'function') {
    return formatter(...params);
  }
  return formatter;
};
```

### 3. メッセージのテスト

```typescript
// メッセージフォーマットのテスト例
describe('MESSAGE_FORMATTER', () => {
  it('should format success messages correctly', () => {
    expect(MESSAGE_FORMATTER.SUCCESS_CREATE('ユーザー'))
      .toBe('ユーザーを作成しました');
    
    expect(MESSAGE_FORMATTER.SUCCESS_UPDATE('デバイス'))
      .toBe('デバイスを更新しました');
  });

  it('should handle helper functions correctly', () => {
    expect(createEntityMessage('success_create', 'テスト'))
      .toBe('テストを作成しました');
    
    expect(createMultipleDeleteMessage(3, 'アイテム'))
      .toBe('選択した3件のアイテムを削除してもよろしいですか？この操作は取り消せません。');
  });

  it('should handle errors gracefully', () => {
    expect(formatMessage(() => { throw new Error(); }))
      .toBe('メッセージの生成に失敗しました');
  });
});
```

### 4. パフォーマンス最適化

```typescript
// メッセージ生成の最適化
import { useMemo } from 'react';

const OptimizedMessageComponent: React.FC<{ users: User[] }> = ({ users }) => {
  // メッセージ生成をメモ化
  const messages = useMemo(() => ({
    title: MESSAGE_FORMATTER.INFO_ITEMS_SELECTED(users.length),
    noData: MESSAGE_FORMATTER.INFO_NO_DATA(BUSINESS_TERMS.USERS),
    loading: MESSAGE_FORMATTER.LOADING_DATA(BUSINESS_TERMS.USERS),
  }), [users.length]);

  return (
    <div>
      <h2>{messages.title}</h2>
      {users.length === 0 ? (
        <p>{messages.noData}</p>
      ) : (
        <UserList users={users} />
      )}
    </div>
  );
};
```

このドキュメントに従ってメッセージフォーマット関数を使用することで、統一された日本語メッセージを提供し、ユーザーエクスペリエンスの向上を実現できます。