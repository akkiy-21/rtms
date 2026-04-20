# トラブルシューティングガイド

このドキュメントは、MUIからshadcn/uiへの移行プロセスで発生する可能性のある一般的な問題と解決策を提供します。

## 目次

1. [セットアップ関連の問題](#セットアップ関連の問題)
2. [コンポーネント移行の問題](#コンポーネント移行の問題)
3. [スタイリングの問題](#スタイリングの問題)
4. [TypeScript関連の問題](#typescript関連の問題)
5. [ビルドエラー](#ビルドエラー)
6. [パフォーマンスの問題](#パフォーマンスの問題)
7. [よくある質問（FAQ）](#よくある質問faq)

## セットアップ関連の問題

### Tailwind CSSが適用されない

**症状:**
- Tailwindのクラスが効かない
- スタイルが反映されない

**原因と解決策:**

1. **Tailwind設定ファイルの問題**
   ```bash
   # tailwind.config.jsのcontent設定を確認
   content: [
     './src/**/*.{js,jsx,ts,tsx}',
     './public/index.html',
   ]
   ```

2. **CSSファイルの読み込み順序**
   ```css
   /* src/styles/globals.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. **PostCSS設定の確認**
   ```javascript
   // postcss.config.js
   module.exports = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   }
   ```

### shadcn/ui CLIが動作しない

**症状:**
- `npx shadcn-ui@latest add button` が失敗する
- コンポーネントが生成されない

**解決策:**

1. **Node.jsバージョンの確認**
   ```bash
   node --version  # 16.0.0以上が必要
   npm --version   # 8.0.0以上が必要
   ```

2. **components.jsonの確認**
   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "style": "default",
     "rsc": false,
     "tsx": true,
     "tailwind": {
       "config": "tailwind.config.js",
       "css": "src/styles/globals.css"
     },
     "aliases": {
       "components": "@/components",
       "utils": "@/lib/utils"
     }
   }
   ```

3. **パッケージの再インストール**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## コンポーネント移行の問題

### MUIコンポーネントのプロパティが見つからない

**症状:**
- MUIのプロパティがshadcn/uiコンポーネントに存在しない
- TypeScriptエラーが発生

**解決策:**

1. **プロパティマッピングの確認**
   ```typescript
   // MUI
   <Button variant="contained" color="primary">
   
   // shadcn/ui
   <Button variant="default">
   ```

2. **カスタムプロパティの実装**
   ```typescript
   // 必要に応じてコンポーネントを拡張
   interface CustomButtonProps extends ButtonProps {
     color?: 'primary' | 'secondary';
   }
   
   export function CustomButton({ color, ...props }: CustomButtonProps) {
     const colorClass = color === 'primary' ? 'bg-blue-600' : 'bg-gray-600';
     return <Button className={cn(colorClass, props.className)} {...props} />;
   }
   ```

### フォームバリデーションが動作しない

**症状:**
- react-hook-formのバリデーションが効かない
- エラーメッセージが表示されない

**解決策:**

1. **zodスキーマの確認**
   ```typescript
   import { z } from 'zod';
   import { zodResolver } from '@hookform/resolvers/zod';
   
   const schema = z.object({
     name: z.string().min(1, 'Name is required'),
   });
   
   const form = useForm({
     resolver: zodResolver(schema),
   });
   ```

2. **FormFieldの正しい使用**
   ```typescript
   <FormField
     control={form.control}
     name="name"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Name</FormLabel>
         <FormControl>
           <Input {...field} />
         </FormControl>
         <FormMessage />
       </FormItem>
     )}
   />
   ```

### テーブルのソートが動作しない

**症状:**
- DataTableでソートが効かない
- カラムヘッダーをクリックしても反応しない

**解決策:**

1. **ColumnDefの設定確認**
   ```typescript
   const columns: ColumnDef<User>[] = [
     {
       accessorKey: 'name',
       header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Name" />
       ),
       enableSorting: true, // 明示的に有効化
     },
   ];
   ```

2. **テーブル設定の確認**
   ```typescript
   const table = useReactTable({
     data,
     columns,
     getCoreRowModel: getCoreRowModel(),
     getSortedRowModel: getSortedRowModel(), // ソート機能を有効化
     onSortingChange: setSorting,
     state: {
       sorting,
     },
   });
   ```

## スタイリングの問題

### カスタムスタイルが適用されない

**症状:**
- Tailwindクラスが上書きされない
- カスタムCSSが効かない

**解決策:**

1. **クラス名の優先順位**
   ```typescript
   // cn関数を使用して適切にマージ
   import { cn } from '@/lib/utils';
   
   <Button className={cn('bg-red-500', customClass)} />
   ```

2. **!importantの使用（最後の手段）**
   ```css
   .custom-button {
     background-color: red !important;
   }
   ```

3. **CSS変数の活用**
   ```css
   :root {
     --custom-primary: #3b82f6;
   }
   
   .custom-button {
     background-color: var(--custom-primary);
   }
   ```

### レスポンシブデザインが崩れる

**症状:**
- モバイルでレイアウトが崩れる
- ブレークポイントが効かない

**解決策:**

1. **Tailwindのブレークポイント使用**
   ```typescript
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
   ```

2. **コンテナの適切な使用**
   ```typescript
   <div className="container mx-auto px-4 md:px-6">
   ```

## TypeScript関連の問題

### パスエイリアスが解決されない

**症状:**
- `@/components` のインポートでエラー
- モジュールが見つからない

**解決策:**

1. **tsconfig.jsonの設定**
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **Vite設定（Viteを使用している場合）**
   ```typescript
   // vite.config.ts
   import path from 'path';
   
   export default defineConfig({
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   });
   ```

### 型定義エラー

**症状:**
- shadcn/uiコンポーネントの型エラー
- プロパティの型が合わない

**解決策:**

1. **型定義の拡張**
   ```typescript
   // types/shadcn.d.ts
   declare module '@/components/ui/button' {
     export interface ButtonProps {
       customProp?: string;
     }
   }
   ```

2. **適切な型アサーション**
   ```typescript
   const buttonRef = useRef<HTMLButtonElement>(null);
   ```

## ビルドエラー

### MUI依存関係の残存エラー

**症状:**
- ビルド時にMUIモジュールが見つからないエラー
- 削除したはずのMUIコンポーネントが参照されている

**解決策:**

1. **残存参照の検索**
   ```bash
   # MUIへの参照を検索
   grep -r "@mui" src/
   grep -r "material-ui" src/
   ```

2. **node_modulesのクリア**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScriptキャッシュのクリア**
   ```bash
   npx tsc --build --clean
   ```

### バンドルサイズが大きすぎる

**症状:**
- ビルド後のファイルサイズが予想より大きい
- 不要なライブラリが含まれている

**解決策:**

1. **バンドル分析**
   ```bash
   npm install --save-dev webpack-bundle-analyzer
   npm run build
   npx webpack-bundle-analyzer build/static/js/*.js
   ```

2. **動的インポートの使用**
   ```typescript
   const DataTable = lazy(() => import('@/components/common/data-table'));
   ```

## パフォーマンスの問題

### 初期読み込みが遅い

**症状:**
- ページの初期表示に時間がかかる
- First Contentful Paintが遅い

**解決策:**

1. **コード分割の実装**
   ```typescript
   const UsersPage = lazy(() => import('@/pages/users-page'));
   ```

2. **プリロードの実装**
   ```typescript
   <link rel="preload" href="/api/users" as="fetch" crossorigin="anonymous">
   ```

### 再レンダリングが頻繁に発生

**症状:**
- コンポーネントが不必要に再レンダリングされる
- パフォーマンスが低下している

**解決策:**

1. **React.memoの使用**
   ```typescript
   const UserCard = memo(({ user }: { user: User }) => {
     return <Card>{user.name}</Card>;
   });
   ```

2. **useCallbackとuseMemoの活用**
   ```typescript
   const handleClick = useCallback(() => {
     // ハンドラー処理
   }, [dependency]);
   
   const expensiveValue = useMemo(() => {
     return computeExpensiveValue(data);
   }, [data]);
   ```

## よくある質問（FAQ）

### Q: MUIのテーマ機能はshadcn/uiでどう実現しますか？

**A:** shadcn/uiではCSS変数とTailwindのテーマ機能を使用します：

```css
/* globals.css */
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
}
```

### Q: MUIのDataGridに相当するコンポーネントはありますか？

**A:** shadcn/uiには直接的な代替はありませんが、@tanstack/react-tableを使用してDataTableコンポーネントを実装できます。詳細は[COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md)を参照してください。

### Q: アイコンはどうすれば良いですか？

**A:** lucide-reactを使用することを推奨します：

```typescript
import { User, Settings, Home } from 'lucide-react';

<Button>
  <User className="h-4 w-4 mr-2" />
  Users
</Button>
```

### Q: フォームライブラリは何を使用すべきですか？

**A:** react-hook-formとzodの組み合わせを推奨します：

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

### Q: 既存のMUIスタイルを一時的に残すことはできますか？

**A:** 可能ですが推奨しません。段階的移行中は以下のように分離できます：

```typescript
// 一時的な共存
import { Button as MuiButton } from '@mui/material';
import { Button as ShadcnButton } from '@/components/ui/button';

// 移行完了後はMUIを削除
```

### Q: カスタムコンポーネントの作成方法は？

**A:** 既存のshadcn/uiコンポーネントを拡張します：

```typescript
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}

export function CustomButton({ loading, children, ...props }: CustomButtonProps) {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {loading ? 'Loading...' : children}
    </Button>
  );
}
```

### Q: ダークモードはどう実装しますか？

**A:** next-themesまたは独自の実装を使用します：

```typescript
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="outline"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      Toggle Theme
    </Button>
  );
}
```

### Q: 移行中にバグが発生した場合の対処法は？

**A:** 以下の手順で対処してください：

1. **問題の特定**
   - ブラウザの開発者ツールでエラーを確認
   - コンソールログを確認

2. **段階的なロールバック**
   - 最後に動作していた状態に戻す
   - 小さな変更単位で再実装

3. **テストの実行**
   ```bash
   npm test
   npm run build
   ```

4. **コミュニティサポート**
   - [shadcn/ui Discord](https://discord.gg/shadcn)
   - [GitHub Issues](https://github.com/shadcn-ui/ui/issues)

### Q: パフォーマンスの最適化方法は？

**A:** 以下の方法を試してください：

1. **バンドル分析**
   ```bash
   npm run build
   npm install -g serve
   serve -s build
   ```

2. **遅延読み込み**
   ```typescript
   const HeavyComponent = lazy(() => import('./heavy-component'));
   ```

3. **メモ化**
   ```typescript
   const MemoizedComponent = memo(Component);
   ```

## サポートとリソース

### 公式ドキュメント
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

### コミュニティ
- [shadcn/ui Discord](https://discord.gg/shadcn)
- [Tailwind CSS Discord](https://discord.gg/tailwindcss)

### 関連ドキュメント
- [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) - コンポーネント使用ガイド
- [MIGRATION_PATTERNS.md](./MIGRATION_PATTERNS.md) - 移行パターン
- [STYLING_GUIDE.md](./STYLING_GUIDE.md) - スタイリングガイド

---

**注意:** このガイドは継続的に更新されます。新しい問題や解決策を発見した場合は、このドキュメントを更新してください。