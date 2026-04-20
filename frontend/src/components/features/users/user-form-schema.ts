import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../../localization/constants/validation-messages';
import { USER_LABELS } from '../../../localization/constants/user-labels';

/**
 * ユーザーフォームのバリデーションスキーマ
 * 
 * バリデーションルール:
 * - id: 必須、1-10文字、英数字のみ
 * - name: 必須、1-100文字
 * - role: 'SU' | 'AD' | 'CU'
 * - password: SUとADの場合は必須、CUの場合はオプション
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export const userFormSchema = z.object({
  id: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(USER_LABELS.FIELDS.ID))
    .max(10, VALIDATION_MESSAGES.MAX_LENGTH(USER_LABELS.FIELDS.ID, 10))
    .regex(/^[a-zA-Z0-9]+$/, VALIDATION_MESSAGES.INVALID_FORMAT('英数字')),
  name: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(USER_LABELS.FIELDS.NAME))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(USER_LABELS.FIELDS.NAME, 100)),
  role: z.enum(['SU', 'AD', 'CU'], {
    required_error: VALIDATION_MESSAGES.SELECTION_REQUIRED(USER_LABELS.FIELDS.ROLE),
  }),
  password: z.string().optional(),
}).refine((data) => {
  // SUまたはADの場合、パスワードは必須
  if ((data.role === 'SU' || data.role === 'AD') && !data.password) {
    return false;
  }
  return true;
}, {
  message: USER_LABELS.MESSAGES.PASSWORD_REQUIRED,
  path: ['password'],
});

export type UserFormData = z.infer<typeof userFormSchema>;
