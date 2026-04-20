// client-form-schema.ts
import { z } from 'zod';

export const clientFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  plc_id: z.number({
    required_error: 'PLC is required',
    invalid_type_error: 'PLC must be selected',
  }).min(1, 'PLC is required'),
  ip_address: z.string()
    .min(1, 'IP Address is required')
    .regex(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      'Invalid IP address format'
    ),
  port_no: z.number({
    required_error: 'Port is required',
    invalid_type_error: 'Port must be a number',
  })
    .min(1, 'Port must be at least 1')
    .max(65535, 'Port must be at most 65535'),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
