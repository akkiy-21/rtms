/**
 * 日付・時刻表示の統合テスト
 * 
 * 全ページで日付・時刻が日本形式で表示されることを確認します。
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DATE_FORMATTER } from '../localization/utils/date-formatter';

// テスト用のコンポーネント - 実際のページで日付・時刻表示をシミュレート
const DateTimeDisplayComponent: React.FC<{
  date: Date;
  showRelative?: boolean;
  showDuration?: boolean;
  showTimezone?: boolean;
}> = ({ date, showRelative = false, showDuration = false, showTimezone = false }) => {
  const duration = 2 * 60 * 60 * 1000; // 2時間のサンプル期間

  return (
    <div>
      <div data-testid="formatted-date">{DATE_FORMATTER.formatDate(date)}</div>
      <div data-testid="formatted-date-long">{DATE_FORMATTER.formatDateLong(date)}</div>
      <div data-testid="formatted-time">{DATE_FORMATTER.formatTime(date)}</div>
      <div data-testid="formatted-time-seconds">{DATE_FORMATTER.formatTimeWithSeconds(date)}</div>
      <div data-testid="formatted-datetime">{DATE_FORMATTER.formatDateTime(date)}</div>
      <div data-testid="formatted-datetime-long">{DATE_FORMATTER.formatDateTimeLong(date)}</div>
      
      {showRelative && (
        <div data-testid="relative-time">{DATE_FORMATTER.formatRelativeTime(date)}</div>
      )}
      
      {showDuration && (
        <>
          <div data-testid="duration">{DATE_FORMATTER.formatDuration(duration)}</div>
          <div data-testid="duration-detailed">{DATE_FORMATTER.formatDurationDetailed(duration)}</div>
        </>
      )}
      
      {showTimezone && (
        <>
          <div data-testid="datetime-jst">{DATE_FORMATTER.formatDateTimeWithTimezone(date)}</div>
          <div data-testid="datetime-full-timezone">{DATE_FORMATTER.formatDateTimeWithTimezone(date, true)}</div>
        </>
      )}
      
      <div data-testid="month-name">{DATE_FORMATTER.getMonthName(date.getMonth())}</div>
      <div data-testid="day-name">{DATE_FORMATTER.getDayOfWeekName(date.getDay())}</div>
      <div data-testid="day-short">{DATE_FORMATTER.getDayOfWeekShort(date.getDay())}</div>
    </div>
  );
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('日付・時刻表示の統合テスト', () => {
  // テスト用の固定日時
  const testDate = new Date('2023-12-25T10:30:45.123Z'); // 2023年12月25日 10:30:45 UTC

  describe('基本的な日付・時刻フォーマット (Requirements: 9.1, 9.2)', () => {
    it('日付が日本形式で表示される', () => {
      renderWithRouter(<DateTimeDisplayComponent date={testDate} />);

      // Requirement 9.1: YYYY/MM/DD形式
      const formattedDate = screen.getByTestId('formatted-date');
      expect(formattedDate).toHaveTextContent(/^\d{4}\/\d{2}\/\d{2}$/);
      expect(formattedDate.textContent).toBe('2023/12/25');

      // Requirement 9.1: YYYY年MM月DD日形式
      const formattedDateLong = screen.getByTestId('formatted-date-long');
      expect(formattedDateLong).toHaveTextContent(/^\d{4}年\d{1,2}月\d{1,2}日$/);
      expect(formattedDateLong.textContent).toBe('2023年12月25日');
    });

    it('時刻が日本形式で表示される', () => {
      renderWithRouter(<DateTimeDisplayComponent date={testDate} />);

      // Requirement 9.2: HH:MM形式
      const formattedTime = screen.getByTestId('formatted-time');
      expect(formattedTime).toHaveTextContent(/^\d{2}:\d{2}$/);

      // Requirement 9.2: HH:MM:SS形式
      const formattedTimeSeconds = screen.getByTestId('formatted-time-seconds');
      expect(formattedTimeSeconds).toHaveTextContent(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('日時が日本形式で表示される', () => {
      renderWithRouter(<DateTimeDisplayComponent date={testDate} />);

      // 日時の組み合わせ - YYYY/MM/DD HH:MM:SS形式
      const formattedDateTime = screen.getByTestId('formatted-datetime');
      expect(formattedDateTime).toHaveTextContent(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);

      // 日時の組み合わせ - YYYY年MM月DD日 HH:MM形式
      const formattedDateTimeLong = screen.getByTestId('formatted-datetime-long');
      expect(formattedDateTimeLong).toHaveTextContent(/^\d{4}年\d{1,2}月\d{1,2}日 \d{2}:\d{2}$/);
    });
  });

  describe('相対時間表示 (Requirement: 9.3)', () => {
    it('相対時間が日本語表現で表示される', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      // 5分前
      const { unmount: unmount1 } = renderWithRouter(<DateTimeDisplayComponent date={fiveMinutesAgo} showRelative />);
      let relativeTime = screen.getByTestId('relative-time');
      expect(relativeTime).toHaveTextContent('5分前');
      unmount1();

      // 2時間前
      const { unmount: unmount2 } = renderWithRouter(<DateTimeDisplayComponent date={twoHoursAgo} showRelative />);
      relativeTime = screen.getByTestId('relative-time');
      expect(relativeTime).toHaveTextContent('2時間前');
      unmount2();

      // 3日前
      renderWithRouter(<DateTimeDisplayComponent date={threeDaysAgo} showRelative />);
      relativeTime = screen.getByTestId('relative-time');
      expect(relativeTime).toHaveTextContent('3日前');
    });

    it('現在時刻が「たった今」と表示される', () => {
      const now = new Date();
      renderWithRouter(<DateTimeDisplayComponent date={now} showRelative />);

      const relativeTime = screen.getByTestId('relative-time');
      expect(relativeTime).toHaveTextContent('たった今');
    });

    it('未来の時刻が適切に表示される', () => {
      const now = new Date();
      const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

      renderWithRouter(<DateTimeDisplayComponent date={fiveMinutesLater} showRelative />);

      const relativeTime = screen.getByTestId('relative-time');
      expect(relativeTime).toHaveTextContent(/^(まもなく|5分後)$/);
    });
  });

  describe('期間表示 (Requirement: 9.4)', () => {
    it('期間が日本語単位で表示される', () => {
      renderWithRouter(<DateTimeDisplayComponent date={testDate} showDuration />);

      // 2時間の期間
      const duration = screen.getByTestId('duration');
      expect(duration).toHaveTextContent('2時間');

      // 詳細な期間表示 - formatDurationDetailedは0の値は表示しないため、2時間のみ表示される
      const durationDetailed = screen.getByTestId('duration-detailed');
      expect(durationDetailed).toHaveTextContent('2時間');
    });

    it('様々な期間単位が正しく表示される', () => {
      const testCases = [
        { duration: 5000, expected: '5秒間' }, // 5秒
        { duration: 5 * 60 * 1000, expected: '5分間' }, // 5分
        { duration: 3 * 60 * 60 * 1000, expected: '3時間' }, // 3時間
        { duration: 2 * 24 * 60 * 60 * 1000, expected: '2日間' }, // 2日
        { duration: 2 * 7 * 24 * 60 * 60 * 1000, expected: '2週間' }, // 2週間
      ];

      testCases.forEach(({ duration, expected }) => {
        const result = DATE_FORMATTER.formatDuration(duration);
        expect(result).toBe(expected);
      });
    });
  });

  describe('タイムゾーン表示 (Requirement: 9.5)', () => {
    it('JSTタイムゾーンが表示される', () => {
      renderWithRouter(<DateTimeDisplayComponent date={testDate} showTimezone />);

      const datetimeJST = screen.getByTestId('datetime-jst');
      expect(datetimeJST).toHaveTextContent(/\(JST\)$/);
    });

    it('日本標準時が表示される', () => {
      renderWithRouter(<DateTimeDisplayComponent date={testDate} showTimezone />);

      const datetimeFullTimezone = screen.getByTestId('datetime-full-timezone');
      expect(datetimeFullTimezone).toHaveTextContent(/\(日本標準時\)$/);
    });

    it('ISO文字列から日本時間への変換が正しく動作する', () => {
      const isoString = '2023-12-25T10:30:45.123Z';
      const result = DATE_FORMATTER.formatISOStringToJST(isoString);
      
      // 日本時間形式で表示される
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('月・曜日の日本語表示', () => {
    it('月名が日本語で表示される', () => {
      renderWithRouter(<DateTimeDisplayComponent date={testDate} />);

      const monthName = screen.getByTestId('month-name');
      expect(monthName).toHaveTextContent('12月'); // 12月
    });

    it('曜日が日本語で表示される', () => {
      renderWithRouter(<DateTimeDisplayComponent date={testDate} />);

      const dayName = screen.getByTestId('day-name');
      expect(dayName).toHaveTextContent(/^(日|月|火|水|木|金|土)曜日$/);

      const dayShort = screen.getByTestId('day-short');
      expect(dayShort).toHaveTextContent(/^(日|月|火|水|木|金|土)$/);
    });

    it('すべての月名が正しく定義されている', () => {
      const expectedMonths = [
        '1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'
      ];

      expectedMonths.forEach((expected, index) => {
        const result = DATE_FORMATTER.getMonthName(index);
        expect(result).toBe(expected);
      });
    });

    it('すべての曜日名が正しく定義されている', () => {
      const expectedDays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
      const expectedDaysShort = ['日', '月', '火', '水', '木', '金', '土'];

      expectedDays.forEach((expected, index) => {
        const result = DATE_FORMATTER.getDayOfWeekName(index);
        expect(result).toBe(expected);
      });

      expectedDaysShort.forEach((expected, index) => {
        const result = DATE_FORMATTER.getDayOfWeekShort(index);
        expect(result).toBe(expected);
      });
    });
  });

  describe('特殊な日付・時刻処理', () => {
    it('営業日計算が正しく動作する', () => {
      const startDate = new Date('2023-12-25'); // 月曜日
      const endDate = new Date('2023-12-29'); // 金曜日
      
      const result = DATE_FORMATTER.formatBusinessDays(startDate, endDate);
      expect(result).toBe('5営業日');
    });

    it('年齢計算が正しく動作する', () => {
      const birthDate = new Date('1990-06-15');
      const result = DATE_FORMATTER.calculateAge(birthDate);
      
      expect(result).toMatch(/^\d+歳$/);
      expect(result).toContain('歳');
    });

    it('複雑な期間の詳細表示が正しく動作する', () => {
      const complexDuration = 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 45 * 60 * 1000 + 30 * 1000;
      // 2日3時間45分30秒
      
      const result = DATE_FORMATTER.formatDurationDetailed(complexDuration);
      expect(result).toBe('2日3時間45分30秒');
    });
  });

  describe('エラーハンドリングと境界値テスト', () => {
    it('無効な月インデックスに対して空文字を返す', () => {
      expect(DATE_FORMATTER.getMonthName(12)).toBe('');
      expect(DATE_FORMATTER.getMonthName(-1)).toBe('');
    });

    it('無効な曜日インデックスに対して空文字を返す', () => {
      expect(DATE_FORMATTER.getDayOfWeekName(7)).toBe('');
      expect(DATE_FORMATTER.getDayOfWeekName(-1)).toBe('');
      expect(DATE_FORMATTER.getDayOfWeekShort(7)).toBe('');
      expect(DATE_FORMATTER.getDayOfWeekShort(-1)).toBe('');
    });

    it('ゼロ期間に対して適切な値を返す', () => {
      const result = DATE_FORMATTER.formatDuration(0);
      expect(result).toBe('0秒間');

      const detailedResult = DATE_FORMATTER.formatDurationDetailed(0);
      expect(detailedResult).toBe('0秒');
    });

    it('非常に古い日付に対して適切にフォーマットする', () => {
      const veryOldDate = new Date('1900-01-01');
      const result = DATE_FORMATTER.formatDate(veryOldDate);
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });

    it('非常に未来の日付に対して適切にフォーマットする', () => {
      const futureDate = new Date('2100-12-31');
      const result = DATE_FORMATTER.formatDate(futureDate);
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });
  });

  describe('Requirements 検証テスト', () => {
    it('Requirement 9.1: 日付形式が正しく実装されている', () => {
      const testDate = new Date('2023-12-25');
      
      // YYYY/MM/DD形式
      const shortFormat = DATE_FORMATTER.formatDate(testDate);
      expect(shortFormat).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
      
      // YYYY年MM月DD日形式
      const longFormat = DATE_FORMATTER.formatDateLong(testDate);
      expect(longFormat).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日$/);
    });

    it('Requirement 9.2: 時刻形式が正しく実装されている', () => {
      const testDate = new Date('2023-12-25T10:30:45');
      
      // HH:MM形式
      const timeFormat = DATE_FORMATTER.formatTime(testDate);
      expect(timeFormat).toMatch(/^\d{2}:\d{2}$/);
      
      // HH:MM:SS形式
      const timeWithSecondsFormat = DATE_FORMATTER.formatTimeWithSeconds(testDate);
      expect(timeWithSecondsFormat).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('Requirement 9.3: 相対時間が日本語表現で実装されている', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const relativeTime = DATE_FORMATTER.formatRelativeTime(fiveMinutesAgo);
      expect(relativeTime).toMatch(/(分前|時間前|日前|週間前|ヶ月前|年前|たった今)$/);
    });

    it('Requirement 9.4: 期間が日本語単位で実装されている', () => {
      const duration = 2 * 60 * 60 * 1000; // 2時間
      const result = DATE_FORMATTER.formatDuration(duration);
      expect(result).toMatch(/(秒間|分間|時間|日間|週間|ヶ月間|年間)$/);
    });

    it('Requirement 9.5: タイムゾーン表示が正しく実装されている', () => {
      const date = new Date();
      
      // JST表示
      const withJST = DATE_FORMATTER.formatDateTimeWithTimezone(date);
      expect(withJST).toContain('JST');
      
      // 日本標準時表示
      const withFullTimezone = DATE_FORMATTER.formatDateTimeWithTimezone(date, true);
      expect(withFullTimezone).toContain('日本標準時');
    });
  });

  describe('統合テスト - 実際の使用シナリオ', () => {
    it('データテーブルでの日付表示シナリオ', () => {
      const createdAt = new Date('2023-12-25T10:30:45');
      const updatedAt = new Date('2023-12-26T15:45:30');

      // 作成日時
      const createdDisplay = DATE_FORMATTER.formatDateTime(createdAt);
      expect(createdDisplay).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);

      // 更新日時
      const updatedDisplay = DATE_FORMATTER.formatDateTime(updatedAt);
      expect(updatedDisplay).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);

      // 相対時間表示
      const relativeCreated = DATE_FORMATTER.formatRelativeTime(createdAt);
      expect(relativeCreated).toMatch(/(分前|時間前|日前|週間前|ヶ月前|年前|\d{4}\/\d{2}\/\d{2})$/);
    });

    it('フォームでの日付入力表示シナリオ', () => {
      const selectedDate = new Date('2023-12-25');

      // フォーム表示用の日付
      const displayDate = DATE_FORMATTER.formatDateLong(selectedDate);
      expect(displayDate).toBe('2023年12月25日');

      // 曜日表示
      const dayOfWeek = DATE_FORMATTER.getDayOfWeekName(selectedDate.getDay());
      expect(dayOfWeek).toMatch(/^(日|月|火|水|木|金|土)曜日$/);
    });

    it('ダッシュボードでの統計表示シナリオ', () => {
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2023-12-31');
      const totalDuration = endDate.getTime() - startDate.getTime();

      // 期間表示
      const duration = DATE_FORMATTER.formatDuration(totalDuration);
      expect(duration).toMatch(/(日間|週間|ヶ月間)$/);

      // 営業日計算
      const businessDays = DATE_FORMATTER.formatBusinessDays(startDate, endDate);
      expect(businessDays).toMatch(/^\d+営業日$/);
    });

    it('ログ表示での時刻表示シナリオ', () => {
      const logTime = new Date('2023-12-25T10:30:45.123Z');

      // タイムゾーン付き表示
      const logDisplay = DATE_FORMATTER.formatDateTimeWithTimezone(logTime);
      expect(logDisplay).toContain('JST');

      // ISO文字列からの変換
      const isoString = logTime.toISOString();
      const convertedDisplay = DATE_FORMATTER.formatISOStringToJST(isoString);
      expect(convertedDisplay).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });
});