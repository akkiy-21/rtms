/**
 * DataTablePagination翻訳ユーティリティのテスト
 * 
 * DataTablePaginationで使用される翻訳ユーティリティ関数をテストします。
 */

import { TABLE_LABELS, formatPaginationInfo, formatSelectionInfo, PAGE_SIZE_OPTIONS } from '../../../localization/constants';

describe('DataTablePagination 翻訳ユーティリティテスト', () => {
  describe('formatPaginationInfo', () => {
    it('正しいページ情報形式を返す', () => {
      expect(formatPaginationInfo(1, 1)).toBe('ページ 1 / 1');
      expect(formatPaginationInfo(2, 5)).toBe('ページ 2 / 5');
      expect(formatPaginationInfo(10, 20)).toBe('ページ 10 / 20');
    });

    it('大きな数値でも正しく動作する', () => {
      expect(formatPaginationInfo(999, 1000)).toBe('ページ 999 / 1000');
    });
  });

  describe('formatSelectionInfo', () => {
    it('選択なしの場合は空文字を返す', () => {
      expect(formatSelectionInfo(0, 10)).toBe('');
      expect(formatSelectionInfo(0, 0)).toBe('');
    });

    it('選択ありの場合は正しい形式を返す', () => {
      expect(formatSelectionInfo(1, 10)).toBe('10件中 1件選択');
      expect(formatSelectionInfo(5, 10)).toBe('10件中 5件選択');
      expect(formatSelectionInfo(10, 10)).toBe('10件中 10件選択');
    });

    it('単数・複数の場合でも正しく動作する', () => {
      expect(formatSelectionInfo(1, 1)).toBe('1件中 1件選択');
      expect(formatSelectionInfo(100, 200)).toBe('200件中 100件選択');
    });
  });

  describe('PAGE_SIZE_OPTIONS', () => {
    it('適切なページサイズオプションが定義されている', () => {
      expect(PAGE_SIZE_OPTIONS).toEqual([10, 20, 30, 40, 50]);
    });

    it('すべてのオプションが正の整数である', () => {
      PAGE_SIZE_OPTIONS.forEach(option => {
        expect(typeof option).toBe('number');
        expect(option).toBeGreaterThan(0);
        expect(Number.isInteger(option)).toBe(true);
      });
    });

    it('オプションが昇順でソートされている', () => {
      for (let i = 1; i < PAGE_SIZE_OPTIONS.length; i++) {
        expect(PAGE_SIZE_OPTIONS[i]).toBeGreaterThan(PAGE_SIZE_OPTIONS[i - 1]);
      }
    });
  });

  describe('TABLE_LABELS ページネーション関連', () => {
    it('ページネーション関連のラベルが正しく定義されている', () => {
      expect(TABLE_LABELS.ROWS_PER_PAGE).toBe('ページあたりの行数');
      expect(TABLE_LABELS.PAGE).toBe('ページ');
      expect(TABLE_LABELS.OF).toBe('/');
    });

    it('ナビゲーションラベルが正しく定義されている', () => {
      expect(TABLE_LABELS.FIRST_PAGE).toBe('最初のページへ');
      expect(TABLE_LABELS.PREVIOUS_PAGE).toBe('前のページへ');
      expect(TABLE_LABELS.NEXT_PAGE).toBe('次のページへ');
      expect(TABLE_LABELS.LAST_PAGE).toBe('最後のページへ');
    });

    it('選択関連のラベルが関数として定義されている', () => {
      expect(typeof TABLE_LABELS.ITEMS_SELECTED).toBe('function');
      expect(typeof TABLE_LABELS.ITEMS_OF_TOTAL).toBe('function');
    });

    it('選択関連の関数が正しい結果を返す', () => {
      expect(TABLE_LABELS.ITEMS_SELECTED(5)).toBe('5件選択');
      expect(TABLE_LABELS.ITEMS_OF_TOTAL(3, 10)).toBe('10件中 3件選択');
    });
  });
});