import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Breadcrumb, BreadcrumbHelpers } from '../breadcrumb';
import { NAVIGATION_LABELS } from '../../../localization/constants/navigation-labels';

// テスト用のラッパーコンポーネント
const BreadcrumbWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Breadcrumb', () => {
  it('パンくずリストが正しく表示される', () => {
    const items = [
      { label: NAVIGATION_LABELS.HOME, href: '/' },
      { label: NAVIGATION_LABELS.USERS, href: '/users' },
      { label: NAVIGATION_LABELS.EDIT }
    ];

    render(
      <BreadcrumbWrapper>
        <Breadcrumb items={items} />
      </BreadcrumbWrapper>
    );

    // 各アイテムが表示されることを確認
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('ユーザー')).toBeInTheDocument();
    expect(screen.getByText('編集')).toBeInTheDocument();

    // aria-labelが日本語化されていることを確認
    expect(screen.getByLabelText('パンくずリスト')).toBeInTheDocument();
  });

  it('空のアイテム配列の場合は何も表示されない', () => {
    const { container } = render(
      <BreadcrumbWrapper>
        <Breadcrumb items={[]} />
      </BreadcrumbWrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('最後のアイテムはリンクではなくテキストとして表示される', () => {
    const items = [
      { label: NAVIGATION_LABELS.HOME, href: '/' },
      { label: NAVIGATION_LABELS.EDIT }
    ];

    render(
      <BreadcrumbWrapper>
        <Breadcrumb items={items} />
      </BreadcrumbWrapper>
    );

    // 最初のアイテムはリンク
    const homeLink = screen.getByRole('link', { name: 'ホーム' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');

    // 最後のアイテムはテキスト（リンクではない）
    const editText = screen.getByText('編集');
    expect(editText).toBeInTheDocument();
    expect(editText.tagName).toBe('SPAN');
  });
});

describe('BreadcrumbHelpers', () => {
  it('createEntityListBreadcrumb が正しいパンくずリストを作成する', () => {
    const breadcrumbs = BreadcrumbHelpers.createEntityListBreadcrumb(
      NAVIGATION_LABELS.USERS,
      '/users'
    );

    expect(breadcrumbs).toEqual([
      { label: NAVIGATION_LABELS.HOME, href: '/' },
      { label: NAVIGATION_LABELS.USERS, href: '/users' }
    ]);
  });

  it('createEntityCreateBreadcrumb が正しいパンくずリストを作成する', () => {
    const breadcrumbs = BreadcrumbHelpers.createEntityCreateBreadcrumb(
      NAVIGATION_LABELS.USERS,
      '/users'
    );

    expect(breadcrumbs).toEqual([
      { label: NAVIGATION_LABELS.HOME, href: '/' },
      { label: NAVIGATION_LABELS.USERS, href: '/users' },
      { label: NAVIGATION_LABELS.CREATE }
    ]);
  });

  it('createEntityEditBreadcrumb が正しいパンくずリストを作成する', () => {
    const breadcrumbs = BreadcrumbHelpers.createEntityEditBreadcrumb(
      NAVIGATION_LABELS.USERS,
      '/users'
    );

    expect(breadcrumbs).toEqual([
      { label: NAVIGATION_LABELS.HOME, href: '/' },
      { label: NAVIGATION_LABELS.USERS, href: '/users' },
      { label: NAVIGATION_LABELS.EDIT }
    ]);
  });

  it('createSettingsBreadcrumb が正しいパンくずリストを作成する', () => {
    const breadcrumbs = BreadcrumbHelpers.createSettingsBreadcrumb(
      NAVIGATION_LABELS.IO_SETTINGS
    );

    expect(breadcrumbs).toEqual([
      { label: NAVIGATION_LABELS.HOME, href: '/' },
      { label: NAVIGATION_LABELS.SETTINGS, href: '/settings' },
      { label: NAVIGATION_LABELS.IO_SETTINGS }
    ]);
  });
});