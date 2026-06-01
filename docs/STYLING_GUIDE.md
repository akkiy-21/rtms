# スタイリングガイド

このドキュメントでは、RTMSアプリケーションにおけるTailwind CSSとshadcn/uiを使用したスタイリングの方法について詳しく説明します。

## 目次

1. [デザインシステム概要](#デザインシステム概要)
2. [Tailwind CSS基本](#tailwind-css基本)
3. [shadcn/uiカスタマイズ](#shadcnuiカスタマイズ)
4. [カラーシステム](#カラーシステム)
5. [タイポグラフィ](#タイポグラフィ)
6. [スペーシングとレイアウト](#スペーシングとレイアウト)
7. [レスポンシブデザイン](#レスポンシブデザイン)
8. [ダークモード対応](#ダークモード対応)
9. [カスタムコンポーネントのスタイリング](#カスタムコンポーネントのスタイリング)
10. [ベストプラクティス](#ベストプラクティス)
11. [よくある問題と解決策](#よくある問題と解決策)

## デザインシステム概要

RTMSアプリケーションは、以下の技術スタックを使用した統一されたデザインシステムを採用しています：

- **Tailwind CSS**: ユーティリティファーストのCSSフレームワーク
- **shadcn/ui**: Radix UIとTailwind CSSをベースにしたコンポーネントライブラリ
- **CSS Variables**: テーマカラーの動的管理
- **Lucide React**: 一貫したアイコンシステム

### 設計原則

1. **一貫性**: すべてのページで統一されたデザイン言語
2. **アクセシビリティ**: WCAG 2.1 AA準拠のアクセシブルなUI
3. **レスポンシブ**: モバイルファーストのレスポンシブデザイン
4. **保守性**: 再利用可能で拡張しやすいコンポーネント設計

## Tailwind CSS基本

### 基本的な使用方法

Tailwind CSSは、HTMLクラス名として直接スタイルを適用するユーティリティファーストのアプローチを採用しています。

```tsx
// 基本的なレイアウト
<div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900">タイトル</h2>
  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
    アクション
  </button>
</div>
```

### よく使用するユーティリティクラス

#### レイアウト
```css
/* Flexbox */
.flex              /* display: flex */
.flex-col          /* flex-direction: column */
.items-center      /* align-items: center */
.justify-between   /* justify-content: space-between */
.gap-4             /* gap: 1rem */

/* Grid */
.grid              /* display: grid */
.grid-cols-2       /* grid-template-columns: repeat(2, minmax(0, 1fr)) */
.col-span-2        /* grid-column: span 2 / span 2 */

/* Position */
.relative          /* position: relative */
.absolute          /* position: absolute */
.top-0             /* top: 0px */
.right-0           /* right: 0px */
```

#### スペーシング
```css
/* Padding */
.p-4               /* padding: 1rem */
.px-6              /* padding-left: 1.5rem; padding-right: 1.5rem */
.py-2              /* padding-top: 0.5rem; padding-bottom: 0.5rem */

/* Margin */
.m-4               /* margin: 1rem */
.mx-auto           /* margin-left: auto; margin-right: auto */
.mt-6              /* margin-top: 1.5rem */

/* Space between children */
.space-y-4         /* > * + * { margin-top: 1rem } */
.space-x-2         /* > * + * { margin-left: 0.5rem } */
```

#### サイズ
```css
/* Width */
.w-full            /* width: 100% */
.w-64              /* width: 16rem */
.max-w-sm          /* max-width: 24rem */

/* Height */
.h-10              /* height: 2.5rem */
.min-h-screen      /* min-height: 100vh */
```

### 条件付きスタイリング

`cn`関数を使用して条件付きでクラスを適用します：

```tsx
import { cn } from "@/lib/utils";

function Button({ variant, size, disabled, className, ...props }) {
  return (
    <button
      className={cn(
        // ベースクラス
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        
        // バリアント
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
        },
        
        // サイズ
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-md px-3": size === "sm",
          "h-11 rounded-md px-8": size === "lg",
        },
        
        // 条件付きクラス
        disabled && "cursor-not-allowed",
        
        // 外部から渡されたクラス
        className
      )}
      {...props}
    />
  );
}
```

## shadcn/uiカスタマイズ

### 基本設定

shadcn/uiの設定は`components.json`で管理されています：

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

### コンポーネントのカスタマイズ

shadcn/uiコンポーネントは、Tailwindクラスを直接編集してカスタマイズできます：

```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### 新しいバリアントの追加

既存のコンポーネントに新しいバリアントを追加する場合：

```tsx
// カスタムボタンバリアントの追加
const buttonVariants = cva(
  // ... 既存のベースクラス
  {
    variants: {
      variant: {
        // ... 既存のバリアント
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700",
      },
      // ... 既存のサイズ
    },
  }
);

// 使用例
<Button variant="success">成功</Button>
<Button variant="warning">警告</Button>
```

## カラーシステム

### CSS変数ベースのカラーシステム

RTMSアプリケーションでは、CSS変数を使用してテーマカラーを管理しています：

```css
/* src/styles/globals.css */
:root {
  --background: 0 0% 100%;           /* 背景色 */
  --foreground: 222.2 84% 4.9%;      /* テキスト色 */
  --primary: 221.2 83.2% 53.3%;      /* プライマリ色 */
  --primary-foreground: 210 40% 98%; /* プライマリテキスト色 */
  --secondary: 210 40% 96.1%;        /* セカンダリ色 */
  --destructive: 0 84.2% 60.2%;      /* 削除・エラー色 */
  --muted: 210 40% 96.1%;            /* ミュート色 */
  --accent: 210 40% 96.1%;           /* アクセント色 */
  --border: 214.3 31.8% 91.4%;       /* ボーダー色 */
  --input: 214.3 31.8% 91.4%;        /* 入力フィールド色 */
  --ring: 221.2 83.2% 53.3%;         /* フォーカスリング色 */
  --radius: 0.5rem;                  /* ボーダー半径 */
}
```

### カラーの使用方法

```tsx
// Tailwindクラスでの使用
<div className="bg-background text-foreground border border-border">
  <h1 className="text-primary">プライマリカラーのタイトル</h1>
  <p className="text-muted-foreground">ミュートされたテキスト</p>
  <button className="bg-destructive text-destructive-foreground">
    削除ボタン
  </button>
</div>

// CSS-in-JSでの使用（必要な場合）
const styles = {
  container: {
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    borderColor: 'hsl(var(--border))',
  }
};
```

### カスタムカラーの追加

新しいカラーを追加する場合は、`tailwind.config.js`と`globals.css`の両方を更新します：

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 既存のカラー...
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
    },
  },
};
```

```css
/* globals.css */
:root {
  /* 既存の変数... */
  --success: 142 76% 36%;
  --success-foreground: 355 7% 97%;
  --warning: 38 92% 50%;
  --warning-foreground: 48 96% 89%;
}
```

## タイポグラフィ

### 統一されたテキストスタイル

RTMSアプリケーションでは、以下のタイポグラフィスケールを使用しています：

```tsx
// 見出し
<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
  メインタイトル
</h1>

<h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
  セクションタイトル
</h2>

<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
  サブセクションタイトル
</h3>

<h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
  小見出し
</h4>

// 本文
<p className="leading-7 [&:not(:first-child)]:mt-6">
  通常の段落テキスト
</p>

// 特殊なテキスト
<p className="text-xl text-muted-foreground">リードテキスト</p>
<p className="text-lg font-semibold">大きなテキスト</p>
<p className="text-sm font-medium leading-none">小さなテキスト</p>
<p className="text-sm text-muted-foreground">ミュートされたテキスト</p>
```

### フォントサイズとライン高さ

```css
/* よく使用されるテキストサイズ */
.text-xs     /* font-size: 0.75rem; line-height: 1rem; */
.text-sm     /* font-size: 0.875rem; line-height: 1.25rem; */
.text-base   /* font-size: 1rem; line-height: 1.5rem; */
.text-lg     /* font-size: 1.125rem; line-height: 1.75rem; */
.text-xl     /* font-size: 1.25rem; line-height: 1.75rem; */
.text-2xl    /* font-size: 1.5rem; line-height: 2rem; */
.text-3xl    /* font-size: 1.875rem; line-height: 2.25rem; */
.text-4xl    /* font-size: 2.25rem; line-height: 2.5rem; */

/* フォントウェイト */
.font-normal    /* font-weight: 400; */
.font-medium    /* font-weight: 500; */
.font-semibold  /* font-weight: 600; */
.font-bold      /* font-weight: 700; */
.font-extrabold /* font-weight: 800; */
```

### カスタムタイポグラフィコンポーネント

再利用可能なタイポグラフィコンポーネントを作成する場合：

```tsx
// components/ui/typography.tsx
interface TypographyProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'lead' | 'large' | 'small' | 'muted';
  children: React.ReactNode;
  className?: string;
}

export function Typography({ variant, children, className }: TypographyProps) {
  const variants = {
    h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
    h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight",
    h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
    h4: "scroll-m-20 text-xl font-semibold tracking-tight",
    p: "leading-7 [&:not(:first-child)]:mt-6",
    lead: "text-xl text-muted-foreground",
    large: "text-lg font-semibold",
    small: "text-sm font-medium leading-none",
    muted: "text-sm text-muted-foreground",
  };

  const Component = variant.startsWith('h') ? variant : 'p';

  return (
    <Component className={cn(variants[variant], className)}>
      {children}
    </Component>
  );
}

// 使用例
<Typography variant="h2">セクションタイトル</Typography>
<Typography variant="lead">リードテキスト</Typography>
```

## スペーシングとレイアウト

### 統一されたスペーシングシステム

RTMSアプリケーションでは、以下のスペーシングパターンを使用しています：

```tsx
// ページコンテナ
<div className="container mx-auto py-6 px-4 md:px-6">
  {/* ページコンテンツ */}
</div>

// セクション間のスペース
<div className="space-y-6">
  <section>セクション1</section>
  <section>セクション2</section>
  <section>セクション3</section>
</div>

// カードのパディング
<div className="p-6">
  {/* カードコンテンツ */}
</div>

// フォームのスペース
<form className="space-y-4">
  <div>フィールド1</div>
  <div>フィールド2</div>
  <div>フィールド3</div>
</form>

// ボタングループ
<div className="flex gap-2">
  <Button>ボタン1</Button>
  <Button>ボタン2</Button>
</div>
```

### レイアウトパターン

#### Flexboxレイアウト

```tsx
// 水平配置
<div className="flex items-center justify-between">
  <div>左側のコンテンツ</div>
  <div>右側のコンテンツ</div>
</div>

// 垂直配置
<div className="flex flex-col space-y-4">
  <div>上のコンテンツ</div>
  <div>下のコンテンツ</div>
</div>

// 中央配置
<div className="flex items-center justify-center min-h-screen">
  <div>中央のコンテンツ</div>
</div>
```

#### Gridレイアウト

```tsx
// 基本的なグリッド
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>アイテム1</div>
  <div>アイテム2</div>
  <div>アイテム3</div>
</div>

// 複雑なグリッドレイアウト
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-8">メインコンテンツ</div>
  <div className="col-span-12 md:col-span-4">サイドバー</div>
</div>
```

### コンテナとラッパー

```tsx
// ページラッパー
<div className="min-h-screen bg-background">
  <main className="container mx-auto py-6 px-4 md:px-6">
    {/* ページコンテンツ */}
  </main>
</div>

// カードラッパー
<div className="rounded-lg border bg-card text-card-foreground shadow-sm">
  <div className="p-6">
    {/* カードコンテンツ */}
  </div>
</div>

// フォームラッパー
<div className="mx-auto max-w-2xl">
  <form className="space-y-6">
    {/* フォームフィールド */}
  </form>
</div>
```

## レスポンシブデザイン

### ブレークポイント

Tailwind CSSのデフォルトブレークポイントを使用しています：

```css
/* sm: 640px以上 */
.sm:text-lg

/* md: 768px以上 */
.md:grid-cols-2

/* lg: 1024px以上 */
.lg:text-5xl

/* xl: 1280px以上 */
.xl:px-8

/* 2xl: 1536px以上 */
.2xl:max-w-7xl
```

### レスポンシブパターン

```tsx
// レスポンシブグリッド
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* アイテム */}
</div>

// レスポンシブテキスト
<h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">
  レスポンシブタイトル
</h1>

// レスポンシブスペーシング
<div className="p-4 sm:p-6 lg:p-8">
  {/* コンテンツ */}
</div>

// レスポンシブ表示/非表示
<div className="hidden md:block">
  デスクトップでのみ表示
</div>
<div className="block md:hidden">
  モバイルでのみ表示
</div>
```

### モバイルファーストアプローチ

```tsx
// モバイルファーストの設計
<div className={cn(
  // モバイル（デフォルト）
  "flex flex-col space-y-4 p-4",
  // タブレット以上
  "md:flex-row md:space-y-0 md:space-x-6 md:p-6",
  // デスクトップ以上
  "lg:p-8 xl:max-w-6xl xl:mx-auto"
)}>
  {/* コンテンツ */}
</div>
```

## ダークモード対応

### ダークモードの設定

RTMSアプリケーションはダークモードに対応しています：

```css
/* globals.css */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* その他のダークモードカラー */
}
```

### ダークモード対応のスタイリング

```tsx
// 自動的にダークモードに対応
<div className="bg-background text-foreground border border-border">
  {/* CSS変数を使用しているため、自動的にダークモードに対応 */}
</div>

// 手動でダークモード対応が必要な場合
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  {/* 明示的にダークモードスタイルを指定 */}
</div>
```

### ダークモードの切り替え

```tsx
// ダークモード切り替えコンポーネント
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
```

## カスタムコンポーネントのスタイリング

### 基本的なカスタムコンポーネント

```tsx
// components/ui/status-badge.tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      },
    },
    defaultVariants: {
      status: "active",
    },
  }
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: "active" | "inactive" | "error" | "warning";
}

export function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  return (
    <div
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    />
  );
}

// 使用例
<StatusBadge status="active">アクティブ</StatusBadge>
<StatusBadge status="error">エラー</StatusBadge>
```

### 複雑なカスタムコンポーネント

```tsx
// components/ui/data-card.tsx
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function DataCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  className,
}: DataCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trendValue) && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {trendValue && (
              <span
                className={cn(
                  "flex items-center",
                  trend === "up" && "text-green-600",
                  trend === "down" && "text-red-600",
                  trend === "neutral" && "text-gray-600"
                )}
              >
                {trendValue}
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 使用例
<DataCard
  title="総ユーザー数"
  value="1,234"
  description="前月比"
  trend="up"
  trendValue="+12%"
  icon={<Users className="h-4 w-4" />}
/>
```

### アニメーション付きコンポーネント

```tsx
// components/ui/loading-card.tsx
import { cn } from "@/lib/utils";

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border bg-card p-6",
        className
      )}
    >
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    </div>
  );
}

// カスタムアニメーションの追加
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
};

// 使用例
<div className="animate-fade-in">
  フェードインするコンテンツ
</div>
```

## ベストプラクティス

### 1. クラス名の整理

```tsx
// 悪い例：長すぎるクラス名
<div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">

// 良い例：cn関数を使用した整理
<div className={cn(
  "flex items-center justify-between p-4",
  "bg-white border border-gray-200 rounded-lg",
  "shadow-sm hover:shadow-md transition-shadow duration-200"
)}>

// さらに良い例：コンポーネント化
<Card className="flex items-center justify-between p-4 hover:shadow-md transition-shadow">
```

### 2. 再利用可能なスタイルパターン

```tsx
// 共通スタイルの定数化
const LAYOUT_STYLES = {
  pageContainer: "container mx-auto py-6 px-4 md:px-6",
  sectionGap: "space-y-6",
  cardPadding: "p-6",
  formGap: "space-y-4",
  buttonGroup: "flex gap-2",
} as const;

// 使用例
<div className={LAYOUT_STYLES.pageContainer}>
  <div className={LAYOUT_STYLES.sectionGap}>
    {/* コンテンツ */}
  </div>
</div>
```

### 3. コンポーネントバリアント

```tsx
// class-variance-authorityを使用したバリアント管理
import { cva } from "class-variance-authority";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive",
        success: "border-green-500/50 text-green-700 dark:border-green-500",
        warning: "border-yellow-500/50 text-yellow-700 dark:border-yellow-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

### 4. アクセシビリティの考慮

```tsx
// フォーカス状態の適切な実装
<button className={cn(
  "px-4 py-2 rounded-md",
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  "disabled:opacity-50 disabled:cursor-not-allowed"
)}>
  ボタン
</button>

// 適切なコントラスト比の確保
<div className="bg-primary text-primary-foreground">
  {/* プライマリカラーに対して適切なコントラスト比のテキスト */}
</div>
```

### 5. パフォーマンスの最適化

```tsx
// 不要な再レンダリングを避けるためのメモ化
const MemoizedCard = memo(({ title, content, className }) => (
  <Card className={cn("p-6", className)}>
    <CardTitle>{title}</CardTitle>
    <CardContent>{content}</CardContent>
  </Card>
));

// 動的スタイルの最適化
const getDynamicStyles = useMemo(() => {
  return cn(
    "base-styles",
    condition && "conditional-styles",
    `dynamic-${value}-styles`
  );
}, [condition, value]);
```

## よくある問題と解決策

### 1. スタイルの優先順位問題

**問題**: Tailwindクラスが期待通りに適用されない

**解決策**:
```tsx
// 問題のあるパターン
<div className="bg-red-500 bg-blue-500"> {/* 後者が優先される */}

// 解決策：cn関数で条件付き適用
<div className={cn(
  "bg-red-500",
  isActive && "bg-blue-500"
)}>

// または、!importantを使用（最後の手段）
<div className="!bg-blue-500">
```

### 2. レスポンシブデザインの問題

**問題**: モバイルでレイアウトが崩れる

**解決策**:
```tsx
// 問題のあるパターン
<div className="grid grid-cols-4 gap-4"> {/* モバイルで4列は狭すぎる */}

// 解決策：レスポンシブグリッド
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// コンテナクエリの使用（必要に応じて）
<div className="@container">
  <div className="@sm:grid-cols-2 @lg:grid-cols-3">
```

### 3. ダークモード対応の問題

**問題**: 一部の要素がダークモードで見えない

**解決策**:
```tsx
// 問題のあるパターン
<div className="bg-white text-black"> {/* ダークモードで見えない */}

// 解決策：CSS変数の使用
<div className="bg-background text-foreground">

// または明示的なダークモード対応
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

### 4. カスタムCSSとの競合

**問題**: 既存のCSSとTailwindが競合する

**解決策**:
```css
/* globals.css */
@layer base {
  /* ベースレイヤーでのリセット */
  * {
    @apply border-border;
  }
}

@layer components {
  /* コンポーネントレイヤーでのカスタムスタイル */
  .custom-component {
    @apply flex items-center space-x-2;
  }
}

@layer utilities {
  /* ユーティリティレイヤーでのヘルパークラス */
  .text-balance {
    text-wrap: balance;
  }
}
```

### 5. パフォーマンスの問題

**問題**: バンドルサイズが大きくなる

**解決策**:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    // 使用するファイルのみを指定
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // 未使用のスタイルを削除
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
  },
};
```

## まとめ

このスタイリングガイドに従うことで、RTMSアプリケーションにおいて一貫性があり、保守しやすく、アクセシブルなUIを構築できます。

### 重要なポイント

1. **CSS変数の活用**: テーマカラーの統一管理
2. **コンポーネント化**: 再利用可能なスタイルパターン
3. **レスポンシブファースト**: モバイルから始まるデザイン
4. **アクセシビリティ**: すべてのユーザーが使いやすいUI
5. **パフォーマンス**: 最適化されたスタイルシート

新しいコンポーネントやページを作成する際は、このガイドのパターンとベストプラクティスに従って、統一されたデザインシステムを維持してください。

詳細な実装例については、既存のコンポーネント（`src/components/`）を参照し、不明な点があれば[Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)や[shadcn/ui公式サイト](https://ui.shadcn.com/)を確認してください。