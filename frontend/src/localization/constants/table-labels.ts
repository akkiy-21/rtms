/**
 * テーブル関連ラベル翻訳定数
 * 
 * データテーブルで使用される各種ラベルとメッセージの日本語翻訳です。
 * 検索、ページネーション、選択状態などの統一された表現を提供します。
 * 
 * Requirements: 3.3, 3.4, 3.5
 */

export const TABLE_LABELS = {
  // 検索関連
  SEARCH_PLACEHOLDER: (entityName?: string) => entityName ? `${entityName}で検索...` : '検索...',
  SEARCH_RESULTS: '検索結果',
  NO_RESULTS: '検索結果がありません',
  CLEAR_SEARCH: '検索をクリア',
  
  // データ表示
  NO_DATA: 'データがありません',
  LOADING_DATA: '読み込み中...',
  EMPTY_TABLE: 'テーブルにデータがありません',
  
  // ページネーション
  PAGE: 'ページ',
  OF: '/',
  ROWS_PER_PAGE: 'ページあたりの行数',
  ITEMS_SELECTED: (count: number) => `${count}件選択`,
  ITEMS_OF_TOTAL: (selected: number, total: number) => `${total}件中 ${selected}件選択`,
  
  // ページナビゲーション
  FIRST_PAGE: '最初のページへ',
  PREVIOUS_PAGE: '前のページへ',
  NEXT_PAGE: '次のページへ',
  LAST_PAGE: '最後のページへ',
  
  // ソート関連
  SORT_ASC: '昇順でソート',
  SORT_DESC: '降順でソート',
  SORT_CLEAR: 'ソートをクリア',
  
  // 列表示制御
  SHOW_COLUMNS: '列を表示',
  HIDE_COLUMNS: '列を非表示',
  TOGGLE_COLUMNS: '列の表示切替',
  
  // 行選択
  SELECT_ROW: '行を選択',
  SELECT_ALL_ROWS: 'すべての行を選択',
  DESELECT_ALL_ROWS: 'すべての行の選択を解除',
  
  // アクション
  ACTIONS: 'アクション',
  VIEW_DETAILS: '詳細を表示',
  EDIT_ITEM: '編集',
  DELETE_ITEM: '削除',
  
  // フィルター
  FILTER: 'フィルター',
  CLEAR_FILTERS: 'フィルターをクリア',
  APPLY_FILTERS: 'フィルターを適用',
  
  // エクスポート
  EXPORT_DATA: 'データをエクスポート',
  EXPORT_SELECTED: '選択項目をエクスポート',
  EXPORT_ALL: 'すべてをエクスポート',
} as const;

export type TableLabel = typeof TABLE_LABELS[keyof typeof TABLE_LABELS] | ReturnType<typeof TABLE_LABELS.SEARCH_PLACEHOLDER>;

/**
 * ページネーション情報のフォーマット関数
 */
export const formatPaginationInfo = (
  currentPage: number,
  totalPages: number
): string => {
  return `${TABLE_LABELS.PAGE} ${currentPage} ${TABLE_LABELS.OF} ${totalPages}`;
};

/**
 * 選択状態のフォーマット関数
 */
export const formatSelectionInfo = (
  selectedCount: number,
  totalCount: number
): string => {
  if (selectedCount === 0) {
    return '';
  }
  return TABLE_LABELS.ITEMS_OF_TOTAL(selectedCount, totalCount);
};

/**
 * 行数選択オプション
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;

/**
 * デフォルトの検索プレースホルダー
 */
export const DEFAULT_SEARCH_PLACEHOLDER = TABLE_LABELS.SEARCH_PLACEHOLDER();