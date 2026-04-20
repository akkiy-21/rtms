import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Monitor,
  Tag,
  Cpu,
  Clock,
  Users,
  Building2,
  Package,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAVIGATION_LABELS } from '@/localization';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  onNavigate?: () => void;
}

/**
 * Sidebar コンポーネント
 * 
 * アプリケーションのナビゲーションメニューを提供します。
 * 翻訳定数を使用して統一された日本語ナビゲーションを実現します。
 * 
 * @param onNavigate - ナビゲーション時に呼び出されるコールバック（オプション）
 * 
 * @example
 * ```tsx
 * <Sidebar onNavigate={() => setSidebarOpen(false)} />
 * ```
 */
export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      label: NAVIGATION_LABELS.DEVICES,
      href: '/devices',
      icon: <Monitor className="w-4 h-4" />,
    },
    {
      label: NAVIGATION_LABELS.CLASSIFICATIONS,
      href: '/classifications',
      icon: <Tag className="w-4 h-4" />,
    },
    {
      label: NAVIGATION_LABELS.PLCS,
      href: '/plcs',
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      label: NAVIGATION_LABELS.TIME_TABLE,
      href: '/time-table',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: NAVIGATION_LABELS.CUSTOMERS,
      href: '/customers',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      label: NAVIGATION_LABELS.PRODUCTS,
      href: '/products',
      icon: <Package className="w-4 h-4" />,
    },
    {
      label: NAVIGATION_LABELS.USERS,
      href: '/users',
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: NAVIGATION_LABELS.DATA_DOWNLOAD,
      href: '/data-download',
      icon: <Download className="w-4 h-4" />,
    },
  ];

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          ナビゲーション
        </h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
                           location.pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleClick}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
