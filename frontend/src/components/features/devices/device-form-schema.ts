// device-form-schema.ts
// デバイスフォームのバリデーションスキーマ

import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../../localization/constants/validation-messages';
import { DEVICE_LABELS } from '../../../localization/constants/device-labels';
import { TECHNICAL_TERMS } from '../../../localization/constants/technical-terms';

export const deviceFormSchema = z.object({
  mac_address: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(TECHNICAL_TERMS.MAC_ADDRESS))
    .regex(
      /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
      VALIDATION_MESSAGES.INVALID_MAC_ADDRESS()
    ),
  name: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(DEVICE_LABELS.FIELDS.DEVICE_NAME))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(DEVICE_LABELS.FIELDS.DEVICE_NAME, 100)),
  ssh_username: z.string()
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(DEVICE_LABELS.FIELDS.SSH_USERNAME, 100))
    .optional()
    .or(z.literal('')),
  ssh_password: z.string()
    .max(255, VALIDATION_MESSAGES.MAX_LENGTH(DEVICE_LABELS.FIELDS.SSH_PASSWORD, 255))
    .optional()
    .or(z.literal('')),
  standard_cycle_time: z.number()
    .positive(VALIDATION_MESSAGES.MIN_VALUE(DEVICE_LABELS.FIELDS.STANDARD_CYCLE_TIME, 1))
    .optional()
    .or(z.literal(undefined)),
});

export type DeviceFormData = z.infer<typeof deviceFormSchema>;
