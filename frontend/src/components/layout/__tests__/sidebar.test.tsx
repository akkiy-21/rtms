import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../sidebar';
import { NAVIGATION_LABELS } from '@/localization';

// テスト用のラッパーコンポーネント
const SidebarWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Sidebar', () => {
  it('すべてのナビゲーション項目が日本語で表示される', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    // ナビゲーションタイトルが日本語で表示される
    expect(screen.getByText('ナビゲーション')).toBeInTheDocument();

    // すべてのメニュー項目が翻訳定数を使用して日本語で表示される
    expect(screen.getByText(NAVIGATION_LABELS.DEVICES)).toBeInTheDocument();
    expect(screen.getByText(NAVIGATION_LABELS.CLASSIFICATIONS)).toBeInTheDocument();
    expect(screen.getByText(NAVIGATION_LABELS.PLCS)).toBeInTheDocument();
    expect(screen.getByText(NAVIGATION_LABELS.ALARM_GROUPS)).toBeInTheDocument();
    expect(screen.getByText(NAVIGATION_LABELS.TIME_TABLE)).toBeInTheDocument();
    expect(screen.getByText(NAVIGATION_LABELS.CUSTOMERS)).toBeInTheDocument();
    expect(screen.getByText(NAVIGATION_LABELS.PRODUCTS)).toBeInTheDocument();
    expect(screen.getByText(NAVIGATION_LABELS.USERS)).toBeInTheDocument();
    expect(screen.getByText(NAVIGATION_LABELS.GROUPS)).toBeInTheDocument();
    expect(screen.getByText(NAVIGATION_LABELS.DATA_DOWNLOAD)).toBeInTheDocument();
  });

  it('英語のメニュー項目が表示されない', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    // 英語のメニュー項目が表示されないことを確認
    expect(screen.queryByText('Devices')).not.toBeInTheDocument();
    expect(screen.queryByText('Classifications')).not.toBeInTheDocument();
    expect(screen.queryByText('PLCs')).not.toBeInTheDocument();
    expect(screen.queryByText('Alarm Groups')).not.toBeInTheDocument();
    expect(screen.queryByText('Time Table')).not.toBeInTheDocument();
    expect(screen.queryByText('Customers')).not.toBeInTheDocument();
    expect(screen.queryByText('Products')).not.toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Groups')).not.toBeInTheDocument();
    expect(screen.queryByText('Data Download')).not.toBeInTheDocument();
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
  });

  it('すべてのナビゲーションリンクが正しいhrefを持つ', () => {
    render(
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
    );

    // 各メニュー項目のリンクが正しいhrefを持つことを確認（完全一致で検索）
    expect(screen.getByRole('link', { name: NAVIGATION_LABELS.DEVICES })).toHaveAttribute('href', '/devices');
    expect(screen.getByRole('link', { name: NAVIGATION_LABELS.CLASSIFICATIONS })).toHaveAttribute('href', '/classifications');
    expect(screen.getByRole('link', { name: NAVIGATION_LABELS.PLCS })).toHaveAttribute('href', '/plcs');
    expect(screen.getByRole('link', { name: NAVIGATION_LABELS.TIME_TABLE })).toHaveAttribute('href', '/time-table');
    expect(screen.getByRole('link', { name: NAVIGATION_LABELS.CUSTOMERS })).toHaveAttribute('href', '/customers');
    expect(screen.getByRole('link', { name: NAVIGATION_LABELS.PRODUCTS })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: NAVIGATION_LABELS.USERS })).toHaveAttribute('href', '/users');
    expect(screen.getByRole('link', { name: NAVIGATION_LABELS.GROUPS })).toHaveAttribute('href', '/groups');
    expect(screen.getByRole('link', { name: NAVIGATION_LABELS.DATA_DOWNLOAD })).toHaveAttribute('href', '/data-download');
  });
});