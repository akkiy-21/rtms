import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../../localization/constants/validation-messages';
import { CUSTOMER_LABELS } from '../../../localization/constants/customer-labels';

/**
 * 顧客フォームのバリデーションスキーマ
 * 
 * 統一されたバリデーションメッセージテンプレートを使用して、
 * 一貫した日本語エラーメッセージを提供します。
 * 
 * バリデーションルール:
 * - name: 必須、1-100文字
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export const customerFormSchema = z.object({
  name: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(CUSTOMER_LABELS.FIELDS.CUSTOMER_NAME))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(CUSTOMER_LABELS.FIELDS.CUSTOMER_NAME, 100)),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
