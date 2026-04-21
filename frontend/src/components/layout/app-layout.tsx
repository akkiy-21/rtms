import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { NAVIGATION_LABELS } from '@/localization/constants/navigation-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout コンポーネント
 * 
 * 統一されたアプリケーションレイアウトを提供します。
 * ヘッダー、サイドバー、メインコンテンツエリアを統合しています。
 * 
 * @param children - メインコンテンツ
 * 
 * @example
 * ```tsx
 * <AppLayout>
 *   <YourPageContent />
 * </AppLayout>
 * ```
 */
export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * 現在のパスから親階層のパスを取得する
   * @param pathname 現在のパス
   * @returns 親階層のパス
   */
  const getParentPath = (pathname: string): string => {
    // ルートパスの場合はそのまま返す
    if (pathname === '/') return '/';

    // パスの階層構造を定義
    const pathHierarchy: Record<string, string> = {
      // Users関連
      '/users/create': '/users',
      '/users/edit': '/users',
      // PLCs関連
      '/plcs/create': '/plcs',
      '/plcs/edit': '/plcs',
      '/alarm-parse-rules/create': '/alarm-parse-rules',
      '/alarm-parse-rules/edit': '/alarm-parse-rules',
      // Devices関連
      '/devices/create': '/devices',
      '/devices/edit': '/devices',
      '/devices/detail-settings': '/devices',
      '/devices/product-settings': '/devices',
      // Device Detail Settings配下の設定ページ
      '/devices/detail-settings/efficiency-settings': '/devices/detail-settings',
      '/devices/detail-settings/io-settings': '/devices/detail-settings',
      '/devices/detail-settings/quality-control-signals': '/devices/detail-settings',
      '/devices/detail-settings/client-settings': '/devices/detail-settings',
      '/devices/detail-settings/client-settings/create': '/devices/detail-settings/client-settings',
      '/devices/detail-settings/alarm-groups': '/devices/detail-settings',
      '/devices/detail-settings/alarm-groups/create': '/devices/detail-settings/alarm-groups',
      '/devices/detail-settings/logging-settings': '/devices/detail-settings',
      '/devices/detail-settings/logging-settings/create': '/devices/detail-settings/logging-settings',
      // Classifications関連
      '/classifications/create': '/classifications',
      '/classifications/edit': '/classifications',
      // Customers関連
      '/customers/create': '/customers',
      '/customers/edit': '/customers',
      // Products関連
      '/products/create': '/products',
      '/products/edit': '/products',
    };

    // 動的なIDを含むパスの処理
    const dynamicPatterns = [
      { pattern: /^\/users\/\d+\/edit$/, parent: '/users' },
      { pattern: /^\/plcs\/\d+\/edit$/, parent: '/plcs' },
      { pattern: /^\/alarm-parse-rules\/\d+\/edit$/, parent: '/alarm-parse-rules' },
      { pattern: /^\/devices\/\d+\/edit$/, parent: '/devices' },
      { pattern: /^\/devices\/\d+\/detail-settings$/, parent: '/devices' },
      { pattern: /^\/devices\/\d+\/product-settings$/, parent: '/devices' },
      // Device Detail Settings配下の動的パターン
      { pattern: /^\/devices\/\d+\/detail-settings\/efficiency-settings$/, parent: (match: string) => match.replace('/efficiency-settings', '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/io-settings$/, parent: (match: string) => match.replace('/io-settings', '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/quality-control-signals$/, parent: (match: string) => match.replace('/quality-control-signals', '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/client-settings$/, parent: (match: string) => match.replace('/client-settings', '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/client-settings\/create$/, parent: (match: string) => match.replace('/create', '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/client-settings\/\d+\/edit$/, parent: (match: string) => match.replace(/\/\d+\/edit$/, '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/alarm-groups$/, parent: (match: string) => match.replace('/alarm-groups', '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/alarm-groups\/create$/, parent: (match: string) => match.replace('/create', '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/alarm-groups\/\d+\/edit$/, parent: (match: string) => match.replace(/\/\d+\/edit$/, '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/alarm-groups\/\d+\/addresses$/, parent: (match: string) => match.replace(/\/\d+\/addresses$/, '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/logging-settings$/, parent: (match: string) => match.replace('/logging-settings', '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/logging-settings\/create$/, parent: (match: string) => match.replace('/create', '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/logging-settings\/\d+\/edit$/, parent: (match: string) => match.replace(/\/\d+\/edit$/, '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/logging-settings\/\d+\/data$/, parent: (match: string) => match.replace(/\/\d+\/data$/, '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/logging-settings\/\d+\/create$/, parent: (match: string) => match.replace(/\/\d+\/create$/, '') },
      { pattern: /^\/devices\/\d+\/detail-settings\/logging-settings\/\d+\/edit\/\d+$/, parent: (match: string) => match.replace(/\/edit\/\d+$/, '/data') },
      { pattern: /^\/classifications\/\d+\/edit$/, parent: '/classifications' },
      { pattern: /^\/customers\/\d+\/edit$/, parent: '/customers' },
      { pattern: /^\/products\/\d+\/edit$/, parent: '/products' },
    ];

    // 動的パターンをチェック
    for (const { pattern, parent } of dynamicPatterns) {
      if (pattern.test(pathname)) {
        return typeof parent === 'function' ? parent(pathname) : parent;
      }
    }

    // 静的パスをチェック
    if (pathHierarchy[pathname]) {
      return pathHierarchy[pathname];
    }

    // 上記に該当しない場合は、パスを分割して一つ上の階層を返す
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    if (pathSegments.length <= 1) {
      return '/';
    }
    
    // 最後のセグメントを削除して親パスを作成
    pathSegments.pop();
    return pathSegments.length === 0 ? '/' : `/${pathSegments.join('/')}`;
  };

  const handleBack = () => {
    const parentPath = getParentPath(location.pathname);
    navigate(parentPath);
  };

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
            aria-label="メニューを開く"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* ルートパス以外の場合に戻るボタンを表示 */}
          {location.pathname !== '/' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-2"
              aria-label={ACTION_LABELS.BACK}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold">RTMS - {NAVIGATION_LABELS.DEVICE_MANAGEMENT}</h2>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
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
