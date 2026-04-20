import React from 'react';
import { Breadcrumb } from './breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

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
 *   title={BUSINESS_TERMS.USERS}
 *   description={`システムの${BUSINESS_TERMS.USERS}を管理します`}
 *   actions={<Button>{ACTION_LABELS.CREATE}{BUSINESS_TERMS.USER}</Button>}
 * />
 * ```
 */
export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 border-b">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}
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
