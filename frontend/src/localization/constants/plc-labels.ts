import { TECHNICAL_TERMS } from './technical-terms';

/**
 * PLC関連の翻訳定数
 * 
 * PLC固有の用語とメーカー名、プロトコル名の翻訳を定義します。
 * 技術用語は英語表記を維持し、業務用語は適切な日本語を使用します。
 * 
 * Requirements: 1.2, 10.3
 */

export const PLC_LABELS = {
  // PLC基本情報
  PLC: TECHNICAL_TERMS.PLC,
  PLCS: TECHNICAL_TERMS.PLC,
  MODEL: 'モデル',
  MANUFACTURER: 'メーカー',
  PROTOCOL: 'プロトコル',
  
  // アドレス関連
  ADDRESS_RANGES: 'アドレスレンジ',
  ADDRESS_RANGE: 'アドレスレンジ',
  ADDRESS_TYPE: 'アドレスタイプ',
  ADDRESS_RANGE_VALUE: 'アドレス範囲',
  NUMERICAL_BASE: '数値基数',
  DATA_TYPE: 'データタイプ',
  
  // フォームラベル
  MODEL_PLACEHOLDER: 'モデル名を入力',
  MANUFACTURER_PLACEHOLDER: 'メーカーを選択',
  PROTOCOL_PLACEHOLDER: 'プロトコルを選択',
  ADDRESS_TYPE_PLACEHOLDER: 'タイプを入力',
  ADDRESS_RANGE_PLACEHOLDER: '範囲を入力',
  NUMERICAL_BASE_PLACEHOLDER: '基数を選択',
  DATA_TYPE_PLACEHOLDER: 'タイプを選択',
  
  // ページ関連
  PLC_MANAGEMENT: 'PLC管理',
  PLC_CONFIGURATION: 'PLC設定',
  PLC_CONFIGURATIONS: 'PLC設定',
  MANAGE_PLC_CONFIGURATIONS: 'PLC設定とアドレスレンジを管理',
  CREATE_NEW_PLC: '新規PLC作成',
  EDIT_PLC: 'PLC編集',
  
  // テーブル関連
  SEARCH_BY_MODEL: 'モデル名で検索...',
  NO_ADDRESS_RANGES: 'アドレスレンジが登録されていません',
  ADDRESS_RANGE_NUMBER: 'アドレスレンジ',
  
  // 警告メッセージ
  PLC_WARNING_TITLE: '警告',
  PLC_WARNING_MESSAGE: 'PLCデータの変更は、システムクラッシュを含む予期しない問題を引き起こす可能性があります。変更の影響を理解した上で、慎重に操作してください。',
  I_UNDERSTAND: '理解しました',
  
  // 削除確認
  DELETE_PLC: 'PLC削除',
  DELETE_PLC_CONFIRMATION: 'このPLCを削除してもよろしいですか？この操作は取り消せません。',
} as const;

/**
 * PLCメーカー名の翻訳マッピング
 * 
 * メーカー名は固有名詞のため、基本的に英語表記を維持しますが、
 * 日本語での表記が一般的な場合は日本語も併記します。
 * 
 * Requirements: 1.2, 10.3
 */
export const PLC_MANUFACTURERS = {
  KEYENCE: 'KEYENCE',
  OMRON: 'OMRON',
  MITSUBISHI: 'MITSUBISHI',
  
  // 表示用ラベル（必要に応じて日本語併記）
  KEYENCE_LABEL: 'KEYENCE',
  OMRON_LABEL: 'OMRON',
  MITSUBISHI_LABEL: 'MITSUBISHI',
} as const;

/**
 * PLCプロトコル名の翻訳マッピング
 * 
 * プロトコル名は技術用語のため英語表記を維持します。
 * 
 * Requirements: 10.3
 */
export const PLC_PROTOCOLS = {
  MC: 'MC',
  FINS: 'FINS',
  
  // 表示用ラベル
  MC_LABEL: 'MC',
  FINS_LABEL: 'FINS',
} as const;

/**
 * 数値基数の翻訳マッピング
 * 
 * Requirements: 1.2
 */
export const NUMERICAL_BASE_LABELS = {
  DECIMAL: '10進数',
  HEX: '16進数',
  
  // 値とラベルのマッピング
  decimal: '10進数',
  hex: '16進数',
} as const;

/**
 * データタイプの翻訳マッピング
 * 
 * Requirements: 1.2
 */
export const DATA_TYPE_LABELS = {
  BIT: 'ビット',
  WORD: 'ワード',
  
  // 値とラベルのマッピング
  bit: 'ビット',
  word: 'ワード',
} as const;

export type PLCLabel = typeof PLC_LABELS[keyof typeof PLC_LABELS];
export type PLCManufacturer = typeof PLC_MANUFACTURERS[keyof typeof PLC_MANUFACTURERS];
export type PLCProtocol = typeof PLC_PROTOCOLS[keyof typeof PLC_PROTOCOLS];
export type NumericalBaseLabel = typeof NUMERICAL_BASE_LABELS[keyof typeof NUMERICAL_BASE_LABELS];
export type DataTypeLabel = typeof DATA_TYPE_LABELS[keyof typeof DATA_TYPE_LABELS];