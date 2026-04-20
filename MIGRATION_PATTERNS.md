# MUIからshadcn/uiへの移行パターンガイド

このドキュメントでは、RTMSアプリケーションにおけるMaterial-UI (MUI)からshadcn/uiへの移行パターンとベストプラクティスについて説明します。

## 目次

1. [移行戦略](#移行戦略)
2. [コンポーネントマッピング](#コンポーネントマッピング)
3. [移行パターン](#移行パターン)
4. [ベストプラクティス](#ベストプラクティス)
5. [よくある問題と解決策](#よくある問題と解決策)
6. [移行チェックリスト](#移行チェックリスト)

## 移行戦略

### 段階的移行アプローチ

RTMSアプリケーションでは、以下の段階的アプローチを採用しています：

1. **基盤セットアップ**: Tailwind CSSとshadcn/uiの導入
2. **共通コンポーネント作成**: 統一されたデザインシステムの構築
3. **ページ単位での移行**: 機能領域ごとの順次移行
4. **MUI依存関係の削除**: 完全な移行後のクリーンアップ

### 移行順序

```
1. Users関連 (移行パターン確立)
2. Groups関連 (リレーション管理UI)
3. PLC関連 (複雑なフォーム)
4. Device関連 (複数設定ページ)
5. Classification関連 (階層構造)
6. Customer/Product関連 (マスターデータ)
7. Alarm関連 (ネストされたデータ)
8. Logging関連 (親子関係)
9. その他の設定ページ
10. 共通コンポーネント最終移行
```

## コンポーネントマッピング

### 基本コンポーネント

| MUI | shadcn/ui | 移行ポイント |
|-----|-----------|-------------|
| `Button` | `Button` | variantプロパティの変更 |
| `TextField` | `Input` | フォーム統合の変更 |
| `Paper` | `Card` | 構造の変更（Header/Content分離） |
| `Typography` | Tailwind classes | CSS-in-JSからユーティリティクラスへ |
| `Box` | `div` + Tailwind | レイアウトユーティリティの使用 |
| `Container` | `div` + container class | Tailwindのcontainerクラス |

#### Button移行例

```tsx
// MUI
import { Button } from '@mui/material';

<Button variant="contained" color="primary" onClick={handleClick}>
  送信
</Button>

// shadcn/ui
import { Button } from '@/components/ui/button';

<Button variant="default" onClick={handleClick}>
  送信
</Button>
```

#### TextField → Input + Form移行例

```tsx
// MUI
import { TextField } from '@mui/material';

<TextField
  label="名前"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={!!error}
  helperText={error}
  required
/>

// shadcn/ui + react-hook-form
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>名前</FormLabel>
      <FormControl>
        <Input placeholder="名前を入力" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### レイアウトコンポーネント

| MUI | shadcn/ui + カスタム | 移行ポイント |
|-----|---------------------|-------------|
| `AppBar` | `AppLayout` (カスタム) | ヘッダー構造の再設計 |
| `Drawer` | `Sheet` | サイドバーナビゲーション |
| `Breadcrumbs` | `PageHeader` (カスタム) | パンくずリストの統合 |
| `Grid` | Tailwind Flexbox/Grid | レスポンシブレイアウト |

#### AppBar → AppLayout移行例

```tsx
// MUI
import { AppBar, Toolbar, Typography, Drawer } from '@mui/material';

<AppBar position="fixed">
  <Toolbar>
    <Typography variant="h6">RTMS</Typography>
  </Toolbar>
</AppBar>
<Drawer variant="permanent">
  {/* サイドバーコンテンツ */}
</Drawer>

// shadcn/ui + カスタム
import { AppLayout } from '@/components/layout/app-layout';

<AppLayout>
  {/* ページコンテンツ */}
</AppLayout>
```

### データ表示コンポーネント

| MUI | shadcn/ui + カスタム | 移行ポイント |
|-----|---------------------|-------------|
| `DataGrid` | `DataTable` (カスタム) | @tanstack/react-tableの使用 |
| `Table` | `Table` | 基本構造は類似 |
| `Chip` | `Badge` | スタイルプロパティの変更 |
| `List` | カスタム実装 | Tailwindでのリストスタイリング |

#### DataGrid → DataTable移行例

```tsx
// MUI
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: '名前', width: 150 },
];

<DataGrid
  rows={users}
  columns={columns}
  pageSize={10}
  checkboxSelection
/>

// shadcn/ui + @tanstack/react-table
import { DataTable } from '@/components/common/data-table';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="名前" />
    ),
  },
];

<DataTable
  columns={columns}
  data={users}
  searchKey="name"
  searchPlaceholder="名前で検索..."
/>
```

### フォームコンポーネント

| MUI | shadcn/ui | 移行ポイント |
|-----|-----------|-------------|
| `FormControl` | `FormField` | react-hook-formとの統合 |
| `FormLabel` | `FormLabel` | 基本的に同じ |
| `FormHelperText` | `FormDescription` | 説明テキスト |
| `FormControlLabel` | カスタム実装 | チェックボックス/ラジオボタン |
| `Select` | `Select` | 構造の変更 |

#### Select移行例

```tsx
// MUI
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

<FormControl fullWidth>
  <InputLabel>ロール</InputLabel>
  <Select value={role} onChange={handleChange}>
    <MenuItem value="SU">スーパーユーザー</MenuItem>
    <MenuItem value="AD">管理者</MenuItem>
    <MenuItem value="CU">一般ユーザー</MenuItem>
  </Select>
</FormControl>

// shadcn/ui
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<FormField
  control={form.control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>ロール</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="ロールを選択" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="SU">スーパーユーザー</SelectItem>
          <SelectItem value="AD">管理者</SelectItem>
          <SelectItem value="CU">一般ユーザー</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### フィードバックコンポーネント

| MUI | shadcn/ui | 移行ポイント |
|-----|-----------|-------------|
| `Alert` | `Alert` | 基本的に同じ構造 |
| `Snackbar` | `Toast` | useToastフックの使用 |
| `Dialog` | `Dialog` | 構造は類似 |
| `CircularProgress` | `LoadingSpinner` (カスタム) | カスタムローディング |

#### Snackbar → Toast移行例

```tsx
// MUI
import { Snackbar, Alert } from '@mui/material';

const [open, setOpen] = useState(false);
const [message, setMessage] = useState('');

<Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
  <Alert severity="success">{message}</Alert>
</Snackbar>

// shadcn/ui
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// 使用時
toast({
  title: "成功",
  description: "ユーザーが作成されました",
});
```

## 移行パターン

### 1. ページレベル移行パターン

#### リストページの移行

```tsx
// 移行前（MUI）
import { 
  Container, 
  Typography, 
  Button, 
  Paper 
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

function UsersPage() {
  return (
    <Container>
      <Typography variant="h4">ユーザー一覧</Typography>
      <Button variant="contained" onClick={() => navigate('/users/create')}>
        新規作成
      </Button>
      <Paper>
        <DataGrid rows={users} columns={columns} />
      </Paper>
    </Container>
  );
}

// 移行後（shadcn/ui）
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { createUserColumns } from '@/components/features/users/user-columns';

function UsersPage() {
  const columns = createUserColumns(handleEdit, handleDelete);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="ユーザー一覧"
        actions={
          <Button onClick={() => navigate('/users/create')}>
            新規作成
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="名前で検索..."
      />
    </div>
  );
}
```

#### フォームページの移行

```tsx
// 移行前（MUI）
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography 
} from '@mui/material';

function UserCreatePage() {
  return (
    <Container>
      <Typography variant="h4">ユーザー作成</Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained">
            作成
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

// 移行後（shadcn/ui）
import { FormWrapper } from '@/components/common/form-wrapper';
import { UserForm } from '@/components/UserForm';

function UserCreatePage() {
  return (
    <FormWrapper
      title="ユーザー作成"
      description="新しいユーザーを作成します"
      onCancel={() => navigate(-1)}
    >
      <UserForm
        onSubmit={handleSubmit}
        initialData={{}}
      />
    </FormWrapper>
  );
}
```

### 2. コンポーネントレベル移行パターン

#### カラム定義の移行

```tsx
// 移行前（MUI DataGrid）
const columns = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 90 
  },
  { 
    field: 'name', 
    headerName: '名前', 
    width: 150 
  },
  {
    field: 'actions',
    headerName: 'アクション',
    width: 150,
    renderCell: (params) => (
      <div>
        <IconButton onClick={() => handleEdit(params.row.id)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => handleDelete(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      </div>
    ),
  },
];

// 移行後（@tanstack/react-table）
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { ActionButtons } from '@/components/common/action-buttons';

export const createUserColumns = (
  onEdit: (userId: string) => void,
  onDelete: (userId: string) => void
): ColumnDef<User>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="名前" />
    ),
  },
  {
    id: 'actions',
    header: 'アクション',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <ActionButtons
          onEdit={() => onEdit(user.id)}
          onDelete={() => onDelete(user.id)}
        />
      );
    },
  },
];
```

#### フォームバリデーションの移行

```tsx
// 移行前（MUI + 手動バリデーション）
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};
  if (!name) newErrors.name = '名前は必須です';
  if (!email) newErrors.email = 'メールは必須です';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e) => {
  e.preventDefault();
  if (validateForm()) {
    // 送信処理
  }
};

// 移行後（react-hook-form + zod）
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
});

type FormData = z.infer<typeof formSchema>;

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: '',
    email: '',
  },
});

const onSubmit = (data: FormData) => {
  // 送信処理（バリデーションは自動）
};
```

### 3. スタイリング移行パターン

#### CSS-in-JSからTailwindへ

```tsx
// 移行前（MUI sx prop）
<Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
    borderBottom: 1,
    borderColor: 'divider',
  }}
>
  <Typography variant="h6">タイトル</Typography>
  <Button variant="contained">アクション</Button>
</Box>

// 移行後（Tailwind CSS）
<div className="flex items-center justify-between p-4 border-b border-border">
  <h2 className="text-lg font-semibold">タイトル</h2>
  <Button>アクション</Button>
</div>
```

#### テーマカラーの移行

```tsx
// 移行前（MUI Theme）
<Button 
  sx={{ 
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    '&:hover': {
      backgroundColor: 'primary.dark',
    }
  }}
>
  ボタン
</Button>

// 移行後（Tailwind + CSS Variables）
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  ボタン
</Button>
```

## ベストプラクティス

### 1. 段階的移行

- **一度に一つのページを移行**: 複数ページの同時移行は避ける
- **共通コンポーネントを先に作成**: 移行前に統一されたコンポーネントを準備
- **既存機能の維持**: 移行中も既存の機能が動作することを確認

### 2. コンポーネント設計

- **再利用可能な設計**: 複数のページで使用できるコンポーネントを作成
- **適切な抽象化**: 過度に抽象化せず、実際の使用パターンに基づいて設計
- **TypeScript活用**: 型安全性を確保し、開発効率を向上

### 3. フォーム処理

- **react-hook-formの活用**: パフォーマンスと使いやすさを両立
- **zodでのバリデーション**: 型安全なバリデーションスキーマ
- **統一されたエラー表示**: FormMessageコンポーネントの使用

### 4. テーブル実装

- **@tanstack/react-tableの使用**: 高機能で柔軟なテーブル
- **カラム定義の分離**: 再利用可能なカラム定義ファイル
- **統一されたアクションボタン**: ActionButtonsコンポーネントの使用

### 5. スタイリング

- **Tailwind CSSの活用**: ユーティリティファーストのアプローチ
- **CSS変数の使用**: テーマカラーの統一管理
- **レスポンシブデザイン**: モバイルファーストのアプローチ

## よくある問題と解決策

### 1. フォームバリデーションの移行

**問題**: MUIのTextFieldのerrorプロパティからreact-hook-formへの移行

**解決策**:
```tsx
// 問題のあるパターン
<TextField
  error={!!errors.name}
  helperText={errors.name}
/>

// 推奨パターン
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>名前</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* エラーは自動表示 */}
    </FormItem>
  )}
/>
```

### 2. テーブルのソート・フィルタリング

**問題**: MUI DataGridの機能をreact-tableで再現

**解決策**:
```tsx
// DataTableコンポーネントで統一された実装を提供
<DataTable
  columns={columns}
  data={data}
  searchKey="name" // 検索機能
  // ソート・ページネーションは自動で有効
/>
```

### 3. レイアウトの一貫性

**問題**: ページごとに異なるレイアウト構造

**解決策**:
```tsx
// PageHeaderとFormWrapperで統一
<div className="space-y-6">
  <PageHeader title="タイトル" />
  {/* コンテンツ */}
</div>

// フォームページの場合
<FormWrapper title="タイトル" onSubmit={handleSubmit}>
  {/* フォームフィールド */}
</FormWrapper>
```

### 4. アイコンの移行

**問題**: MUI Iconsからlucide-reactへの移行

**解決策**:
```tsx
// 移行前
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// 移行後
import { Pencil, Trash2 } from 'lucide-react';

// 使用方法
<Button size="sm" variant="ghost">
  <Pencil className="h-4 w-4" />
</Button>
```

### 5. 条件付きスタイリング

**問題**: MUI sx propの条件付きスタイル

**解決策**:
```tsx
// cn関数を使用した条件付きクラス
import { cn } from '@/lib/utils';

<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  コンテンツ
</div>
```

## 移行チェックリスト

### ページ移行時のチェックポイント

- [ ] **基本機能**: すべての既存機能が正常に動作する
- [ ] **デザイン一貫性**: 他のページと一貫したデザイン
- [ ] **レスポンシブ**: モバイル・タブレットでの表示確認
- [ ] **アクセシビリティ**: キーボードナビゲーション・スクリーンリーダー対応
- [ ] **パフォーマンス**: ページ読み込み速度の確認
- [ ] **エラーハンドリング**: 適切なエラー表示
- [ ] **バリデーション**: フォームバリデーションの動作確認
- [ ] **TypeScript**: 型エラーがないことを確認

### コンポーネント移行時のチェックポイント

- [ ] **プロパティ**: 必要なプロパティがすべて実装されている
- [ ] **イベント**: すべてのイベントハンドラーが正常に動作する
- [ ] **スタイル**: デザインシステムに準拠している
- [ ] **再利用性**: 他のページでも使用可能な設計
- [ ] **ドキュメント**: JSDocコメントが適切に記述されている
- [ ] **テスト**: 単体テストが実装されている（オプション）

### 最終確認

- [ ] **MUI依存関係**: package.jsonからMUIライブラリが削除されている
- [ ] **ビルド**: エラーなくビルドが完了する
- [ ] **バンドルサイズ**: バンドルサイズが削減されている
- [ ] **全ページ動作**: すべてのページが正常に動作する
- [ ] **ブラウザ互換性**: 対象ブラウザでの動作確認
- [ ] **ドキュメント**: 移行ドキュメントが更新されている

## まとめ

MUIからshadcn/uiへの移行は、以下の利点をもたらします：

1. **統一されたデザインシステム**: 一貫したUI/UX
2. **パフォーマンス向上**: バンドルサイズの削減
3. **保守性の向上**: TypeScriptとTailwind CSSによる型安全性
4. **開発効率の向上**: 再利用可能なコンポーネント

このガイドのパターンに従って移行を進めることで、安全かつ効率的にモダンなUIライブラリへの移行を完了できます。

移行中に問題が発生した場合は、このドキュメントの「よくある問題と解決策」セクションを参照するか、既存の移行済みコンポーネントを参考にしてください。