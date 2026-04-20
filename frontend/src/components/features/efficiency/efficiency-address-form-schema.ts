// src/components/features/efficiency/efficiency-address-form-schema.ts

import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../../localization/constants/validation-messages';
import { BUSINESS_TERMS } from '../../../localization/constants/business-terms';

export const efficiencyAddressFormSchema = z.object({
  client_id: z.number().min(1, VALIDATION_MESSAGES.SELECTION_REQUIRED('クライアント')),
  address_type: z.string().min(1, VALIDATION_MESSAGES.SELECTION_REQUIRED('アドレスタイプ')),
  address: z.string().min(1, VALIDATION_MESSAGES.REQUIRED(BUSINESS_TERMS.ADDRESS)),
  classification_id: z.number().min(1, VALIDATION_MESSAGES.SELECTION_REQUIRED(BUSINESS_TERMS.CLASSIFICATION)),
});

export type EfficiencyAddressFormData = z.infer<typeof efficiencyAddressFormSchema>;