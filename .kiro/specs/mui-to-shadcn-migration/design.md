# Design Document

## Overview

このドキュメントは、RTMSフロントエンドアプリケーションをMUIからshadcn/uiへ移行するための技術設計を定義します。移行の主な目標は以下の通りです：

1. **統一されたデザインシステムの確立**: すべてのページで一貫したUI/UXを提供
2. **モダンなコンポーネントアーキテクチャ**: Tailwind CSSとRadix UIをベースにした保守性の高いコンポーネント
3. **段階的な移行**: 既存機能を維持しながら、ページ単位で順次移行
4. **パフォーマンス向上**: バンドルサイズの削減とレンダリング最適化

## Architecture

### 全体アーキテクチャ

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui基本コンポーネント
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── select.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── layout/                # レイアウトコンポーネント
│   │   │   ├── app-layout.tsx    # メインレイアウト
│   │   │   ├── page-header.tsx   # ページヘッダー
│   │   │   ├── sidebar.tsx       # サイドバーナビゲーション
│   │   │   └── breadcrumb.tsx    # パンくずリスト
│   │   ├── common/                # 共通コンポーネント
│   │   │   ├── data-table.tsx    # 統一されたテーブルコンポーネント
│   │   │   ├── form-wrapper.tsx  # 統一されたフォームラッパー
│   │   │   ├── action-buttons.tsx # アクションボタングループ
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── error-message.tsx
│   │   │   └── confirmation-dialog.tsx
│   │   └── features/              # 機能別コンポーネント
│   │       ├── users/
│   │       ├── devices/
│   │       ├── plcs/
│   │       └── ...
│   ├── pages/                     # ページコンポーネント
│   ├── lib/                       # ユーティリティ
│   │   ├── utils.ts              # shadcn/ui utilities
│   │   └── cn.ts                 # classname helper
│   ├── hooks/                     # カスタムフック
│   │   ├── use-toast.ts
│   │   └── use-form-validation.ts
│   └── styles/
│       └── globals.css            # Tailwind + shadcn/ui styles
├── components.json                # shadcn/ui設定
├── tailwind.config.js            # Tailwind CSS設定
└── tsconfig.json                 # TypeScript設定（パスエイリアス）
```

### レイヤー構造

1. **UIレイヤー**: shadcn/ui基本コンポーネント（`components/ui/`）
2. **共通レイヤー**: アプリケーション全体で使用する共通コンポーネント（`components/common/`）
3. **レイアウトレイヤー**: ページ構造を定義するコンポーネント（`components/layout/`）
4. **機能レイヤー**: 各機能に特化したコンポーネント（`components/features/`）
5. **ページレイヤー**: ルーティングされるページコンポーネント（`pages/`）

## Components and Interfaces

### 統一されたデザインシステム

#### 1. カラーパレット

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: 'hsl(221.2 83.2% 53.3%)',
          foreground: 'hsl(210 40% 98%)',
        },
        // Secondary colors
        secondary: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
        // Destructive (for delete actions)
        destructive: {
          DEFAULT: 'hsl(0 84.2% 60.2%)',
          foreground: 'hsl(210 40% 98%)',
        },
        // Muted (for disabled states)
        muted: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(215.4 16.3% 46.9%)',
        },
        // Accent (for highlights)
        accent: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
        // Border
        border: 'hsl(214.3 31.8% 91.4%)',
        // Input
        input: 'hsl(214.3 31.8% 91.4%)',
        // Ring (focus state)
        ring: 'hsl(221.2 83.2% 53.3%)',
      },
    },
  },
}
```

#### 2. タイポグラフィ

```typescript
// 統一されたテキストスタイル
const typography = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  p: 'leading-7 [&:not(:first-child)]:mt-6',
  lead: 'text-xl text-muted-foreground',
  large: 'text-lg font-semibold',
  small: 'text-sm font-medium leading-none',
  muted: 'text-sm text-muted-foreground',
}
```

#### 3. スペーシングルール

```typescript
// 統一されたスペーシング
const spacing = {
  pageContainer: 'container mx-auto py-6 px-4 md:px-6',
  sectionGap: 'space-y-6',
  cardPadding: 'p-6',
  formGap: 'space-y-4',
  buttonGroup: 'flex gap-2',
}
```

