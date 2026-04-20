import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../../localization/constants/validation-messages';
import { PRODUCT_LABELS } from '../../../localization/constants/product-labels';

/**
 * 製品フォームのバリデーションスキーマ
 * 
 * 統一されたバリデーションメッセージテンプレートを使用して、
 * 一貫した日本語エラーメッセージを提供します。
 * 
 * バリデーションルール:
 * - internal_product_number: 必須、1-50文字
 * - customer_product_number: 必須、1-50文字
 * - product_name: 必須、1-100文字
 * - customer_id: 必須、正の整数
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export const productFormSchema = z.object({
  internal_product_number: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(PRODUCT_LABELS.FIELDS.INTERNAL_PRODUCT_NUMBER))
    .max(50, VALIDATION_MESSAGES.MAX_LENGTH(PRODUCT_LABELS.FIELDS.INTERNAL_PRODUCT_NUMBER, 50)),
  customer_product_number: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(PRODUCT_LABELS.FIELDS.CUSTOMER_PRODUCT_NUMBER))
    .max(50, VALIDATION_MESSAGES.MAX_LENGTH(PRODUCT_LABELS.FIELDS.CUSTOMER_PRODUCT_NUMBER, 50)),
  product_name: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(PRODUCT_LABELS.FIELDS.PRODUCT_NAME))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(PRODUCT_LABELS.FIELDS.PRODUCT_NAME, 100)),
  customer_id: z.number({
    required_error: VALIDATION_MESSAGES.SELECTION_REQUIRED(PRODUCT_LABELS.FIELDS.CUSTOMER),
  }).positive(VALIDATION_MESSAGES.SELECTION_REQUIRED(PRODUCT_LABELS.FIELDS.CUSTOMER)),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
