// src/components/features/alarms/alarm-group-form-schema.ts

import { z } from 'zod';
import { ALARM_LABELS } from '../../../localization/constants/alarm-labels';

/**
 * AlarmGroupフォームのバリデーションスキーマ
 * 
 * アラームグループの作成・編集時に使用するフォームデータのバリデーションルールを定義
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export const alarmGroupFormSchema = z.object({
  name: z.string()
    .min(1, ALARM_LABELS.VALIDATION.GROUP_NAME_REQUIRED)
    .max(100, ALARM_LABELS.VALIDATION.GROUP_NAME_MAX_LENGTH),
  client_id: z.number({
    required_error: ALARM_LABELS.VALIDATION.CLIENT_REQUIRED,
    invalid_type_error: ALARM_LABELS.VALIDATION.CLIENT_INVALID,
  })
    .int(ALARM_LABELS.VALIDATION.CLIENT_INVALID)
    .positive(ALARM_LABELS.VALIDATION.CLIENT_REQUIRED),
});

/**
 * AlarmGroupフォームデータの型定義
 */
export type AlarmGroupFormData = z.infer<typeof alarmGroupFormSchema>;
