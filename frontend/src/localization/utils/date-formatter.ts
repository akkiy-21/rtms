/**
 * 日付・時刻フォーマット関数
 * 
 * 日本の形式に従った日付・時刻の表示を提供します。
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

export const DATE_FORMATTER = {
  /**
   * 日付フォーマット - YYYY/MM/DD形式
   * Requirement 9.1: 日付が表示される場合、「YYYY年MM月DD日」または「YYYY/MM/DD」形式を使用する
   */
  formatDate: (date: Date): string => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  },

  /**
   * 日付フォーマット - YYYY年MM月DD日形式
   * Requirement 9.1: 日付が表示される場合、「YYYY年MM月DD日」または「YYYY/MM/DD」形式を使用する
   */
  formatDateLong: (date: Date): string => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * 時刻フォーマット - HH:MM形式
   * Requirement 9.2: 時刻が表示される場合、「HH:MM」または「HH:MM:SS」形式を使用する
   */
  formatTime: (date: Date): string => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * 時刻フォーマット - HH:MM:SS形式
   * Requirement 9.2: 時刻が表示される場合、「HH:MM」または「HH:MM:SS」形式を使用する
   */
  formatTimeWithSeconds: (date: Date): string => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },

  /**
   * 日時フォーマット - YYYY/MM/DD HH:MM:SS形式
   * Requirements 9.1, 9.2: 日付と時刻の組み合わせ
   */
  formatDateTime: (date: Date): string => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },

  /**
   * 日時フォーマット - YYYY年MM月DD日 HH:MM形式
   * Requirements 9.1, 9.2: 日付と時刻の組み合わせ（長い形式）
   */
  formatDateTimeLong: (date: Date): string => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * 相対時間フォーマット
   * Requirement 9.3: 相対時間が表示される場合、「○分前」「○時間前」「○日前」などの日本語表現を使用する
   */
  formatRelativeTime: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // 未来の日付の場合
    if (diffMs < 0) {
      const futureDiffSeconds = Math.abs(Math.floor(diffMs / 1000));
      const futureDiffMinutes = Math.abs(diffMinutes);
      const futureDiffHours = Math.abs(diffHours);
      const futureDiffDays = Math.abs(diffDays);

      if (futureDiffSeconds < 60) return 'まもなく';
      if (futureDiffMinutes < 60) return `${futureDiffMinutes}分後`;
      if (futureDiffHours < 24) return `${futureDiffHours}時間後`;
      if (futureDiffDays < 30) return `${futureDiffDays}日後`;
      
      return DATE_FORMATTER.formatDate(date);
    }

    // 過去の日付の場合
    if (diffMinutes < 1) return 'たった今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffWeeks < 4) return `${diffWeeks}週間前`;
    if (diffMonths < 12) return `${diffMonths}ヶ月前`;
    if (diffYears < 2) return `${diffYears}年前`;

    // 2年以上前の場合は日付を表示
    return DATE_FORMATTER.formatDate(date);
  },

  /**
   * 期間フォーマット
   * Requirement 9.4: 期間が表示される場合、「○日間」「○時間」などの日本語単位を使用する
   */
  formatDuration: (durationMs: number): string => {
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}年間`;
    if (months > 0) return `${months}ヶ月間`;
    if (weeks > 0) return `${weeks}週間`;
    if (days > 0) return `${days}日間`;
    if (hours > 0) return `${hours}時間`;
    if (minutes > 0) return `${minutes}分間`;
    if (seconds > 0) return `${seconds}秒間`;
    
    return '0秒間';
  },

  /**
   * 期間フォーマット（詳細版）- 複数単位を組み合わせ
   * Requirement 9.4: より詳細な期間表示
   */
  formatDurationDetailed: (durationMs: number): string => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    
    if (days > 0) parts.push(`${days}日`);
    if (hours > 0) parts.push(`${hours}時間`);
    if (minutes > 0) parts.push(`${minutes}分`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}秒`);

    return parts.join('');
  },

  /**
   * タイムゾーン情報付きフォーマット
   * Requirement 9.5: タイムゾーン情報が必要な場合、「JST」または「日本標準時」を表示する
   */
  formatDateTimeWithTimezone: (date: Date, showFullTimezone = false): string => {
    const dateTimeStr = DATE_FORMATTER.formatDateTime(date);
    const timezone = showFullTimezone ? '日本標準時' : 'JST';
    return `${dateTimeStr} (${timezone})`;
  },

  /**
   * ISO文字列から日本時間での表示
   * Requirement 9.5: タイムゾーンを考慮した日時表示
   */
  formatISOStringToJST: (isoString: string): string => {
    const date = new Date(isoString);
    return DATE_FORMATTER.formatDateTime(date);
  },

  /**
   * 営業日計算用のヘルパー関数
   * 土日を除いた営業日での期間計算
   */
  formatBusinessDays: (startDate: Date, endDate: Date): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let businessDays = 0;
    
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // 土曜日(6)と日曜日(0)を除く
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return `${businessDays}営業日`;
  },

  /**
   * 年齢計算
   * 生年月日から現在の年齢を計算
   */
  calculateAge: (birthDate: Date): string => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age}歳`;
  },

  /**
   * 月の表示名を取得
   * 1月、2月...12月の形式
   */
  getMonthName: (monthIndex: number): string => {
    const months = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    return months[monthIndex] || '';
  },

  /**
   * 曜日の表示名を取得
   * 日曜日、月曜日...土曜日の形式
   */
  getDayOfWeekName: (dayIndex: number): string => {
    const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    return days[dayIndex] || '';
  },

  /**
   * 曜日の短縮表示名を取得
   * 日、月...土の形式
   */
  getDayOfWeekShort: (dayIndex: number): string => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[dayIndex] || '';
  },
} as const;

export type DateFormatterFunction = typeof DATE_FORMATTER[keyof typeof DATE_FORMATTER];