import { TECHNICAL_TERMS } from './technical-terms';

/**
 * 設定関連の翻訳定数
 * 
 * 効率性、IO、品質管理、タイムテーブル、データダウンロード固有の翻訳定数を定義します。
 * これらの設定機能で使用される専門用語と操作ラベルを統一します。
 * 
 * Requirements: 1.2, 7.5
 */

export const SETTINGS_LABELS = {
  // 効率性設定関連
  EFFICIENCY: '効率性',
  EFFICIENCY_SETTINGS: '効率性設定',
  EFFICIENCY_ADDRESS: '効率性アドレス',
  EFFICIENCY_ADDRESSES: '効率性アドレス',
  NEW_EFFICIENCY_ADDRESS: '新しい効率性アドレスを作成',
  EDIT_EFFICIENCY_ADDRESS: '効率性アドレスを編集',
  CREATE_EFFICIENCY_ADDRESS: '効率性アドレスを作成',
  DELETE_EFFICIENCY_ADDRESS: '効率性アドレスを削除',
  EFFICIENCY_ADDRESS_CREATED: '効率性アドレスを作成しました',
  EFFICIENCY_ADDRESS_UPDATED: '効率性アドレスを更新しました',
  EFFICIENCY_ADDRESS_DELETED: '効率性アドレスを削除しました',
  EFFICIENCY_ADDRESS_CREATE_FAILED: '効率性アドレスの作成に失敗しました',
  EFFICIENCY_ADDRESS_UPDATE_FAILED: '効率性アドレスの更新に失敗しました',
  EFFICIENCY_ADDRESS_DELETE_FAILED: '効率性アドレスの削除に失敗しました',
  EFFICIENCY_ADDRESS_FETCH_FAILED: '効率性アドレスの取得に失敗しました',
  EFFICIENCY_ADDRESS_DELETE_CONFIRM: 'この効率性アドレスを削除してもよろしいですか？この操作は取り消せません。',
  MANAGE_EFFICIENCY_ADDRESSES: 'デバイスの効率性アドレスを管理します',
  
  // IO設定関連
  IO_SETTINGS: `${TECHNICAL_TERMS.IO}設定`,
  INPUT_OUTPUT_SETTINGS: '入出力設定',
  IO_CONFIGURATION: `${TECHNICAL_TERMS.IO}設定`,
  DEVICE_IO_SETTINGS: `デバイスの${TECHNICAL_TERMS.IO}設定を管理します`,
  INPUT_OUTPUT_CONFIGURATION: 'デバイスの入出力設定を構成します',
  IO_SETTINGS_UNDER_DEVELOPMENT: `${TECHNICAL_TERMS.IO}設定機能は現在開発中です。`,
  IO_SETTINGS_FUTURE_VERSION: 'この機能は将来のバージョンで実装予定です。',
  DEVICE_INFORMATION: 'デバイス情報',
  CURRENT_DEVICE_INFO: '現在選択されているデバイスの基本情報',
  DEVICE_NAME: 'デバイス名',
  DEVICE_ID: 'デバイスID',
  MAC_ADDRESS: 'MACアドレス',
  SSH_LATEST_IP: 'SSH接続IP',
  SSH_USERNAME: 'SSHログインID',
  STANDARD_CYCLE_TIME: '標準サイクル時間',
  NOT_SET: '未設定',
  SECONDS: '秒',
  MINUTES: '分',
  
  // 品質管理シグナル関連
  QUALITY_CONTROL: '品質管理',
  QUALITY_CONTROL_SIGNALS: '品質管理シグナル',
  QUALITY_CONTROL_SIGNAL: '品質管理シグナル',
  ADD_NEW_SIGNAL: '新しいシグナルを追加',
  EDIT_SIGNAL: 'シグナルを編集',
  DELETE_SIGNAL: '品質管理シグナルを削除',
  SIGNAL_NAME: 'シグナル名',
  SIGNAL_TYPE: 'シグナルタイプ',
  PARENT_SIGNAL: '親シグナル',
  QC_CLIENT: 'クライアント',
  QC_ADDRESS_TYPE: 'アドレスタイプ',
  QC_ADDRESS: 'アドレス',
  SIGNAL_SHOT_NUMBER: 'シグナルショット番号',
  SHOT_NUMBER: 'ショット番号',
  NO_SIGNALS_FOUND: '品質管理シグナルが見つかりません。',
  SIGNAL_CREATED: '品質管理シグナルを作成しました',
  SIGNAL_UPDATED: '品質管理シグナルを更新しました',
  SIGNAL_DELETED: '品質管理シグナルを削除しました',
  SIGNAL_CREATE_FAILED: '品質管理シグナルの作成に失敗しました',
  SIGNAL_UPDATE_FAILED: '品質管理シグナルの更新に失敗しました',
  SIGNAL_DELETE_FAILED: '品質管理シグナルの削除に失敗しました',
  SIGNAL_DELETE_CONFIRM: 'この品質管理シグナルを削除してもよろしいですか？この操作は取り消せません。',
  MANAGE_QUALITY_SIGNALS: 'デバイスの品質管理シグナルを管理します',
  SELECT_SIGNAL_TYPE: 'シグナルタイプを選択',
  SELECT_PARENT_SIGNAL: '親シグナルを選択',
  QC_SELECT_CLIENT: 'クライアントを選択',
  QC_SELECT_ADDRESS_TYPE: 'アドレスタイプを選択',
  NONE: 'なし',
  SAVE: '保存',
  
  // シグナルタイプ
  SIGNAL_TYPE_GOOD: '良品',
  SIGNAL_TYPE_NG: '不良品',
  SIGNAL_TYPE_OPTIONAL: 'オプション',
  
  // タイムテーブル関連
  TIME_TABLE: 'タイムテーブル',
  TIME_TABLE_MANAGEMENT: 'タイムテーブル管理',
  GENERATE_TIME_TABLE: 'タイムテーブル生成',
  BASE_TIME: 'ベース時間',
  GENERATING: '生成中...',
  GENERATE_AND_MANAGE_TIME_TABLES: 'タイムテーブルの生成と管理を行います',
  TIME_TABLE_GENERATED: 'タイムテーブルを生成しました',
  TIME_TABLE_GENERATION_FAILED: 'タイムテーブルの生成に失敗しました',
  TIME_TABLE_FETCH_FAILED: 'タイムテーブルの取得に失敗しました',
  SEARCH_TIME_TABLES: 'タイムテーブルを検索...',
  START_TIME: '開始時間',
  END_TIME: '終了時間',
  
  // データダウンロード関連
  DATA_DOWNLOAD: 'データダウンロード',
  DEVICE_DATA_DOWNLOAD: 'デバイスデータダウンロード',
  SELECT_DATE: '日付を選択',
  SELECT_DATE_PLACEHOLDER: '日付を選択してください',
  ENCODING_FORMAT: 'エンコード形式',
  SELECT_ENCODING: 'エンコード形式を選択',
  DEVICE_SELECTION: 'デバイス選択',
  SELECT_ALL: '全て選択',
  UNSELECT_ALL: '全て解除',
  CSV_DOWNLOAD: 'CSVダウンロード',
  DOWNLOAD_DEVICE_DATA_CSV: 'デバイスのデータをCSVファイルとしてダウンロードできます',
  DOWNLOAD_COMPLETED: 'ダウンロードが完了しました',
  DOWNLOAD_ERROR: 'ダウンロード中にエラーが発生しました',
  DATA_NOT_EXISTS: 'データが存在しません',
  
  // CSVインポート関連
  CSV_IMPORT: 'CSVインポート',
  CSV_IMPORTER: 'CSVインポーター',
  UPLOAD_CSV_FILE: 'CSVファイルをアップロード',
  SELECT_FILE: 'ファイルを選択',
  DRAG_DROP_FILE: 'ファイルをドラッグ&ドロップするか、クリックして選択してください',
  SUPPORTED_FORMAT: '対応形式',
  SUPPORTED_FORMATS: 'サポートされているフォーマット',
  FILE_FORMAT_DESCRIPTION: 'サポートされているフォーマット:',
  FILE_SIZE_INFO: 'ファイルサイズ',
  REMOVE_FILE: 'ファイルを削除',
  FILE_READING_ERROR: 'ファイルの読み込みエラーが発生しました',
  INVALID_CSV_FORMAT: 'CSVファイルの形式が正しくありません',
  CSV_PARSE_ERROR: 'CSVファイルの解析に失敗しました',
  
  // ファイル形式説明
  FORMAT_OLD_STYLE: '[PLC番号]D番号:ビット番号',
  FORMAT_NEW_STYLE: 'D番号_ビット番号',
  FORMAT_EXTENDED: '番号,[PLC番号]番号.ビット番号,データ,コメント',
  
  // エンコード形式
  ENCODING_UTF8: 'UTF-8',
  ENCODING_SHIFT_JIS: 'Shift-JIS',
  ENCODING_EUC_JP: 'EUC-JP',
  
  // 共通設定用語
  SETTINGS: '設定',
  CONFIGURATION: '設定',
  MANAGEMENT: '管理',
  DETAILS_SETTINGS: '詳細設定',
  
  // アドレス関連
  ADDRESS_RANGE: 'アドレス範囲',
  ADDRESS_VALIDATION_ERROR: 'アドレスは{min}から{max}の範囲で入力してください',
  BIT_VALIDATION_ERROR: 'ビット部分は0から15の範囲で入力してください',
  BIT_ADDRESS_ERROR: 'ビットアドレスには小数点を使用できません',
  WORD_ADDRESS_HELP: 'ワードアドレスの場合、ビット指定に .0 から .15 を使用できます',
  
  // 分類関連
  SELECT_CLASSIFICATION: '分類を選択',
  
  // クライアント関連
  CLIENT_FETCH_FAILED: 'クライアントの取得に失敗しました',
  
  // フォーム関連
  REQUIRED_FIELD: '{field}は必須です',
  CREATE: '作成',
  UPDATE: '更新',
  CANCEL: 'キャンセル',
  EDIT: '編集',
  DELETE: '削除',
  
  // エラーメッセージ
  DEVICE_INFO_FETCH_FAILED: 'デバイス情報の取得に失敗しました',
  DEVICE_NOT_FOUND: 'デバイスが見つかりません',
  CLASSIFICATION_FETCH_FAILED: '分類の取得に失敗しました',
  DATA_LOAD_FAILED: 'Failed to load data',
  
  // 成功メッセージ
  SUCCESS: '成功',
  ERROR: 'エラー',
  
  // その他
  UNKNOWN: 'Unknown',
  RETRY: '再試行',
  LOADING: '読み込み中...',
  PROCESSING: '処理中...',
} as const;

export type SettingsLabel = typeof SETTINGS_LABELS[keyof typeof SETTINGS_LABELS];