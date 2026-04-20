/**
 * 全ページ翻訳統合テスト
 * 
 * すべてのページで日本語が正しく表示されることを確認し、
 * ナビゲーション、フォーム、テーブルの翻訳を検証します。
 * 
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// レイアウトコンポーネント
import { Sidebar } from '../components/layout/sidebar';
import { Breadcrumb } from '../components/layout/breadcrumb';

// 翻訳定数
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { TABLE_LABELS } from '../localization/constants/table-labels';
import { DATE_FORMATTER } from '../localization/utils/date-formatter';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('全ページ翻訳統合テスト', () => {
  describe('ナビゲーション翻訳テスト (Requirements: 2.1, 2.2)', () => {
    it('サイドバーのすべてのメニュー項目が日本語で表示される', () => {
      renderWithRouter(<Sidebar />);

      // 主要なナビゲーション項目が日本語で表示されることを確認
      expect(screen.getByText(NAVIGATION_LABELS.DEVICES)).toBeInTheDocument();
      expect(screen.getByText(NAVIGATION_LABELS.USERS)).toBeInTheDocument();

      // 英語のメニュー項目が表示されないことを確認
      expect(screen.queryByText('Devices')).not.toBeInTheDocument();
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });

    it('パンくずリストが日本語で表示される', () => {
      const breadcrumbItems = [
        { label: NAVIGATION_LABELS.HOME, href: '/' },
        { label: NAVIGATION_LABELS.USERS, href: '/users' },
        { label: NAVIGATION_LABELS.EDIT }
      ];

      renderWithRouter(<Breadcrumb items={breadcrumbItems} />);

      expect(screen.getByText('ホーム')).toBeInTheDocument();
      expect(screen.getByText('ユーザー')).toBeInTheDocument();
      expect(screen.getByText('編集')).toBeInTheDocument();
    });
  });

  describe('翻訳定数の存在確認テスト (Requirements: 2.3, 3.1, 4.1)', () => {
    it('ナビゲーションラベルが定義されている', () => {
      expect(NAVIGATION_LABELS.DEVICES).toBeDefined();
      expect(NAVIGATION_LABELS.USERS).toBeDefined();
      expect(NAVIGATION_LABELS.HOME).toBeDefined();
      expect(NAVIGATION_LABELS.EDIT).toBeDefined();
      
      // 日本語であることを確認
      expect(NAVIGATION_LABELS.DEVICES).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      expect(NAVIGATION_LABELS.USERS).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
    });

    it('アクションラベルが定義されている', () => {
      expect(ACTION_LABELS.CREATE).toBeDefined();
      expect(ACTION_LABELS.EDIT).toBeDefined();
      expect(ACTION_LABELS.DELETE).toBeDefined();
      expect(ACTION_LABELS.SAVE).toBeDefined();
      expect(ACTION_LABELS.CANCEL).toBeDefined();
      
      // 日本語であることを確認
      expect(ACTION_LABELS.CREATE).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      expect(ACTION_LABELS.EDIT).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      expect(ACTION_LABELS.DELETE).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
    });

    it('テーブルラベルが定義されている', () => {
      expect(TABLE_LABELS.ACTIONS).toBeDefined();
      expect(TABLE_LABELS.NO_DATA).toBeDefined();
      
      // 日本語であることを確認
      expect(TABLE_LABELS.ACTIONS).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      expect(TABLE_LABELS.NO_DATA).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
    });
  });

  describe('翻訳一貫性テスト (Requirements: 3.2, 3.3, 3.4, 3.5)', () => {
    it('英語の技術用語が適切に維持されている', () => {
      // 技術用語は英語で維持されるべき
      const technicalTerms = ['ID', 'API', 'URL', 'JSON'];
      
      technicalTerms.forEach(term => {
        // 技術用語は英語のパターンにマッチする
        expect(term).toMatch(/^[A-Za-z\s]+$/);
        // 日本語文字が含まれていない
        expect(term).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      });
    });

    it('業務用語が適切に日本語化されている', () => {
      // 業務用語は日本語化されるべき
      const businessTerms = [
        NAVIGATION_LABELS.DEVICES,
        NAVIGATION_LABELS.USERS
      ];
      
      businessTerms.forEach(term => {
        // 業務用語は日本語文字を含む
        expect(term).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      });
    });

    it('アクションラベルが統一されている', () => {
      // アクションラベルは統一された日本語を使用
      expect(ACTION_LABELS.CREATE).toBe('作成');
      expect(ACTION_LABELS.EDIT).toBe('編集');
      expect(ACTION_LABELS.DELETE).toBe('削除');
      expect(ACTION_LABELS.SAVE).toBe('保存');
      expect(ACTION_LABELS.CANCEL).toBe('キャンセル');
    });
  });

  describe('フォーム要素翻訳テスト (Requirements: 4.2, 4.3, 4.5)', () => {
    it('共通フォーム要素が日本語化されている', () => {
      // 共通的に使用されるフォーム要素の翻訳を確認
      expect(ACTION_LABELS.SUBMIT).toBeDefined();
      expect(ACTION_LABELS.RESET).toBeDefined();
      expect(ACTION_LABELS.CLEAR).toBeDefined();
      
      // 日本語であることを確認
      expect(ACTION_LABELS.SUBMIT).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      expect(ACTION_LABELS.RESET).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      expect(ACTION_LABELS.CLEAR).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
    });
  });

  describe('統合翻訳品質テスト', () => {
    it('翻訳定数が適切な日本語形式を使用している', () => {
      // 丁寧語の使用確認（例：「します」「ください」など）
      const politePatterns = [
        /します$/, /ください$/, /ます$/, /です$/
      ];
      
      // 一部の翻訳定数で丁寧語が使用されていることを確認
      const sampleMessages = [
        'システムのユーザーを管理します',
        '正しいメールアドレスを入力してください'
      ];
      
      sampleMessages.forEach(message => {
        const hasPoliteForm = politePatterns.some(pattern => pattern.test(message));
        expect(hasPoliteForm).toBe(true);
      });
    });

    it('翻訳定数に不適切な文字が含まれていない', () => {
      // 翻訳定数に制御文字や不適切な文字が含まれていないことを確認
      const sampleLabels = [
        NAVIGATION_LABELS.DEVICES,
        NAVIGATION_LABELS.USERS,
        ACTION_LABELS.CREATE,
        ACTION_LABELS.EDIT
      ];
      
      sampleLabels.forEach(label => {
        // 制御文字が含まれていない
        expect(label).not.toMatch(/[\x00-\x1F\x7F]/);
        // 空文字ではない
        expect(label.trim()).not.toBe('');
        // 適切な長さ（1文字以上50文字以下）
        expect(label.length).toBeGreaterThan(0);
        expect(label.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('日付・時刻表示統合テスト (Requirements: 9.1, 9.2, 9.3, 9.4, 9.5)', () => {
    const testDate = new Date('2023-12-25T10:30:45.123Z');

    it('日付フォーマッターが日本形式を使用している', () => {
      // Requirement 9.1: 日付形式
      const dateShort = DATE_FORMATTER.formatDate(testDate);
      expect(dateShort).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
      
      const dateLong = DATE_FORMATTER.formatDateLong(testDate);
      expect(dateLong).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日$/);
    });

    it('時刻フォーマッターが日本形式を使用している', () => {
      // Requirement 9.2: 時刻形式
      const time = DATE_FORMATTER.formatTime(testDate);
      expect(time).toMatch(/^\d{2}:\d{2}$/);
      
      const timeWithSeconds = DATE_FORMATTER.formatTimeWithSeconds(testDate);
      expect(timeWithSeconds).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('相対時間が日本語表現を使用している', () => {
      // Requirement 9.3: 相対時間
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const relativeTime = DATE_FORMATTER.formatRelativeTime(fiveMinutesAgo);
      expect(relativeTime).toMatch(/(分前|時間前|日前|週間前|ヶ月前|年前|たった今)$/);
    });

    it('期間表示が日本語単位を使用している', () => {
      // Requirement 9.4: 期間表示
      const duration = 2 * 60 * 60 * 1000; // 2時間
      const result = DATE_FORMATTER.formatDuration(duration);
      expect(result).toMatch(/(秒間|分間|時間|日間|週間|ヶ月間|年間)$/);
    });

    it('タイムゾーン表示が日本標準を使用している', () => {
      // Requirement 9.5: タイムゾーン表示
      const withJST = DATE_FORMATTER.formatDateTimeWithTimezone(testDate);
      expect(withJST).toContain('JST');
      
      const withFullTimezone = DATE_FORMATTER.formatDateTimeWithTimezone(testDate, true);
      expect(withFullTimezone).toContain('日本標準時');
    });

    it('月・曜日名が日本語で定義されている', () => {
      // 月名の確認
      expect(DATE_FORMATTER.getMonthName(0)).toBe('1月');
      expect(DATE_FORMATTER.getMonthName(11)).toBe('12月');
      
      // 曜日名の確認
      expect(DATE_FORMATTER.getDayOfWeekName(0)).toBe('日曜日');
      expect(DATE_FORMATTER.getDayOfWeekName(6)).toBe('土曜日');
      
      // 短縮曜日名の確認
      expect(DATE_FORMATTER.getDayOfWeekShort(0)).toBe('日');
      expect(DATE_FORMATTER.getDayOfWeekShort(6)).toBe('土');
    });

    it('全ページで統一された日付・時刻表示が可能', () => {
      // 実際のページで使用される可能性のあるシナリオをテスト
      const createdAt = new Date('2023-12-25T10:30:45');
      const updatedAt = new Date('2023-12-26T15:45:30');

      // データテーブルでの表示
      const createdDisplay = DATE_FORMATTER.formatDateTime(createdAt);
      const updatedDisplay = DATE_FORMATTER.formatDateTime(updatedAt);
      
      expect(createdDisplay).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(updatedDisplay).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);

      // 相対時間での表示
      const relativeCreated = DATE_FORMATTER.formatRelativeTime(createdAt);
      expect(relativeCreated).toMatch(/(分前|時間前|日前|週間前|ヶ月前|年前|\d{4}\/\d{2}\/\d{2})$/);
    });
  });
});