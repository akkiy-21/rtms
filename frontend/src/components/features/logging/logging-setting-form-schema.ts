import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/localization/constants/validation-messages';
import { LOGGING_LABELS } from '@/localization/constants/logging-labels';

export const loggingSettingFormSchema = z.object({
  logging_name: z.string()
    .min(1, LOGGING_LABELS.VALIDATION.LOGGING_NAME_REQUIRED)
    .max(100, LOGGING_LABELS.VALIDATION.LOGGING_NAME_MAX_LENGTH),
  description: z.string().optional(),
  client_id: z.number()
    .min(1, LOGGING_LABELS.VALIDATION.CLIENT_REQUIRED),
  address_type: z.string()
    .min(1, LOGGING_LABELS.VALIDATION.ADDRESS_TYPE_REQUIRED),
  address: z.string()
    .min(1, LOGGING_LABELS.VALIDATION.ADDRESS_REQUIRED)
    .regex(/^\d+$/, LOGGING_LABELS.VALIDATION.ADDRESS_INVALID),
  is_rising: z.boolean(),
});

export type LoggingSettingFormData = z.infer<typeof loggingSettingFormSchema>;