### 統一されたページレイアウトパターン

#### PageHeader コンポーネント

すべてのページで統一されたヘッダーを提供します。

```typescript
// components/layout/page-header.tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 border-b">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
```

#### DataTable コンポーネント

すべてのリストページで統一されたテーブルを提供します。

```typescript
// components/common/data-table.tsx
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center">
          <Input
            placeholder={searchPlaceholder || "Search..."}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          {/* Table implementation */}
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
```

#### FormWrapper コンポーネント

すべてのフォームページで統一されたレイアウトを提供します。

```typescript
// components/common/form-wrapper.tsx
interface FormWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function FormWrapper({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  isLoading = false,
}: FormWrapperProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {children}
            <div className="flex gap-2 justify-end pt-4 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### ActionButtons コンポーネント

テーブル内のアクションボタンを統一します。

```typescript
// components/common/action-buttons.tsx
interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  customActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
    icon?: React.ReactNode;
  }>;
}

export function ActionButtons({
  onEdit,
  onDelete,
  onView,
  customActions,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {onView && (
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
      {customActions?.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'ghost'}
          size="sm"
          onClick={action.onClick}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
```

### AppLayout コンポーネント

統一されたアプリケーションレイアウトを提供します。

```typescript
// components/layout/app-layout.tsx
export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {location.pathname !== '/' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold">RTMS - Device Management</h2>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64">
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 md:px-6">
        {children}
      </main>
    </div>
  );
}
```

## Data Models

### フォームバリデーション

react-hook-formとzodを使用した統一されたバリデーション。

```typescript
// 例: User フォームスキーマ
import { z } from 'zod';

export const userFormSchema = z.object({
  id: z.string()
    .min(1, 'Employee ID is required')
    .max(10, 'Employee ID must be at most 10 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Employee ID must be alphanumeric'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  role: z.enum(['SU', 'AD', 'CU']),
  password: z.string().optional(),
}).refine((data) => {
  if (data.role !== 'CU' && !data.password) {
    return false;
  }
  return true;
}, {
  message: 'Password is required for Super User and Admin User',
  path: ['password'],
});

export type UserFormData = z.infer<typeof userFormSchema>;
```

### テーブルカラム定義

統一されたカラム定義パターン。

```typescript
// 例: Users テーブルカラム
import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/types/user';

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return <Badge variant="outline">{role}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <ActionButtons
          onEdit={() => navigate(`/users/${user.id}/edit`)}
          onDelete={() => handleDelete(user.id)}
        />
      );
    },
  },
];
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: フォームバリデーションの一貫性

*For any* フォームコンポーネント、バリデーションルールが定義されている場合、無効なデータを送信しようとすると、システムはエラーメッセージを表示し、送信を防ぐ
**Validates: Requirements 4.2, 4.3**

### Property 2: 共通コンポーネントのスタイル一貫性

*For any* ページで共通コンポーネント（PageHeader、DataTable、FormWrapper、ActionButtons）を使用する場合、システムは同じスタイルとレイアウトパターンを適用する
**Validates: Requirements 13.4**

## Error Handling

### エラー表示の統一

すべてのエラーは統一されたコンポーネントで表示します。

```typescript
// components/common/error-message.tsx
interface ErrorMessageProps {
  title?: string;
  message: string;
  retry?: () => void;
}

export function ErrorMessage({ title = "Error", message, retry }: ErrorMessageProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry}>
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

### フォームエラーの統一

react-hook-formのエラーを統一されたスタイルで表示します。

```typescript
// フォーム内でのエラー表示
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* 統一されたエラー表示 */}
    </FormItem>
  )}
