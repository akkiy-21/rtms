
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { NAVIGATION_LABELS } from '../../localization/constants/navigation-labels';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb コンポーネント
 * 
 * パンくずリストのナビゲーション機能を提供します。
 * 翻訳定数を使用して日本語でのナビゲーション表示をサポートします。
 * 
 * @param items - パンくずリストのアイテム配列
 * 
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: NAVIGATION_LABELS.HOME, href: '/' },
 *     { label: NAVIGATION_LABELS.USERS, href: '/users' },
 *     { label: NAVIGATION_LABELS.EDIT }
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="flex" aria-label="パンくずリスト">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
              )}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`text-sm font-medium ${
                    isLast ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * よく使用されるパンくずリストパターンのヘルパー関数
 */
export const BreadcrumbHelpers = {
  /**
   * ホーム > エンティティ一覧のパンくずリストを作成
   */
  createEntityListBreadcrumb: (entityLabel: string, entityPath: string): BreadcrumbItem[] => [
    { label: NAVIGATION_LABELS.HOME, href: '/' },
    { label: entityLabel, href: entityPath }
  ],

  /**
   * ホーム > エンティティ一覧 > 作成のパンくずリストを作成
   */
  createEntityCreateBreadcrumb: (entityLabel: string, entityPath: string): BreadcrumbItem[] => [
    { label: NAVIGATION_LABELS.HOME, href: '/' },
    { label: entityLabel, href: entityPath },
    { label: NAVIGATION_LABELS.CREATE }
  ],

  /**
   * ホーム > エンティティ一覧 > 編集のパンくずリストを作成
   */
  createEntityEditBreadcrumb: (entityLabel: string, entityPath: string): BreadcrumbItem[] => [
    { label: NAVIGATION_LABELS.HOME, href: '/' },
    { label: entityLabel, href: entityPath },
    { label: NAVIGATION_LABELS.EDIT }
  ],

  /**
   * ホーム > エンティティ一覧 > 詳細のパンくずリストを作成
   */
  createEntityDetailsBreadcrumb: (entityLabel: string, entityPath: string): BreadcrumbItem[] => [
    { label: NAVIGATION_LABELS.HOME, href: '/' },
    { label: entityLabel, href: entityPath },
    { label: NAVIGATION_LABELS.DETAILS }
  ],

  /**
   * 設定ページ用のパンくずリストを作成
   */
  createSettingsBreadcrumb: (settingsLabel: string): BreadcrumbItem[] => [
    { label: NAVIGATION_LABELS.HOME, href: '/' },
    { label: NAVIGATION_LABELS.SETTINGS, href: '/settings' },
    { label: settingsLabel }
  ]
};
