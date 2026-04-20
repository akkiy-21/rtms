import { render, screen, fireEvent } from '@testing-library/react';
import { Column } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../data-table-column-header';
import { TABLE_LABELS } from '@/localization/constants/table-labels';

// モックカラムを作成するヘルパー関数
const createMockColumn = (canSort: boolean = true, sortState: false | 'asc' | 'desc' = false) => {
  return {
    getCanSort: jest.fn(() => canSort),
    getIsSorted: jest.fn(() => sortState),
    toggleSorting: jest.fn(),
  } as unknown as Column<any, any>;
};

describe('DataTableColumnHeader', () => {
  const defaultProps = {
    title: 'テストカラム',
    className: 'test-class',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ソート不可能なカラム', () => {
    it('ソート不可能な場合、単純なdivとして表示される', () => {
      const column = createMockColumn(false);
      
      render(
        <DataTableColumnHeader
          column={column}
          {...defaultProps}
        />
      );

      expect(screen.getByText('テストカラム')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('ソート可能なカラム', () => {
    it('ソート未設定の場合、適切なツールチップとaria-labelが設定される', () => {
      const column = createMockColumn(true, false);
      
      render(
        <DataTableColumnHeader
          column={column}
          {...defaultProps}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', `テストカラムを${TABLE_LABELS.SORT_DESC}`);
      expect(button).toHaveAttribute('aria-label', 'テストカラム、ソートなし。クリックで降順にソート');
    });

    it('昇順ソート時、適切なツールチップとaria-labelが設定される', () => {
      const column = createMockColumn(true, 'asc');
      
      render(
        <DataTableColumnHeader
          column={column}
          {...defaultProps}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', `テストカラムを${TABLE_LABELS.SORT_CLEAR}`);
      expect(button).toHaveAttribute('aria-label', 'テストカラム、昇順でソート済み。クリックでソートをクリア');
    });

    it('降順ソート時、適切なツールチップとaria-labelが設定される', () => {
      const column = createMockColumn(true, 'desc');
      
      render(
        <DataTableColumnHeader
          column={column}
          {...defaultProps}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', `テストカラムを${TABLE_LABELS.SORT_ASC}`);
      expect(button).toHaveAttribute('aria-label', 'テストカラム、降順でソート済み。クリックで昇順にソート');
    });

    it('ボタンクリック時にtoggleSortingが呼ばれる', () => {
      const column = createMockColumn(true, false);
      
      render(
        <DataTableColumnHeader
          column={column}
          {...defaultProps}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(column.toggleSorting).toHaveBeenCalledWith(false);
    });

    it('昇順ソート時のクリックでtoggleSorting(true)が呼ばれる', () => {
      const column = createMockColumn(true, 'asc');
      
      render(
        <DataTableColumnHeader
          column={column}
          {...defaultProps}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(column.toggleSorting).toHaveBeenCalledWith(true);
    });

    it('適切なソートアイコンが表示される', () => {
      // ソート未設定の場合
      const { rerender } = render(
        <DataTableColumnHeader
          column={createMockColumn(true, false)}
          {...defaultProps}
        />
      );
      expect(document.querySelector('.lucide-arrow-up-down')).toBeInTheDocument();

      // 昇順ソートの場合
      rerender(
        <DataTableColumnHeader
          column={createMockColumn(true, 'asc')}
          {...defaultProps}
        />
      );
      expect(document.querySelector('.lucide-arrow-up')).toBeInTheDocument();

      // 降順ソートの場合
      rerender(
        <DataTableColumnHeader
          column={createMockColumn(true, 'desc')}
          {...defaultProps}
        />
      );
      expect(document.querySelector('.lucide-arrow-down')).toBeInTheDocument();
    });

    it('アイコンにaria-hidden属性が設定される', () => {
      render(
        <DataTableColumnHeader
          column={createMockColumn(true, false)}
          {...defaultProps}
        />
      );

      const icon = document.querySelector('.lucide-arrow-up-down');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('翻訳対応', () => {
    it('TABLE_LABELSの翻訳定数が正しく使用される', () => {
      const column = createMockColumn(true, false);
      
      render(
        <DataTableColumnHeader
          column={column}
          {...defaultProps}
        />
      );

      const button = screen.getByRole('button');
      const expectedTooltip = `テストカラムを${TABLE_LABELS.SORT_DESC}`;
      expect(button).toHaveAttribute('title', expectedTooltip);
    });
  });
});