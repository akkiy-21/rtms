/**
 * アクションラベル翻訳定数
 * 
 * ボタンやメニューのアクションを示すラベルの日本語翻訳です。
 * 統一されたアクション表現により、直感的な操作を実現します。
 * 
 * Requirements: 1.3, 6.1
 */

export const ACTION_LABELS = {
  // CRUD操作
  CREATE: '作成',
  CREATE_NEW: '新規作成',
  ADD: '追加',
  ADD_NEW: '新規追加',
  EDIT: '編集',
  UPDATE: '更新',
  DELETE: '削除',
  REMOVE: '削除',
  SAVE: '保存',
  CANCEL: 'キャンセル',
  
  // 表示・閲覧
  VIEW: '表示',
  SHOW: '表示',
  HIDE: '非表示',
  PREVIEW: 'プレビュー',
  DETAILS: '詳細',
  
  // ナビゲーション
  BACK: '戻る',
  NEXT: '次へ',
  PREVIOUS: '前へ',
  CONTINUE: '続行',
  FINISH: '完了',
  
  // データ操作
  SEARCH: '検索',
  FILTER: 'フィルター',
  SORT: 'ソート',
  REFRESH: '更新',
  RELOAD: '再読み込み',
  RETRY: '再試行',
  
  // ファイル操作
  DOWNLOAD: 'ダウンロード',
  UPLOAD: 'アップロード',
  IMPORT: 'インポート',
  EXPORT: 'エクスポート',
  
  // 確認・実行
  CONFIRM: '確認',
  SUBMIT: '送信',
  APPLY: '適用',
  EXECUTE: '実行',
  RUN: '実行',
  
  // リセット・クリア
  RESET: 'リセット',
  CLEAR: 'クリア',
  CLEAR_ALL: 'すべてクリア',
  
  // 表示制御
  EXPAND: '展開',
  COLLAPSE: '折りたたみ',
  EXPAND_ALL: 'すべて展開',
  COLLAPSE_ALL: 'すべて折りたたみ',
  
  // 選択操作
  SELECT: '選択',
  SELECT_ALL: 'すべて選択',
  DESELECT: '選択解除',
  DESELECT_ALL: 'すべて選択解除',
  
  // コピー・移動
  COPY: 'コピー',
  MOVE: '移動',
  DUPLICATE: '複製',
  
  // 接続・切断
  CONNECT: '接続',
  DISCONNECT: '切断',
  
  // 開始・停止
  START: '開始',
  STOP: '停止',
  PAUSE: '一時停止',
  RESUME: '再開',
  
  // 設定
  CONFIGURE: '設定',
  SETTINGS: '設定',
  
  // ヘルプ・情報
  HELP: 'ヘルプ',
  INFO: '情報',
  ABOUT: 'について',
  
  // その他
  OK: 'OK',
  YES: 'はい',
  NO: 'いいえ',
  CLOSE: '閉じる',
  OPEN: '開く',
} as const;

export type ActionLabel = typeof ACTION_LABELS[keyof typeof ACTION_LABELS];