/>
```

### API エラーハンドリング

```typescript
// hooks/use-api-error.ts
export function useApiError() {
  const { toast } = useToast();

  const handleError = (error: unknown) => {
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
    
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  };

  return { handleError };
}
```

## Testing Strategy

### Unit Testing

各コンポーネントの単体テストを実装します。

**テスト対象:**
- 基本的なレンダリング
- プロパティの受け渡し
- イベントハンドラーの動作
- 条件付きレンダリング

**テストツール:**
- Jest
- React Testing Library

**例:**

```typescript
// components/common/page-header.test.tsx
describe('PageHeader', () => {
  it('renders title correctly', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<PageHeader title="Test" description="Test Description" />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    const actions = <Button>Action</Button>;
    render(<PageHeader title="Test" actions={actions} />);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
```

### Integration Testing

ページレベルの統合テストを実装します。

**テスト対象:**
- ページ全体のレンダリング
- ユーザーインタラクション
- API統合
- ナビゲーション

**例:**

```typescript
// pages/users-page.test.tsx
describe('UsersPage', () => {
  it('displays users list', async () => {
    const mockUsers = [
      { id: '1', name: 'User 1', role: 'CU' },
      { id: '2', name: 'User 2', role: 'AD' },
    ];
    
    jest.spyOn(api, 'getUsers').mockResolvedValue(mockUsers);
    
    render(<UsersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
  });

  it('navigates to create page when clicking create button', async () => {
    render(<UsersPage />);
    
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/users/create');
  });
});
```

### Visual Regression Testing

統一されたデザインシステムを維持するため、ビジュアルリグレッションテストを実装します。

**テストツール:**
- Storybook
- Chromatic または Percy

**対象:**
- すべての共通コンポーネント
- 主要なページレイアウト
- 各種状態（loading、error、empty）

### E2E Testing

主要なユーザーフローをE2Eテストで検証します。

**テストツール:**
- Playwright MCP（Model Context Protocol統合）

**テスト戦略:**
- Playwright MCPを使用して、実際のブラウザでページをテスト
- 移行後の各ページで視覚的な確認とインタラクションテストを実行
- 既存の機能が正しく動作することを確認

**テストシナリオ:**
- ユーザー作成フロー（フォーム入力、バリデーション、送信）
- デバイス設定フロー（デバイス作成、編集、削除）
- データダウンロードフロー（デバイス選択、ダウンロード実行）
- テーブル操作（ソート、フィルタリング、ページネーション）
- ナビゲーション（サイドバー、戻るボタン、パンくずリスト）

**Playwright MCPの利点:**
- ブラウザを実際に起動してテスト
- スクリーンショットで視覚的な確認が可能
- インタラクティブなデバッグが可能
- 移行前後の比較が容易

## Migration Strategy

### Phase 1: 基盤セットアップ（Requirement 1-2）

1. Tailwind CSSのインストールと設定
2. shadcn/uiの初期化
3. TypeScript設定の更新
4. 基本コンポーネントのインストール
5. 既存アプリケーションの動作確認

**成功基準:**
- 既存のMUIページが正常に動作する
- shadcn/uiコンポーネントが利用可能

### Phase 2: 共通コンポーネントの作成（Requirement 13の一部）

1. PageHeaderコンポーネントの実装
2. DataTableコンポーネントの実装
3. FormWrapperコンポーネントの実装
4. ActionButtonsコンポーネントの実装
5. AppLayoutコンポーネントの実装

**成功基準:**
- すべての共通コンポーネントが実装され、テストが通過する
- Storybookでコンポーネントが確認できる

### Phase 3: 最初のページ移行（Requirement 3-4）

1. UsersPageの移行
2. UserListコンポーネントの移行
3. UserCreatePageの移行
4. UserEditPageの移行
5. UserFormコンポーネントの移行

**成功基準:**
- すべてのユーザー関連ページが正常に動作する
- 既存のAPI統合が維持される
- テストが通過する

### Phase 4: 順次ページ移行（Requirement 5-12）

各機能領域を順次移行します：

1. Groups関連（Requirement 5）
2. PLC関連（Requirement 6）
3. Device関連（Requirement 7）
4. Classification関連（Requirement 8）
5. Customer/Product関連（Requirement 9）
6. Alarm関連（Requirement 10）
7. Logging関連（Requirement 11）
8. その他の設定ページ（Requirement 12）

**各機能領域の成功基準:**
- すべてのページが正常に動作する
- 既存の機能が維持される
- テストが通過する
- デザインシステムに準拠している

### Phase 5: 最終調整とクリーンアップ（Requirement 13-14）

1. 残りの共通コンポーネント（CSVImporter、ResultDialog）の移行
2. すべてのページでの統一性確認
3. MUI依存関係の削除
4. ビルドサイズの確認
5. パフォーマンステスト

**成功基準:**
- MUIへの参照が完全に削除される
- バンドルサイズが削減される
- すべてのテストが通過する
- ビジュアルリグレッションテストが通過する

### Phase 6: ドキュメント作成（Requirement 15）

1. コンポーネント使用ガイドの作成
2. 移行パターンドキュメントの作成
3. スタイリングガイドの作成
4. トラブルシューティングガイドの作成

**成功基準:**
- すべてのドキュメントが作成される
- 開発者が新しいページを作成できる

## Implementation Notes

### Tailwind CSS設定

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### TypeScript設定

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### components.json設定

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### グローバルCSS

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Performance Considerations

### バンドルサイズの最適化

1. **Tree Shaking**: shadcn/uiはコンポーネントをコピーして使用するため、使用しないコードは自動的に除外されます
2. **Code Splitting**: React.lazyを使用してページレベルでコード分割を実装
3. **Dynamic Imports**: 大きなコンポーネント（DataTable、Chart）は動的インポートを使用

```typescript
// 例: 動的インポート
const DataTable = lazy(() => import('@/components/common/data-table'));

function UsersPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DataTable columns={columns} data={data} />
    </Suspense>
  );
}
```

### レンダリング最適化

1. **React.memo**: 頻繁に再レンダリングされるコンポーネントをメモ化
2. **useMemo/useCallback**: 高コストな計算とコールバックをメモ化
3. **Virtual Scrolling**: 大きなリストには@tanstack/react-virtualを使用

### 画像最適化

1. 適切な画像フォーマット（WebP）の使用
2. 遅延読み込み（lazy loading）の実装
3. レスポンシブ画像の使用

## Accessibility

### ARIA属性

すべてのインタラクティブ要素に適切なARIA属性を設定します。

```typescript
// 例: アクセシブルなボタン
<Button
  aria-label="Delete user"
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### キーボードナビゲーション

すべてのインタラクティブ要素がキーボードでアクセス可能であることを確認します。

### フォーカス管理

適切なフォーカス順序とフォーカスインジケーターを実装します。

### スクリーンリーダー対応

適切なセマンティックHTMLとARIAラベルを使用します。

## Security Considerations

### XSS対策

1. ユーザー入力のサニタイゼーション
2. dangerouslySetInnerHTMLの使用を避ける
3. Content Security Policyの設定

### CSRF対策

1. APIリクエストにCSRFトークンを含める
2. SameSite Cookie属性の設定

### 認証・認可

1. JWTトークンの安全な保存
2. ロールベースのアクセス制御
3. セッションタイムアウトの実装

## Maintenance and Documentation

### コンポーネントドキュメント

各コンポーネントにJSDocコメントを追加します。

```typescript
/**
 * PageHeader コンポーネント
 * 
 * すべてのページで統一されたヘッダーを提供します。
 * 
 * @param title - ページタイトル
 * @param description - ページの説明（オプション）
 * @param actions - ヘッダー右側に表示するアクション（オプション）
 * @param breadcrumbs - パンくずリスト（オプション）
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="Users"
 *   description="Manage system users"
 *   actions={<Button>Create User</Button>}
 * />
 * ```
 */
export function PageHeader({ ... }: PageHeaderProps) {
  // ...
}
```

### Storybook

すべての共通コンポーネントにStorybookストーリーを作成します。

```typescript
// components/layout/page-header.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './page-header';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Page Title',
  },
};

export const WithDescription: Story = {
  args: {
    title: 'Page Title',
    description: 'This is a page description',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Page Title',
    actions: <Button>Create New</Button>,
  },
};
```

### 移行ガイド

開発者向けの詳細な移行ガイドを作成します。

**内容:**
1. MUIからshadcn/uiへのコンポーネントマッピング
2. スタイリングの移行方法
3. フォームバリデーションの移行方法
4. 一般的な問題と解決策
5. ベストプラクティス

## Conclusion

この設計により、RTMSフロントエンドアプリケーションは統一されたデザインシステムを持ち、保守性が高く、パフォーマンスに優れたモダンなUIに生まれ変わります。段階的な移行アプローチにより、既存の機能を維持しながら、安全に移行を進めることができます。
