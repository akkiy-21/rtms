/**
 * DataTable翻訳定数のテスト
 * 
 * DataTableで使用される翻訳定数が正しく定義されているかをテストします。
 */

import { TABLE_LABELS, DEFAULT_SEARCH_PLACEHOLDER, formatPaginationInfo, formatSelectionInfo } from '../../../localization/constants';

describe('DataTable 翻訳定数テスト', () => {
  it('TABLE_LABELSが正しく定義されている', () => {
    expect(TABLE_LABELS.NO_DATA).toBe('データがありません');
    expect(TABLE_LABELS.SEARCH_PLACEHOLDER()).toBe('検索...');
    expect(TABLE_LABELS.ROWS_PER_PAGE).toBe('ページあたりの行数');
    expect(TABLE_LABELS.FIRST_PAGE).toBe('最初のページへ');
    expect(TABLE_LABELS.PREVIOUS_PAGE).toBe('前のページへ');
    expect(TABLE_LABELS.NEXT_PAGE).toBe('次のページへ');
    expect(TABLE_LABELS.LAST_PAGE).toBe('最後のページへ');
  });

  it('DEFAULT_SEARCH_PLACEHOLDERが正しく設定されている', () => {
    expect(DEFAULT_SEARCH_PLACEHOLDER).toBe('検索...');
  });

  it('formatPaginationInfoが正しい日本語形式を返す', () => {
    expect(formatPaginationInfo(1, 5)).toBe('ページ 1 / 5');
    expect(formatPaginationInfo(3, 10)).toBe('ページ 3 / 10');
  });

  it('formatSelectionInfoが正しい日本語形式を返す', () => {
    expect(formatSelectionInfo(0, 10)).toBe('');
    expect(formatSelectionInfo(3, 10)).toBe('10件中 3件選択');
    expect(formatSelectionInfo(1, 1)).toBe('1件中 1件選択');
  });

  it('主要なラベルが日本語で定義されている', () => {
    const japaneseLabels = [
      TABLE_LABELS.NO_DATA,
      TABLE_LABELS.SEARCH_PLACEHOLDER(),
      TABLE_LABELS.ROWS_PER_PAGE,
      TABLE_LABELS.FIRST_PAGE,
      TABLE_LABELS.PREVIOUS_PAGE,
      TABLE_LABELS.NEXT_PAGE,
      TABLE_LABELS.LAST_PAGE,
    ];
    
    japaneseLabels.forEach(label => {
      // 日本語文字（ひらがな、カタカナ、漢字）が含まれているか確認
      expect(label).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
    });
  });

  it('アクセシビリティラベルが適切に設定されている', () => {
    expect(TABLE_LABELS.FIRST_PAGE).toContain('ページ');
    expect(TABLE_LABELS.PREVIOUS_PAGE).toContain('ページ');
    expect(TABLE_LABELS.NEXT_PAGE).toContain('ページ');
    expect(TABLE_LABELS.LAST_PAGE).toContain('ページ');
  });
});