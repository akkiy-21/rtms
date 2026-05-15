import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';
import { VALIDATION_MESSAGES } from '../localization/constants/validation-messages';
import { DeviceConnector, DeviceConnectorCreate, DeviceConnectorUpdate } from '../types/connector';

const connectorFormSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED(SETTINGS_LABELS.CONNECTOR_NAME)).max(100),
  connector_type: z.string().min(1),
  url: z.string().url('有効なURLを入力してください').max(500),
  api_key_header: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(SETTINGS_LABELS.CONNECTOR_API_KEY_HEADER))
    .max(100),
  api_key_value: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED(SETTINGS_LABELS.CONNECTOR_API_KEY_VALUE))
    .max(255),
  send_interval_minutes: z.coerce
    .number()
    .int()
    .min(30, '30分以上で設定してください'),
  initial_sync_days: z.coerce
    .number()
    .int()
    .min(1, '1日以上で設定してください'),
  is_enabled: z.boolean(),
});

type ConnectorFormValues = z.infer<typeof connectorFormSchema>;

interface ConnectorFormProps {
  initialValues?: DeviceConnector;
  onSubmit: (data: DeviceConnectorCreate | DeviceConnectorUpdate) => void;
  onCancel: () => void;
}

const ConnectorForm: React.FC<ConnectorFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const form = useForm<ConnectorFormValues>({
    resolver: zodResolver(connectorFormSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      connector_type: initialValues?.connector_type ?? 'aggregated_data',
      url: initialValues?.url ?? '',
      api_key_header: initialValues?.api_key_header ?? 'X-Api-Key',
      api_key_value: initialValues?.api_key_value ?? '',
      send_interval_minutes: initialValues?.send_interval_minutes ?? 60,
      initial_sync_days: initialValues?.initial_sync_days ?? 7,
      is_enabled: initialValues?.is_enabled ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{SETTINGS_LABELS.CONNECTOR_NAME}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="例: 生産管理システム連携" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* connector_type: 現状は aggregated_data 固定、将来拡張用に hidden フィールドとして保持 */}
        <input type="hidden" {...form.register('connector_type')} />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{SETTINGS_LABELS.CONNECTOR_URL}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/api/tables/xxx/import-records" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="api_key_header"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{SETTINGS_LABELS.CONNECTOR_API_KEY_HEADER}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="X-Api-Key" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="api_key_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{SETTINGS_LABELS.CONNECTOR_API_KEY_VALUE}</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="APIキーを入力" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="send_interval_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{SETTINGS_LABELS.CONNECTOR_SEND_INTERVAL}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={30} step={30} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="initial_sync_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{SETTINGS_LABELS.CONNECTOR_INITIAL_SYNC_DAYS}（手動送信）</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={1} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_enabled"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0">{SETTINGS_LABELS.CONNECTOR_IS_ENABLED}</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    </Form>
  );
};

export default ConnectorForm;
