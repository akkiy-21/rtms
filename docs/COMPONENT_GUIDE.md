# コンポーネント使用ガイド

このガイドでは、RTMSアプリケーションで使用するshadcn/uiコンポーネントと共通コンポーネントの使用方法について説明します。

## 目次

1. [基本的なshadcn/uiコンポーネント](#基本的なshadcnuiコンポーネント)
2. [レイアウトコンポーネント](#レイアウトコンポーネント)
3. [共通コンポーネント](#共通コンポーネント)
4. [フォームコンポーネント](#フォームコンポーネント)
5. [テーブルコンポーネント](#テーブルコンポーネント)
6. [ベストプラクティス](#ベストプラクティス)

## 基本的なshadcn/uiコンポーネント

### Button

ボタンコンポーネントは様々なバリアントとサイズを提供します。

```tsx
import { Button } from "@/components/ui/button";

// 基本的な使用方法
<Button>デフォルトボタン</Button>

// バリアント
<Button variant="default">デフォルト</Button>
<Button variant="destructive">削除</Button>
<Button variant="outline">アウトライン</Button>
<Button variant="secondary">セカンダリ</Button>
<Button variant="ghost">ゴースト</Button>
<Button variant="link">リンク</Button>

// サイズ
<Button size="default">デフォルト</Button>
<Button size="sm">小</Button>
<Button size="lg">大</Button>
<Button size="icon">アイコン</Button>

// アイコン付きボタン
import { Plus } from "lucide-react";
<Button>
  <Plus className="mr-2 h-4 w-4" />
  新規作成
</Button>

// ローディング状態
<Button disabled={isLoading}>
  {isLoading ? "送信中..." : "送信"}
</Button>
```

### Input

入力フィールドコンポーネントです。

```tsx
import { Input } from "@/components/ui/input";

// 基本的な使用方法
<Input placeholder="テキストを入力してください" />

// 型指定
<Input type="email" placeholder="メールアドレス" />
<Input type="password" placeholder="パスワード" />
<Input type="number" placeholder="数値" />

// 無効化
<Input disabled placeholder="無効化された入力" />

// カスタムスタイル
<Input className="max-w-sm" placeholder="幅制限" />
```

### Card

カードコンポーネントはコンテンツをグループ化するために使用します。

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>カードタイトル</CardTitle>
    <CardDescription>カードの説明文</CardDescription>
  </CardHeader>
  <CardContent>
    <p>カードのコンテンツ</p>
  </CardContent>
</Card>
```

## レイアウトコンポーネント

### PageHeader

すべてのページで統一されたヘッダーを提供します。

```tsx
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

// 基本的な使用方法
<PageHeader title="ページタイトル" />

// 説明付き
<PageHeader 
  title="ユーザー管理" 
  description="システムユーザーを管理します" 
/>

// アクション付き
<PageHeader 
  title="ユーザー一覧" 
  actions={
    <Button onClick={() => navigate('/users/create')}>
      新規作成
    </Button>
  }
/>

// パンくずリスト付き
<PageHeader 
  title="ユーザー編集"
  breadcrumbs={[
    { label: "ホーム", href: "/" },
    { label: "ユーザー", href: "/users" },
    { label: "編集" }
  ]}
/>
```

### AppLayout

アプリケーション全体のレイアウトを提供します。

```tsx
import { AppLayout } from "@/components/layout/app-layout";

function App() {
  return (
    <AppLayout>
      {/* ページコンテンツ */}
    </AppLayout>
  );
}
```

## 共通コンポーネント

### FormWrapper

フォームページで統一されたレイアウトを提供します。

```tsx
import { FormWrapper } from "@/components/common/form-wrapper";
import { useNavigate } from "react-router-dom";

function UserCreatePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // フォーム送信処理
    setIsLoading(false);
  };

  return (
    <FormWrapper
      title="ユーザー作成"
      description="新しいユーザーを作成します"
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
      submitLabel="作成"
      isLoading={isLoading}
    >
      {/* フォームフィールド */}
    </FormWrapper>
  );
}
```

### DataTable

統一されたテーブル表示を提供します。

```tsx
import { DataTable } from "@/components/common/data-table";
import { ColumnDef } from "@tanstack/react-table";

// カラム定義
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name", 
    header: "名前",
  },
  // その他のカラム...
];

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title="ユーザー一覧" />
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="名前で検索..."
        isLoading={isLoading}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
      />
    </div>
  );
}
```

### ActionButtons

テーブル内のアクションボタンを統一します。

```tsx
import { ActionButtons } from "@/components/common/action-buttons";

