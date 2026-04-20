/**
 * 翻訳用語バリデーターとエラーハンドリング
 * 
 * 翻訳の一貫性チェック、用語の適切な使用検証、
 * エラーハンドリング機能を提供します。
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.4
 */

import { TECHNICAL_TERMS } from '../constants/technical-terms';
import { BUSINESS_TERMS } from '../constants/business-terms';
import { ACTION_LABELS } from '../constants/action-labels';
import { STATUS_LABELS } from '../constants/status-labels';
import {
  TranslationError,
  TranslationErrorType,
  TranslationValidationResult,
  TermConsistencyResult,
  TermUsage,
  TranslationCategory,
  TranslationOptions,
  TranslationContext,
  TranslationStats,
  TranslationQualityMetrics,
  TranslationReport,
  isTechnicalTerm,
  isBusinessTerm,
  isActionLabel,
  isStatusLabel,
} from '../types/localization.types';

/**
 * デフォルトの翻訳オプション
 */
const DEFAULT_OPTIONS: Required<TranslationOptions> = {
  strictMode: true,
  allowTechnicalTermTranslation: false,
  requireBusinessTermTranslation: true,
  validateConsistency: true,
  logWarnings: true,
};

/**
 * 翻訳エラーを作成するヘルパー関数
 */
function createTranslationError(
  type: TranslationErrorType,
  message: string,
  options: {
    key?: string;
    expectedValue?: string;
    actualValue?: string;
    context?: string;
    suggestions?: string[];
  } = {}
): TranslationError {
  return {
    type,
    message,
    ...options,
  };
}

/**
 * 技術用語が適切に英語で維持されているかを検証
 * 
 * Requirements: 1.1, 10.1, 10.2, 10.3, 10.4, 10.5
 */
