/**
 * 日付・時刻フォーマット関数のテスト
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { DATE_FORMATTER } from '../date-formatter';

describe('DATE_FORMATTER', () => {
  // テスト用の固定日時
  const testDate = new Date('2023-12-25T10:30:45.123Z'); // 2023年12月25日 10:30:45 UTC
  const testDateJST = new Date('2023-12-25T19:30:45.123+09:00'); // 日本時間

  describe('formatDate', () => {
    it('should format date in YYYY/MM/DD format', () => {
      const result = DATE_FORMATTER.formatDate(testDate);
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
      expect(result).toBe('2023/12/25');
    });
  });

  describe('formatDateLong', () => {
    it('should format date in Japanese long format', () => {
      const result = DATE_FORMATTER.formatDateLong(testDate);
      expect(result).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日$/);
      expect(result).toBe('2023年12月25日');
    });
  });

  describe('formatTime', () => {
    it('should format time in HH:MM format', () => {
      const result = DATE_FORMATTER.formatTime(testDate);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('formatTimeWithSeconds', () => {
    it('should format time in HH:MM:SS format', () => {
      const result = DATE_FORMATTER.formatTimeWithSeconds(testDate);
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime in YYYY/MM/DD HH:MM:SS format', () => {
      const result = DATE_FORMATTER.formatDateTime(testDate);
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('formatDateTimeLong', () => {
    it('should format datetime in Japanese long format', () => {
      const result = DATE_FORMATTER.formatDateTimeLong(testDate);
      expect(result).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日 \d{2}:\d{2}$/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "たった今" for very recent dates', () => {
      const now = new Date();
      const result = DATE_FORMATTER.formatRelativeTime(now);
      expect(result).toBe('たった今');
    });

    it('should return "X分前" for minutes ago', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const result = DATE_FORMATTER.formatRelativeTime(fiveMinutesAgo);
      expect(result).toBe('5分前');
    });

    it('should return "X時間前" for hours ago', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const result = DATE_FORMATTER.formatRelativeTime(twoHoursAgo);
      expect(result).toBe('2時間前');
    });

    it('should return "X日前" for days ago', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const result = DATE_FORMATTER.formatRelativeTime(threeDaysAgo);
      expect(result).toBe('3日前');
    });

    it('should return "まもなく" for very near future dates', () => {
      const now = new Date();
      const nearFuture = new Date(now.getTime() + 30 * 1000); // 30秒後
      const result = DATE_FORMATTER.formatRelativeTime(nearFuture);
      expect(result).toBe('まもなく');
    });

    it('should return "X分後" for future minutes', () => {
      const now = new Date();
      const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
      const result = DATE_FORMATTER.formatRelativeTime(fiveMinutesLater);
      expect(result).toBe('5分後');
    });

    it('should return formatted date for very old dates', () => {
      const veryOldDate = new Date('2020-01-01');
      const result = DATE_FORMATTER.formatRelativeTime(veryOldDate);
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => {
      const result = DATE_FORMATTER.formatDuration(5000); // 5秒
      expect(result).toBe('5秒間');
    });

    it('should format minutes', () => {
      const result = DATE_FORMATTER.formatDuration(5 * 60 * 1000); // 5分
      expect(result).toBe('5分間');
    });

    it('should format hours', () => {
      const result = DATE_FORMATTER.formatDuration(3 * 60 * 60 * 1000); // 3時間
      expect(result).toBe('3時間');
    });

    it('should format days', () => {
      const result = DATE_FORMATTER.formatDuration(2 * 24 * 60 * 60 * 1000); // 2日
      expect(result).toBe('2日間');
    });

    it('should format weeks', () => {
      const result = DATE_FORMATTER.formatDuration(2 * 7 * 24 * 60 * 60 * 1000); // 2週間
      expect(result).toBe('2週間');
    });

    it('should format months', () => {
      const result = DATE_FORMATTER.formatDuration(2 * 30 * 24 * 60 * 60 * 1000); // 約2ヶ月
      expect(result).toBe('2ヶ月間');
    });

    it('should format years', () => {
      const result = DATE_FORMATTER.formatDuration(2 * 365 * 24 * 60 * 60 * 1000); // 約2年
      expect(result).toBe('2年間');
    });

    it('should return "0秒間" for zero duration', () => {
      const result = DATE_FORMATTER.formatDuration(0);
      expect(result).toBe('0秒間');
    });
  });

  describe('formatDurationDetailed', () => {
    it('should format detailed duration with multiple units', () => {
      const duration = 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 45 * 60 * 1000 + 30 * 1000;
      // 2日3時間45分30秒
      const result = DATE_FORMATTER.formatDurationDetailed(duration);
      expect(result).toBe('2日3時間45分30秒');
    });

    it('should format only seconds for short duration', () => {
      const result = DATE_FORMATTER.formatDurationDetailed(30 * 1000); // 30秒
      expect(result).toBe('30秒');
    });

    it('should format zero duration', () => {
      const result = DATE_FORMATTER.formatDurationDetailed(0);
      expect(result).toBe('0秒');
    });
  });

  describe('formatDateTimeWithTimezone', () => {
    it('should format datetime with JST timezone', () => {
      const result = DATE_FORMATTER.formatDateTimeWithTimezone(testDate);
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} \(JST\)$/);
    });

    it('should format datetime with full timezone name', () => {
      const result = DATE_FORMATTER.formatDateTimeWithTimezone(testDate, true);
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} \(日本標準時\)$/);
    });
  });

  describe('formatISOStringToJST', () => {
    it('should format ISO string to JST datetime', () => {
      const isoString = '2023-12-25T10:30:45.123Z';
      const result = DATE_FORMATTER.formatISOStringToJST(isoString);
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('formatBusinessDays', () => {
    it('should calculate business days excluding weekends', () => {
      const startDate = new Date('2023-12-25'); // 月曜日
      const endDate = new Date('2023-12-29'); // 金曜日
      const result = DATE_FORMATTER.formatBusinessDays(startDate, endDate);
      expect(result).toBe('5営業日');
    });

    it('should exclude weekends from business days calculation', () => {
      const startDate = new Date('2023-12-23'); // 土曜日
      const endDate = new Date('2023-12-25'); // 月曜日
      const result = DATE_FORMATTER.formatBusinessDays(startDate, endDate);
      expect(result).toBe('1営業日'); // 月曜日のみ
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date('1990-06-15');
      const result = DATE_FORMATTER.calculateAge(birthDate);
      expect(result).toMatch(/^\d+歳$/);
    });

    it('should handle birthday not yet reached this year', () => {
      const now = new Date();
      const birthDate = new Date(now.getFullYear() - 25, now.getMonth() + 1, now.getDate()); // 来月の誕生日
      const result = DATE_FORMATTER.calculateAge(birthDate);
      expect(result).toBe('24歳'); // まだ誕生日が来ていないので24歳
    });
  });

  describe('getMonthName', () => {
    it('should return correct month names', () => {
      expect(DATE_FORMATTER.getMonthName(0)).toBe('1月');
      expect(DATE_FORMATTER.getMonthName(5)).toBe('6月');
      expect(DATE_FORMATTER.getMonthName(11)).toBe('12月');
    });

    it('should return empty string for invalid month index', () => {
      expect(DATE_FORMATTER.getMonthName(12)).toBe('');
      expect(DATE_FORMATTER.getMonthName(-1)).toBe('');
    });
  });

  describe('getDayOfWeekName', () => {
    it('should return correct day names', () => {
      expect(DATE_FORMATTER.getDayOfWeekName(0)).toBe('日曜日');
      expect(DATE_FORMATTER.getDayOfWeekName(1)).toBe('月曜日');
      expect(DATE_FORMATTER.getDayOfWeekName(6)).toBe('土曜日');
    });

    it('should return empty string for invalid day index', () => {
      expect(DATE_FORMATTER.getDayOfWeekName(7)).toBe('');
      expect(DATE_FORMATTER.getDayOfWeekName(-1)).toBe('');
    });
  });

  describe('getDayOfWeekShort', () => {
    it('should return correct short day names', () => {
      expect(DATE_FORMATTER.getDayOfWeekShort(0)).toBe('日');
      expect(DATE_FORMATTER.getDayOfWeekShort(1)).toBe('月');
      expect(DATE_FORMATTER.getDayOfWeekShort(6)).toBe('土');
    });

    it('should return empty string for invalid day index', () => {
      expect(DATE_FORMATTER.getDayOfWeekShort(7)).toBe('');
      expect(DATE_FORMATTER.getDayOfWeekShort(-1)).toBe('');
    });
  });

  // Requirements validation tests
  describe('Requirements Validation', () => {
    it('should satisfy Requirement 9.1: Date format YYYY/MM/DD or YYYY年MM月DD日', () => {
      const date = new Date('2023-12-25');
      
      const shortFormat = DATE_FORMATTER.formatDate(date);
      expect(shortFormat).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
      
      const longFormat = DATE_FORMATTER.formatDateLong(date);
      expect(longFormat).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日$/);
    });

    it('should satisfy Requirement 9.2: Time format HH:MM or HH:MM:SS', () => {
      const date = new Date('2023-12-25T10:30:45');
      
      const timeFormat = DATE_FORMATTER.formatTime(date);
      expect(timeFormat).toMatch(/^\d{2}:\d{2}$/);
      
      const timeWithSecondsFormat = DATE_FORMATTER.formatTimeWithSeconds(date);
      expect(timeWithSecondsFormat).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('should satisfy Requirement 9.3: Relative time in Japanese expressions', () => {
      const now = new Date();
      
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const relativeTime = DATE_FORMATTER.formatRelativeTime(fiveMinutesAgo);
      expect(relativeTime).toMatch(/(分前|時間前|日前|週間前|ヶ月前|年前|たった今)$/);
    });

    it('should satisfy Requirement 9.4: Duration in Japanese units', () => {
      const duration = 2 * 60 * 60 * 1000; // 2時間
      const result = DATE_FORMATTER.formatDuration(duration);
      expect(result).toMatch(/(秒間|分間|時間|日間|週間|ヶ月間|年間)$/);
    });

    it('should satisfy Requirement 9.5: Timezone display JST or 日本標準時', () => {
      const date = new Date();
      
      const withJST = DATE_FORMATTER.formatDateTimeWithTimezone(date);
      expect(withJST).toContain('JST');
      
      const withFullTimezone = DATE_FORMATTER.formatDateTimeWithTimezone(date, true);
      expect(withFullTimezone).toContain('日本標準時');
    });
  });
});