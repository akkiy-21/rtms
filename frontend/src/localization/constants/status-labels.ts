/**
 * ステータス表示翻訳定数
 * 
 * システム内で使用される各種ステータスの日本語表示です。
 * 直感的なステータス理解により、ユーザーエクスペリエンスを向上させます。
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

export const STATUS_LABELS = {
  // ユーザーロール
  SUPER_USER: 'スーパーユーザー',
  ADMIN_USER: '管理者',
  ADMIN: '管理者',
  COMMON_USER: '一般ユーザー',
  USER: 'ユーザー',
  GUEST: 'ゲスト',
  
  // デバイスステータス
  ONLINE: 'オンライン',
  OFFLINE: 'オフライン',
  ERROR: 'エラー',
  CONNECTING: '接続中',
  CONNECTED: '接続済み',
  DISCONNECTED: '切断',
  RECONNECTING: '再接続中',
  
  // 処理ステータス
  COMPLETED: '完了',
  SUCCESS: '成功',
  PROCESSING: '処理中',
  RUNNING: '実行中',
  FAILED: '失敗',
  ERROR_STATUS: 'エラー',
  PENDING: '待機中',
  WAITING: '待機中',
  CANCELLED: 'キャンセル済み',
  TIMEOUT: 'タイムアウト',
  
  // 一般的な状態
  ACTIVE: 'アクティブ',
  INACTIVE: '非アクティブ',
  ENABLED: '有効',
  DISABLED: '無効',
  AVAILABLE: '利用可能',
  UNAVAILABLE: '利用不可',
  READY: '準備完了',
  NOT_READY: '準備中',
  
  // データ状態
  VALID: '有効',
  INVALID: '無効',
  EXPIRED: '期限切れ',
  UPDATED: '更新済み',
  OUTDATED: '古い',
  SYNCHRONIZED: '同期済み',
  NOT_SYNCHRONIZED: '未同期',
  
  // 承認状態
  APPROVED: '承認済み',
  REJECTED: '却下',
  PENDING_APPROVAL: '承認待ち',
  UNDER_REVIEW: '審査中',
  
  // 優先度
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
  CRITICAL: '緊急',
  NORMAL: '通常',
  
  // 品質ステータス
  GOOD: '良好',
  WARNING: '警告',
  CRITICAL_STATUS: '重要',
  UNKNOWN: '不明',
  
  // ログレベル
  DEBUG: 'デバッグ',
  INFO: '情報',
  WARN: '警告',
  ERROR_LEVEL: 'エラー',
  FATAL: '致命的',
  
  // 接続状態
  STABLE: '安定',
  UNSTABLE: '不安定',
  WEAK: '弱い',
  STRONG: '強い',
  
  // 作業状態
  IN_PROGRESS: '進行中',
  SCHEDULED: 'スケジュール済み',
  PAUSED: '一時停止',
  STOPPED: '停止',
  
  // 同期状態
  SYNCING: '同期中',
  SYNC_FAILED: '同期失敗',
  UP_TO_DATE: '最新',
  
  // その他
  NEW: '新規',
  MODIFIED: '変更済み',
  DELETED: '削除済み',
  ARCHIVED: 'アーカイブ済み',
  DRAFT: '下書き',
  PUBLISHED: '公開済み',
} as const;

export type StatusLabel = typeof STATUS_LABELS[keyof typeof STATUS_LABELS];