export function validateTechnicalTermUsage(
  term: string,
  context?: TranslationContext
): TranslationValidationResult {
  const errors: TranslationError[] = [];
  const warnings: TranslationError[] = [];
  const suggestions: string[] = [];

  // 日本語文字が含まれている場合は技術用語が翻訳されている可能性をチェック
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(term)) {
    // 既知の技術用語が含まれているかチェック
    const technicalTermKeys = Object.keys(TECHNICAL_TERMS);
    const possibleTechnicalTerm = technicalTermKeys.find(key => 
      term.includes(TECHNICAL_TERMS[key as keyof typeof TECHNICAL_TERMS])
    );
    
    if (possibleTechnicalTerm) {
      warnings.push(createTranslationError(
        TranslationErrorType.TECHNICAL_TERM_TRANSLATED,
        `「${term}」に技術用語が含まれている可能性があります`,
        {
          actualValue: term,
          suggestions: [`技術用語「${TECHNICAL_TERMS[possibleTechnicalTerm as keyof typeof TECHNICAL_TERMS]}」は英語表記を維持してください`],
        }
      ));
    } else {
      // 日本語が含まれている場合は技術用語が翻訳されている可能性が高い
      errors.push(createTranslationError(
        TranslationErrorType.TECHNICAL_TERM_TRANSLATED,
        `技術用語「${term}」は英語表記を維持する必要があります`,
        {
          actualValue: term,
          expectedValue: '英語表記',
          context: context?.component || context?.page,
          suggestions: ['技術用語は国際標準に従い英語表記を維持してください'],
        }
      ));
    }
  }

  // 技術用語が正しく英語で維持されているかチェック
  if (isTechnicalTerm(term)) {
    // 技術用語は英語のパターンにマッチするべき
    if (!/^[A-Za-z\s\-_\.]+$/.test(term)) {
      errors.push(createTranslationError(
        TranslationErrorType.TECHNICAL_TERM_TRANSLATED,
        `技術用語「${term}」は英語表記を維持する必要があります`,
        {
          actualValue: term,
          expectedValue: '英語表記',
          context: context?.component || context?.page,
          suggestions: ['技術用語は国際標準に従い英語表記を維持してください'],
        }
      ));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * 業務用語が適切に日本語に翻訳されているかを検証
 * 
 * Requirements: 1.2, 12.1
 */
export function validateBusinessTermUsage(
  englishTerm: string,
  japaneseTerm: string,
  context?: TranslationContext
): TranslationValidationResult {
  const errors: TranslationError[] = [];
  const warnings: TranslationError[] = [];
  const suggestions: string[] = [];

  // 英語の業務用語に対応する日本語翻訳があるかチェック
  const businessTermKey = Object.keys(BUSINESS_TERMS).find(key => 
    key.toLowerCase() === englishTerm.toLowerCase()
  );

  if (businessTermKey) {
    const expectedTranslation = BUSINESS_TERMS[businessTermKey as keyof typeof BUSINESS_TERMS];
    
    if (japaneseTerm !== expectedTranslation) {
      errors.push(createTranslationError(
        TranslationErrorType.INCONSISTENT_USAGE,
        `業務用語「${englishTerm}」の翻訳が一貫していません`,
        {
          key: businessTermKey,
          expectedValue: expectedTranslation,
          actualValue: japaneseTerm,
          context: context?.component || context?.page,
          suggestions: [`「${englishTerm}」は「${expectedTranslation}」と翻訳してください`],
        }
      ));
    }
  } else if (englishTerm && (!japaneseTerm || japaneseTerm.trim() === '')) {
    warnings.push(createTranslationError(
      TranslationErrorType.BUSINESS_TERM_NOT_TRANSLATED,
      `業務用語「${englishTerm}」が翻訳されていません`,
      {
        actualValue: englishTerm,
        suggestions: ['業務用語は適切な日本語に翻訳してください'],
      }
    ));
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * アクションラベルの一貫性を検証
 * 
 * Requirements: 1.3, 6.1
 */
export function validateActionLabelUsage(
  label: string,
  context?: TranslationContext
): TranslationValidationResult {
  const errors: TranslationError[] = [];
  const warnings: TranslationError[] = [];
  const suggestions: string[] = [];

  // 定義されたアクションラベルが使用されているかチェック
  if (isActionLabel(label)) {
    // 正しいアクションラベルが使用されている
    return {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };
  }

  // 英語のアクションが使用されていないかチェック
  const englishActions = ['create', 'edit', 'delete', 'save', 'cancel', 'update', 'add', 'remove'];
  const lowerLabel = label.toLowerCase();
  
  if (englishActions.some(action => lowerLabel.includes(action))) {
    const actionKey = Object.keys(ACTION_LABELS).find(key => 
      lowerLabel.includes(key.toLowerCase())
    );
    
    if (actionKey) {
      const expectedLabel = ACTION_LABELS[actionKey as keyof typeof ACTION_LABELS];
      errors.push(createTranslationError(
        TranslationErrorType.BUSINESS_TERM_NOT_TRANSLATED,
        `アクションラベル「${label}」は日本語に翻訳する必要があります`,
        {
          actualValue: label,
          expectedValue: expectedLabel,
          suggestions: [`「${label}」は「${expectedLabel}」と翻訳してください`],
        }
      ));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * ステータス表示の一貫性を検証
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
export function validateStatusLabelUsage(
  status: string,
  context?: TranslationContext
): TranslationValidationResult {
  const errors: TranslationError[] = [];
  const warnings: TranslationError[] = [];
  const suggestions: string[] = [];

  // 定義されたステータスラベルが使用されているかチェック
  if (isStatusLabel(status)) {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };
  }

  // 英語のステータスが使用されていないかチェック
  const englishStatuses = ['online', 'offline', 'error', 'active', 'inactive', 'enabled', 'disabled'];
  const lowerStatus = status.toLowerCase();
  
  if (englishStatuses.some(s => lowerStatus.includes(s))) {
    const statusKey = Object.keys(STATUS_LABELS).find(key => 
      lowerStatus.includes(key.toLowerCase())
    );
    
    if (statusKey) {
      const expectedStatus = STATUS_LABELS[statusKey as keyof typeof STATUS_LABELS];
      errors.push(createTranslationError(
        TranslationErrorType.BUSINESS_TERM_NOT_TRANSLATED,
        `ステータス「${status}」は日本語に翻訳する必要があります`,
        {
          actualValue: status,
          expectedValue: expectedStatus,
          suggestions: [`「${status}」は「${expectedStatus}」と翻訳してください`],
        }
      ));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * 用語使用の一貫性をチェック
 * 
 * Requirements: 12.2, 12.3, 12.4
 */
export function checkTermConsistency(
  usages: TermUsage[],
  options: TranslationOptions = {}
): TermConsistencyResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (usages.length === 0) {
    return {
      term: '',
      category: TranslationCategory.BUSINESS,
      usages: [],
      isConsistent: true,
    };
  }

  const firstUsage = usages[0];
  const term = firstUsage.translation;
  
  // カテゴリを判定
  let category: TranslationCategory;
  if (isTechnicalTerm(term)) {
    category = TranslationCategory.TECHNICAL;
  } else if (isBusinessTerm(term)) {
    category = TranslationCategory.BUSINESS;
  } else if (isActionLabel(term)) {
    category = TranslationCategory.ACTION;
  } else if (isStatusLabel(term)) {
    category = TranslationCategory.STATUS;
  } else {
    category = TranslationCategory.BUSINESS;
  }

  // 一貫性をチェック
  const uniqueTranslations = new Set(usages.map(u => u.translation));
  const isConsistent = uniqueTranslations.size === 1;

  // 推奨翻訳を決定
  let recommendedTranslation: string | undefined;
  if (!isConsistent) {
    // 最も頻繁に使用される翻訳を推奨
    const translationCounts = new Map<string, number>();
    usages.forEach(usage => {
      const count = translationCounts.get(usage.translation) || 0;
      translationCounts.set(usage.translation, count + 1);
    });
    
    recommendedTranslation = Array.from(translationCounts.entries())
      .sort(([, a], [, b]) => b - a)[0][0];
  }

  return {
    term: firstUsage.context,
    category,
    usages,
    isConsistent,
    recommendedTranslation,
  };
}

/**
 * 翻訳エラーの安全なハンドリング
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.4
 */
export function handleTranslationError(
  error: Error | TranslationError,
  fallbackValue?: string,
  context?: TranslationContext
): string {
  // TranslationErrorの場合
  if ('type' in error) {
    const translationError = error as TranslationError;
    
    if (DEFAULT_OPTIONS.logWarnings) {
      console.warn(`Translation Error [${translationError.type}]:`, translationError.message, {
        context,
        suggestions: translationError.suggestions,
      });
    }
    
    return fallbackValue || translationError.expectedValue || translationError.key || 'エラー';
  }
  
  // 一般的なErrorの場合
  if (DEFAULT_OPTIONS.logWarnings) {
    console.error('Translation system error:', error.message, { context });
  }
  
  return fallbackValue || 'システムエラー';
}

/**
 * 安全な翻訳取得関数
 * 
 * エラーハンドリングを含む安全な翻訳値の取得を行います。
 */
export function safeGetTranslation(
  key: string,
  fallback?: string,
  context?: TranslationContext
): string {
  try {
    // 技術用語の場合
    if (key in TECHNICAL_TERMS) {
      return TECHNICAL_TERMS[key as keyof typeof TECHNICAL_TERMS];
    }
    
    // 業務用語の場合
    if (key in BUSINESS_TERMS) {
      return BUSINESS_TERMS[key as keyof typeof BUSINESS_TERMS];
    }
    
    // アクションラベルの場合
    if (key in ACTION_LABELS) {
      return ACTION_LABELS[key as keyof typeof ACTION_LABELS];
    }
    
    // ステータスラベルの場合
    if (key in STATUS_LABELS) {
      return STATUS_LABELS[key as keyof typeof STATUS_LABELS];
    }
    
    // キーが見つからない場合
    const error = createTranslationError(
      TranslationErrorType.MISSING_KEY,
      `Translation key not found: ${key}`,
      { key, context: context?.component || context?.page }
    );
    
    return handleTranslationError(error, fallback || key, context);
    
  } catch (error) {
    return handleTranslationError(error as Error, fallback || key, context);
  }
}

/**
 * 翻訳品質メトリクスの計算
 */
export function calculateQualityMetrics(
  validationResults: TranslationValidationResult[]
): TranslationQualityMetrics {
  const totalResults = validationResults.length;
  if (totalResults === 0) {
    return {
      technicalTermConsistency: 100,
      businessTermConsistency: 100,
      messageFormatAccuracy: 100,
      overallQuality: 100,
      recommendations: [],
    };
  }

  const validResults = validationResults.filter(r => r.isValid).length;
  const errorCount = validationResults.reduce((sum, r) => sum + r.errors.length, 0);
  const warningCount = validationResults.reduce((sum, r) => sum + r.warnings.length, 0);

  const technicalTermConsistency = Math.max(0, 100 - (errorCount * 10));
  const businessTermConsistency = Math.max(0, 100 - (warningCount * 5));
  const messageFormatAccuracy = (validResults / totalResults) * 100;
  const overallQuality = (technicalTermConsistency + businessTermConsistency + messageFormatAccuracy) / 3;

  const recommendations: string[] = [];
  if (technicalTermConsistency < 90) {
    recommendations.push('技術用語の英語表記維持を改善してください');
  }
  if (businessTermConsistency < 90) {
    recommendations.push('業務用語の日本語翻訳一貫性を改善してください');
  }
  if (messageFormatAccuracy < 95) {
    recommendations.push('メッセージフォーマットの精度を向上させてください');
  }

  return {
    technicalTermConsistency,
    businessTermConsistency,
    messageFormatAccuracy,
    overallQuality,
    recommendations,
  };
}

/**
 * 翻訳統計情報の生成
 */
export function generateTranslationStats(
  validationResults: TranslationValidationResult[]
): TranslationStats {
  const totalKeys = validationResults.length;
  const translatedKeys = validationResults.filter(r => r.isValid).length;
  const missingKeys = totalKeys - translatedKeys;
  const errorCount = validationResults.reduce((sum, r) => sum + r.errors.length, 0);
  const warningCount = validationResults.reduce((sum, r) => sum + r.warnings.length, 0);
  const consistencyScore = totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 100;

  return {
    totalKeys,
    translatedKeys,
    missingKeys,
    errorCount,
    warningCount,
    consistencyScore,
  };
}

/**
 * 翻訳レポートの生成
 */
export function generateTranslationReport(
  validationResults: TranslationValidationResult[]
): TranslationReport {
  const stats = generateTranslationStats(validationResults);
  const quality = calculateQualityMetrics(validationResults);
  
  const allErrors = validationResults.flatMap(r => r.errors);
  const allWarnings = validationResults.flatMap(r => r.warnings);
  const allSuggestions = validationResults.flatMap(r => r.suggestions);

  return {
    timestamp: new Date(),
    stats,
    quality,
    errors: allErrors,
    warnings: allWarnings,
    suggestions: Array.from(new Set(allSuggestions)), // 重複を除去
  };
}

/**
 * 翻訳システムの健全性チェック
 */
export function performHealthCheck(): TranslationReport {
  const validationResults: TranslationValidationResult[] = [];

  // 技術用語の検証
  Object.values(TECHNICAL_TERMS).forEach(term => {
    const result = validateTechnicalTermUsage(term);
    validationResults.push(result);
  });

  // 業務用語の検証（英語キーと日本語値のペア）
  Object.entries(BUSINESS_TERMS).forEach(([key, value]) => {
    const result = validateBusinessTermUsage(key, value);
    validationResults.push(result);
  });

  // アクションラベルの検証
  Object.values(ACTION_LABELS).forEach(label => {
    const result = validateActionLabelUsage(label);
    validationResults.push(result);
  });

  // ステータスラベルの検証
  Object.values(STATUS_LABELS).forEach(status => {
    const result = validateStatusLabelUsage(status);
    validationResults.push(result);
  });

  return generateTranslationReport(validationResults);
}

/**
 * デバッグ用：翻訳システムの状態を出力
 */
export function debugTranslationSystem(): void {
  const report = performHealthCheck();
  
  console.group('🌐 Translation System Debug Report');
  console.log('📊 Statistics:', report.stats);
  console.log('🎯 Quality Metrics:', report.quality);
  
  if (report.errors.length > 0) {
    console.group('❌ Errors');
    report.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  if (report.warnings.length > 0) {
    console.group('⚠️ Warnings');
    report.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  if (report.suggestions.length > 0) {
    console.group('💡 Suggestions');
    report.suggestions.forEach(suggestion => console.info(suggestion));
    console.groupEnd();
  }
  
  console.groupEnd();
}