// カラム定義内で使用
{
  id: "actions",
  cell: ({ row }) => {
    const user = row.original;
    return (
      <ActionButtons
        onEdit={() => navigate(`/users/${user.id}/edit`)}
        onDelete={() => handleDelete(user.id)}
        onView={() => navigate(`/users/${user.id}`)}
        customActions={[
          {
            label: "設定",
            onClick: () => navigate(`/users/${user.id}/settings`),
            icon: <Settings className="h-4 w-4" />
          }
        ]}
      />
    );
  },
}
```

## フォームコンポーネント

### react-hook-formとzodを使用したフォーム

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// バリデーションスキーマ
const formSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
});

type FormData = z.infer<typeof formSchema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input placeholder="名前を入力" {...field} />
              </FormControl>
              <FormDescription>
                表示名として使用されます
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">送信</Button>
      </form>
    </Form>
  );
}
```

### Select コンポーネント

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// フォーム内での使用
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

## テーブルコンポーネント

### カラム定義の詳細

```tsx
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/common/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { ActionButtons } from "@/components/common/action-buttons";

const columns: ColumnDef<User>[] = [
  // ソート可能なカラム
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  
  // カスタム表示
  {
    accessorKey: "role",
    header: "ロール",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleLabels = {
        SU: "スーパーユーザー",
        AD: "管理者",
        CU: "一般ユーザー"
      };
      return <Badge variant="outline">{roleLabels[role]}</Badge>;
    },
  },
  
  // アクションカラム
  {
    id: "actions",
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

### 検索とフィルタリング

```tsx
// 検索機能付きテーブル
<DataTable
  columns={columns}
  data={data}
  searchKey="name"  // 検索対象のキー
  searchPlaceholder="名前で検索..."
/>

// 複数カラムでの検索（カスタム実装）
const [globalFilter, setGlobalFilter] = useState("");

const filteredData = useMemo(() => {
  if (!globalFilter) return data;
  return data.filter(item => 
    item.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
    item.id.toLowerCase().includes(globalFilter.toLowerCase())
  );
}, [data, globalFilter]);
```

## ベストプラクティス

### 1. コンポーネントの命名規則

- コンポーネントファイル名はPascalCaseを使用
- フォルダ構造は機能別に整理
- 共通コンポーネントは`components/common/`に配置
- 機能固有のコンポーネントは`components/features/[feature]/`に配置

### 2. スタイリング

```tsx
// Tailwind CSSクラスの使用
<div className="flex items-center justify-between p-4 border-b">
  <h2 className="text-lg font-semibold">タイトル</h2>
  <Button size="sm">アクション</Button>
</div>

// cn関数を使用した条件付きスタイル
import { cn } from "@/lib/utils";

<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  コンテンツ
</div>
```

### 3. アクセシビリティ

```tsx
// 適切なARIA属性の使用
<Button
  aria-label="ユーザーを削除"
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4" />
</Button>

// フォームのラベル関連付け
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>メールアドレス</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
    </FormItem>
  )}
/>
```

### 4. エラーハンドリング

```tsx
import { useApiError } from "@/hooks/use-api-error";

function MyComponent() {
  const { handleError } = useApiError();

  const fetchData = async () => {
    try {
      const response = await api.getData();
      setData(response);
    } catch (error) {
      handleError(error); // 統一されたエラー表示
    }
  };
}
```

### 5. ローディング状態

```tsx
import { LoadingSpinner } from "@/components/common/loading-spinner";

function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
    />
  );
}
```

### 6. TypeScript型定義

```tsx
// 適切な型定義
interface User {
  id: string;
  name: string;
  role: 'SU' | 'AD' | 'CU';
  email?: string;
}

// プロパティの型定義
interface MyComponentProps {
  users: User[];
  onUserSelect: (user: User) => void;
  isLoading?: boolean;
}

function MyComponent({ users, onUserSelect, isLoading = false }: MyComponentProps) {
  // コンポーネント実装
}
```

### 7. パフォーマンス最適化

```tsx
import { memo, useMemo, useCallback } from "react";

// メモ化されたコンポーネント
const UserRow = memo(({ user, onEdit, onDelete }: UserRowProps) => {
  return (
    <TableRow>
      <TableCell>{user.name}</TableCell>
      <TableCell>
        <ActionButtons onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
});

// メモ化されたコールバック
const handleEdit = useCallback((userId: string) => {
  navigate(`/users/${userId}/edit`);
}, [navigate]);

// メモ化された計算
const filteredUsers = useMemo(() => {
  return users.filter(user => user.name.includes(searchTerm));
}, [users, searchTerm]);
```

## まとめ

このガイドに従って、統一されたUIコンポーネントを使用することで、保守性が高く、一貫したユーザーエクスペリエンスを提供するアプリケーションを構築できます。

新しいページやコンポーネントを作成する際は、既存のパターンを参考にし、このガイドのベストプラクティスに従ってください。

詳細な実装例については、既存のページコンポーネント（`src/pages/`）や機能別コンポーネント（`src/components/features/`）を参照してください。