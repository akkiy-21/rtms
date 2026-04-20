import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../../localization/constants/validation-messages';
import { PLC_LABELS } from '../../../localization/constants/plc-labels';

/**
 * アドレスレンジのバリデーションスキーマ
 * 
 * バリデーションルール:
 * - address_type: 必須、アドレスタイプ
 * - address_range: 必須、アドレス範囲
 * - numerical_base: 'decimal' | 'hex'
 * - data_type: 'bit' | 'word'
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export const addressRangeSchema = z.object({
  address_type: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(PLC_LABELS.ADDRESS_TYPE)),
  address_range: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(PLC_LABELS.ADDRESS_RANGE_VALUE)),
  numerical_base: z.enum(['decimal', 'hex'], {
    required_error: VALIDATION_MESSAGES.SELECTION_REQUIRED(PLC_LABELS.NUMERICAL_BASE),
  }),
  data_type: z.enum(['bit', 'word'], {
    required_error: VALIDATION_MESSAGES.SELECTION_REQUIRED(PLC_LABELS.DATA_TYPE),
  }),
});

/**
 * PLCフォームのバリデーションスキーマ
 * 
 * バリデーションルール:
 * - model: 必須、1-100文字
 * - manufacturer: 'KEYENCE' | 'OMRON' | 'MITSUBISHI'
 * - protocol: 必須、プロトコル名
 * - address_ranges: アドレスレンジの配列
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export const plcFormSchema = z.object({
  model: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(PLC_LABELS.MODEL))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(PLC_LABELS.MODEL, 100)),
  manufacturer: z.enum(['KEYENCE', 'OMRON', 'MITSUBISHI'], {
    required_error: VALIDATION_MESSAGES.SELECTION_REQUIRED(PLC_LABELS.MANUFACTURER),
  }),
  protocol: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(PLC_LABELS.PROTOCOL)),
  address_ranges: z.array(addressRangeSchema),
});

export type PLCFormData = z.infer<typeof plcFormSchema>;
export type AddressRangeFormData = z.infer<typeof addressRangeSchema>;
