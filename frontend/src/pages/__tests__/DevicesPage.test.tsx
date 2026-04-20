/**
 * DevicesPage 翻訳テスト
 * 
 * DevicesPageコンポーネントが正しく日本語化されているかをテストします。
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DevicesPage from '../DevicesPage';
import { getDevices } from '../../services/api';
import { DEVICE_LABELS } from '@/localization/constants/device-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';

// APIをモック
jest.mock('../../services/api', () => ({
  getDevices: jest.fn(),
  deleteDevice: jest.fn(),
}));

const mockGetDevices = require('../../services/api').getDevices;

// useApiErrorフックをモック
jest.mock('@/hooks/use-api-error', () => ({
  useApiError: () => ({
    handleError: jest.fn(),
  }),
}));

// device-columnsをモック
jest.mock('@/components/features/devices/device-columns', () => ({
  createDeviceColumns: () => [
    {
      id: 'name',
      header: 'デバイス名',
      accessorKey: 'name',
    },
  ],
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DevicesPage 翻訳テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ページタイトルが日本語で表示される', async () => {
    mockGetDevices.mockResolvedValue([]);

    renderWithRouter(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText(DEVICE_LABELS.PAGES.LIST)).toBeInTheDocument();
    });
  });

  it('ページ説明が日本語で表示される', async () => {
    mockGetDevices.mockResolvedValue([]);

    renderWithRouter(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText(`システムの${DEVICE_LABELS.DEVICES}を管理します`)).toBeInTheDocument();
    });
  });

  it('新規作成ボタンが日本語で表示される', async () => {
    mockGetDevices.mockResolvedValue([]);

    renderWithRouter(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText(`${ACTION_LABELS.CREATE_NEW}${DEVICE_LABELS.DEVICE}`)).toBeInTheDocument();
    });
  });

  it('検索プレースホルダーが日本語で表示される', async () => {
    mockGetDevices.mockResolvedValue([]);

    renderWithRouter(<DevicesPage />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(DEVICE_LABELS.PLACEHOLDERS.SEARCH);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('エラーメッセージが日本語で表示される', async () => {
    const errorMessage = 'デバイスの取得に失敗しました';
    mockGetDevices.mockRejectedValue(new Error(errorMessage));

    renderWithRouter(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});