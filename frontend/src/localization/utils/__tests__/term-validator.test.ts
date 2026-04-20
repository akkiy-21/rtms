/**
 * 翻訳用語バリデーターのテスト
 * 
 * 用語の一貫性チェック、翻訳エラーハンドリング機能のテストを行います。
 */

import {
  validateTechnicalTermUsage,
  validateBusinessTermUsage,
  validateActionLabelUsage,
  validateStatusLabelUsage,
  safeGetTranslation,
  handleTranslationError,
  performHealthCheck,
} from '../term-validator';
import {
  TranslationError,
  TranslationErrorType,
} from '../../types/localization.types';

describe('term-validator', () => {
  describe('validateTechnicalTermUsage', () => {
    it('技術用語が英語で維持されている場合は有効と判定する', () => {
      const result = validateTechnicalTermUsage('IP Address');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('技術用語が日本語に翻訳されている場合はエラーを返す', () => {
      const result = validateTechnicalTermUsage('IPアドレス');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe(TranslationErrorType.TECHNICAL_TERM_TRANSLATED);
    });

    it('日本語文字が含まれている場合は警告を返す', () => {
      const result = validateTechnicalTermUsage('IP Addressの設定');
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('validateBusinessTermUsage', () => {
    it('正しい業務用語翻訳の場合は有効と判定する', () => {
      const result = validateBusinessTermUsage('DEVICE', 'デバイス');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('不正な業務用語翻訳の場合はエラーを返す', () => {
      const result = validateBusinessTermUsage('DEVICE', '装置');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe(TranslationErrorType.INCONSISTENT_USAGE);
    });

    it('翻訳されていない業務用語の場合は警告を返す', () => {
      const result = validateBusinessTermUsage('UNKNOWN_TERM', '');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe(TranslationErrorType.BUSINESS_TERM_NOT_TRANSLATED);
    });
  });

  describe('validateActionLabelUsage', () => {
    it('正しいアクションラベルの場合は有効と判定する', () => {
      const result = validateActionLabelUsage('作成');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('英語のアクションラベルの場合はエラーを返す', () => {
      const result = validateActionLabelUsage('create');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe(TranslationErrorType.BUSINESS_TERM_NOT_TRANSLATED);
    });
  });

  describe('validateStatusLabelUsage', () => {
    it('正しいステータスラベルの場合は有効と判定する', () => {
      const result = validateStatusLabelUsage('オンライン');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('英語のステータスラベルの場合はエラーを返す', () => {
      const result = validateStatusLabelUsage('online');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe(TranslationErrorType.BUSINESS_TERM_NOT_TRANSLATED);
    });
  });

  describe('safeGetTranslation', () => {
    it('技術用語キーの場合は英語値を返す', () => {
      const result = safeGetTranslation('IP_ADDRESS');
      expect(result).toBe('IP Address');
    });

    it('業務用語キーの場合は日本語値を返す', () => {
      const result = safeGetTranslation('DEVICE');
      expect(result).toBe('デバイス');
    });

    it('アクションラベルキーの場合は日本語値を返す', () => {
      const result = safeGetTranslation('CREATE');
      expect(result).toBe('作成');
    });

    it('ステータスラベルキーの場合は日本語値を返す', () => {
      const result = safeGetTranslation('ONLINE');
      expect(result).toBe('オンライン');
    });

    it('存在しないキーの場合はフォールバック値を返す', () => {
      const result = safeGetTranslation('UNKNOWN_KEY', 'フォールバック');
      expect(result).toBe('フォールバック');
    });

    it('存在しないキーでフォールバックがない場合はキー自体を返す', () => {
      const result = safeGetTranslation('UNKNOWN_KEY');
      expect(result).toBe('UNKNOWN_KEY');
    });
  });

  describe('handleTranslationError', () => {
    it('TranslationErrorの場合は適切にハンドリングする', () => {
      const error: TranslationError = {
        type: TranslationErrorType.MISSING_KEY,
        message: 'Key not found',
        key: 'TEST_KEY',
        expectedValue: 'テスト値',
      };

      const result = handleTranslationError(error, 'フォールバック');
      expect(result).toBe('フォールバック');
    });

    it('一般的なErrorの場合はフォールバック値を返す', () => {
      const error = new Error('General error');
      const result = handleTranslationError(error, 'フォールバック');
      expect(result).toBe('フォールバック');
    });

    it('フォールバック値がない場合はデフォルト値を返す', () => {
      const error = new Error('General error');
      const result = handleTranslationError(error);
      expect(result).toBe('システムエラー');
    });
  });

  describe('performHealthCheck', () => {
    it('翻訳システムの健全性チェックを実行する', () => {
      const report = performHealthCheck();
      
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.stats).toBeDefined();
      expect(report.quality).toBeDefined();
      expect(report.errors).toBeInstanceOf(Array);
      expect(report.warnings).toBeInstanceOf(Array);
      expect(report.suggestions).toBeInstanceOf(Array);
      
      // 統計情報の基本チェック
      expect(report.stats.totalKeys).toBeGreaterThan(0);
      expect(report.stats.consistencyScore).toBeGreaterThanOrEqual(0);
      expect(report.stats.consistencyScore).toBeLessThanOrEqual(100);
      
      // 品質メトリクスの基本チェック
      expect(report.quality.overallQuality).toBeGreaterThanOrEqual(0);
      expect(report.quality.overallQuality).toBeLessThanOrEqual(100);
    });
  });
});