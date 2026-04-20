import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../../localization/constants/validation-messages';
import { CLASSIFICATION_LABELS } from '../../../localization/constants/classification-labels';

/**
 * 分類フォームのバリデーションスキーマ
 * 
 * 統一されたバリデーションメッセージテンプレートを使用して、
 * 一貫したエラーメッセージを提供します。
 * 
 * バリデーションルール:
 * - name: 必須、1-100文字 (Requirements 5.1, 5.2)
 * - group_id: 必須、正の整数 (Requirements 5.1, 5.3)
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export const classificationFormSchema = z.object({
  name: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(CLASSIFICATION_LABELS.FIELDS.CLASSIFICATION_NAME))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(CLASSIFICATION_LABELS.FIELDS.CLASSIFICATION_NAME, 100)),
  group_id: z.number({
    required_error: VALIDATION_MESSAGES.SELECTION_REQUIRED(CLASSIFICATION_LABELS.FIELDS.GROUP),
  })
    .int(VALIDATION_MESSAGES.INVALID_INTEGER())
    .positive(VALIDATION_MESSAGES.SELECTION_REQUIRED(CLASSIFICATION_LABELS.FIELDS.GROUP)),
});

export type ClassificationFormData = z.infer<typeof classificationFormSchema>;
