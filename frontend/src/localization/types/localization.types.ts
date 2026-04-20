/**
 * 翻訳関連の型定義
 * 
 * 翻訳システム全体で使用される型定義を提供します。
 * 型安全性を確保し、一貫した翻訳実装を支援します。
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.4
 */

import { TECHNICAL_TERMS } from '../constants/technical-terms';
import { BUSINESS_TERMS } from '../constants/business-terms';
import { ACTION_LABELS } from '../constants/action-labels';
import { STATUS_LABELS } from '../constants/status-labels';
import { VALIDATION_MESSAGES } from '../constants/validation-messages';

// 型定義は各定数ファイルで定義されているため、ここでは再定義しない
// import { TechnicalTerm } from '../constants/technical-terms';
// import { BusinessTerm } from '../constants/business-terms';
// import { ActionLabel } from '../constants/action-labels';
// import { StatusLabel } from '../constants/status-labels';

/**
 * バリデーションメッセージキーの型定義
 */
export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;

/**
 * 翻訳可能な用語の統合型
 */
export type TranslatableTerm = 
  | typeof TECHNICAL_TERMS[keyof typeof TECHNICAL_TERMS]
  | typeof BUSINESS_TERMS[keyof typeof BUSINESS_TERMS]
  | typeof ACTION_LABELS[keyof typeof ACTION_LABELS]
  | typeof STATUS_LABELS[keyof typeof STATUS_LABELS];

/**
 * 翻訳カテゴリの列挙型
 */
export enum TranslationCategory {
  TECHNICAL = 'technical',
  BUSINESS = 'business',
  ACTION = 'action',
  STATUS = 'status',
  VALIDATION = 'validation',
  NAVIGATION = 'navigation',
}

/**
 * 翻訳エラーの種類
 */
export enum TranslationErrorType {
  MISSING_KEY = 'missing_key',
  INVALID_PARAMETER = 'invalid_parameter',
  INCONSISTENT_USAGE = 'inconsistent_usage',
  TECHNICAL_TERM_TRANSLATED = 'technical_term_translated',
  BUSINESS_TERM_NOT_TRANSLATED = 'business_term_not_translated',
  FORMAT_ERROR = 'format_error',
}

/**
 * 翻訳エラーの詳細情報
 */
export interface TranslationError {
  type: TranslationErrorType;
  message: string;
  key?: string;
  expectedValue?: string;
  actualValue?: string;
  context?: string;
  suggestions?: string[];
}

/**
 * 翻訳検証の結果
 */
export interface TranslationValidationResult {
  isValid: boolean;
  errors: TranslationError[];
  warnings: TranslationError[];
  suggestions: string[];
}

/**
 * 用語使用の一貫性チェック結果
 */
export interface TermConsistencyResult {
  term: string;
  category: TranslationCategory;
  usages: TermUsage[];
  isConsistent: boolean;
  recommendedTranslation?: string;
}

/**
 * 用語の使用箇所情報
 */
export interface TermUsage {
  location: string;
  context: string;
  translation: string;
  isCorrect: boolean;
}

/**
 * 翻訳設定のオプション
 */
export interface TranslationOptions {
  strictMode?: boolean;
  allowTechnicalTermTranslation?: boolean;
  requireBusinessTermTranslation?: boolean;
  validateConsistency?: boolean;
  logWarnings?: boolean;
}

/**
 * メッセージフォーマットのパラメータ型
 */
export type MessageFormatParams = {
  [key: string]: string | number | boolean;
};

/**
 * 日付フォーマットのオプション
 */
export interface DateFormatOptions {
  includeTime?: boolean;
  includeSeconds?: boolean;
  useRelativeTime?: boolean;
  maxRelativeDays?: number;
}

/**
 * 翻訳コンテキスト情報
 */
export interface TranslationContext {
  component?: string;
  page?: string;
  feature?: string;
  userRole?: string;
  locale?: string;
}

/**
 * 翻訳キーのパス型
 */
export type TranslationKeyPath = string;

/**
 * 翻訳値の型
 */
export type TranslationValue = string | ((params?: MessageFormatParams) => string);

/**
 * 翻訳辞書の型
 */
export type TranslationDictionary = {
  [key: TranslationKeyPath]: TranslationValue;
};

/**
 * 翻訳プロバイダーのインターフェース
 */
export interface TranslationProvider {
  get(key: TranslationKeyPath, params?: MessageFormatParams): string;
  has(key: TranslationKeyPath): boolean;
  validate(key: TranslationKeyPath, value: string): TranslationValidationResult;
  getCategory(key: TranslationKeyPath): TranslationCategory | null;
}

/**
 * 翻訳ミドルウェアの型
 */
export type TranslationMiddleware = (
  key: TranslationKeyPath,
  value: string,
  context?: TranslationContext
) => string;

/**
 * 翻訳フック関数の型
 */
export type TranslationHook = (
  event: 'before_translate' | 'after_translate' | 'validation_error',
  data: {
    key: TranslationKeyPath;
    value?: string;
    error?: TranslationError;
    context?: TranslationContext;
  }
) => void;

/**
 * 翻訳統計情報
 */
export interface TranslationStats {
  totalKeys: number;
  translatedKeys: number;
  missingKeys: number;
  errorCount: number;
  warningCount: number;
  consistencyScore: number;
}

/**
 * 翻訳品質メトリクス
 */
export interface TranslationQualityMetrics {
  technicalTermConsistency: number;
  businessTermConsistency: number;
  messageFormatAccuracy: number;
  overallQuality: number;
  recommendations: string[];
}

/**
 * 翻訳レポートの型
 */
export interface TranslationReport {
  timestamp: Date;
  stats: TranslationStats;
  quality: TranslationQualityMetrics;
  errors: TranslationError[];
  warnings: TranslationError[];
  suggestions: string[];
}

/**
 * 型ガード関数：技術用語かどうかを判定
 */
export function isTechnicalTerm(term: string): term is typeof TECHNICAL_TERMS[keyof typeof TECHNICAL_TERMS] {
  return Object.values(TECHNICAL_TERMS).includes(term as typeof TECHNICAL_TERMS[keyof typeof TECHNICAL_TERMS]);
}

/**
 * 型ガード関数：業務用語かどうかを判定
 */
export function isBusinessTerm(term: string): term is typeof BUSINESS_TERMS[keyof typeof BUSINESS_TERMS] {
  return Object.values(BUSINESS_TERMS).includes(term as typeof BUSINESS_TERMS[keyof typeof BUSINESS_TERMS]);
}

/**
 * 型ガード関数：アクションラベルかどうかを判定
 */
export function isActionLabel(term: string): term is typeof ACTION_LABELS[keyof typeof ACTION_LABELS] {
  return Object.values(ACTION_LABELS).includes(term as typeof ACTION_LABELS[keyof typeof ACTION_LABELS]);
}

/**
 * 型ガード関数：ステータスラベルかどうかを判定
 */
export function isStatusLabel(term: string): term is typeof STATUS_LABELS[keyof typeof STATUS_LABELS] {
  return Object.values(STATUS_LABELS).includes(term as typeof STATUS_LABELS[keyof typeof STATUS_LABELS]);
}

/**
 * 翻訳可能な用語かどうかを判定
 */
export function isTranslatableTerm(term: string): term is TranslatableTerm {
  return isTechnicalTerm(term) || isBusinessTerm(term) || isActionLabel(term) || isStatusLabel(term);
}