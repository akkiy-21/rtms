import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../../localization/constants/validation-messages';
import { GROUP_LABELS } from '../../../localization/constants/group-labels';

/**
 * グループフォームのバリデーションスキーマ
 * 
 * バリデーションルール:
 * - name: 必須、1-100文字
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export const groupFormSchema = z.object({
  name: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(GROUP_LABELS.FIELDS.GROUP_NAME))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(GROUP_LABELS.FIELDS.GROUP_NAME, 100)),
});

export type GroupFormData = z.infer<typeof groupFormSchema>;
