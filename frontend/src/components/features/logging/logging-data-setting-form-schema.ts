import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/localization/constants/validation-messages';
import { LOGGING_LABELS } from '@/localization/constants/logging-labels';

// データタイプとアドレス数のマッピング
const dataTypeToAddressCount: { [key: string]: number } = {
  'UNSIGNED SMALLINT': 1,
  'UNSIGNED INT': 2,
  'SMALLINT': 1,
  'INT': 2,
  'REAL': 2,
  'DOUBLE': 4,
};

export const loggingDataSettingFormSchema = z.object({
  data_name: z.string()
    .min(1, LOGGING_LABELS.VALIDATION.DATA_NAME_REQUIRED)
    .max(100, LOGGING_LABELS.VALIDATION.DATA_NAME_MAX_LENGTH),
  address_type: z.string()
    .min(1, LOGGING_LABELS.VALIDATION.ADDRESS_TYPE_REQUIRED),
  address: z.string()
    .min(1, LOGGING_LABELS.VALIDATION.ADDRESS_REQUIRED),
  address_count: z.number()
    .min(1, LOGGING_LABELS.VALIDATION.ADDRESS_COUNT_MIN)
    .max(1000, VALIDATION_MESSAGES.MAX_VALUE('アドレス数', 1000)),
  data_type: z.string()
    .min(1, LOGGING_LABELS.VALIDATION.DATA_TYPE_REQUIRED),
}).refine((data) => {
  // ASCIIタイプ以外の場合、データタイプに応じたアドレス数を自動設定
  if (data.data_type !== 'ASCII' && data.data_type in dataTypeToAddressCount) {
    return data.address_count === dataTypeToAddressCount[data.data_type];
  }
  return true;
}, {
  message: 'データタイプに対応するアドレス数が正しくありません',
  path: ['address_count'],
});

export type LoggingDataSettingFormData = z.infer<typeof loggingDataSettingFormSchema>;

// データタイプとアドレス数のマッピングをエクスポート
export { dataTypeToAddressCount };