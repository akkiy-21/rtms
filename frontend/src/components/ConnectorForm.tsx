import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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

const CONNECTOR_SCHEMAS: Record<string, { description: string; example: object; fields: { name: string; type: string; description: string }[] }> = {
  aggregated_data: {
    description: '集計期間ごとの良品数・不良品数を配列で送信します。',
    example: {
      records: [
        {
          started_at: '2026-05-18T08:00:00',
          ended_at: '2026-05-18T09:00:00',
          good_qty: 120,
          ng_qty: 3,
        },
      ],
      on_duplicate: 'append',
    },
    fields: [
      { name: 'records[].started_at', type: 'string', description: '集計期間の開始日時（ISO 8601）' },
      { name: 'records[].ended_at', type: 'string', description: '集計期間の終了日時（ISO 8601）' },
      { name: 'records[].good_qty', type: 'integer', description: '良品数' },
      { name: 'records[].ng_qty', type: 'integer', description: '不良品数' },
      { name: 'on_duplicate', type: 'string', description: '重複時の動作（ignore: 無視 / update: 上書き）' },
    ],
  },
  alarm_data: {
    description: 'アラームデータ（未実装）',
    example: {},
    fields: [],
  },
};

const ConnectorTypeSchemaHelp: React.FC<{ connectorType: string }> = ({ connectorType }) => {
  const [open, setOpen] = useState(false);
  const schema = CONNECTOR_SCHEMAS[connectorType];
  if (!schema || schema.fields.length === 0) return null;
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
        送信JSONスキーマを確認
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        <p className="text-xs text-muted-foreground">{schema.description}</p>
        <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">
          {JSON.stringify(schema.example, null, 2)}
        </pre>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1 pr-3 font-medium text-muted-foreground">フィールド</th>
              <th className="text-left py-1 pr-3 font-medium text-muted-foreground">型</th>
              <th className="text-left py-1 font-medium text-muted-foreground">説明</th>
            </tr>
          </thead>
          <tbody>
            {schema.fields.map((f) => (
              <tr key={f.name} className="border-b border-muted">
                <td className="py-1 pr-3 font-mono text-foreground">{f.name}</td>
                <td className="py-1 pr-3 text-muted-foreground">{f.type}</td>
                <td className="py-1 text-muted-foreground">{f.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CollapsibleContent>
    </Collapsible>
  );
};

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
  on_duplicate: z.string().min(1),
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
      on_duplicate: initialValues?.on_duplicate ?? 'ignore',
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

        <FormField
          control={form.control}
          name="connector_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{SETTINGS_LABELS.CONNECTOR_TYPE}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="データ種別を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(SETTINGS_LABELS.CONNECTOR_TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <ConnectorTypeSchemaHelp connectorType={form.watch('connector_type')} />

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
          name="on_duplicate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{SETTINGS_LABELS.CONNECTOR_ON_DUPLICATE}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(SETTINGS_LABELS.CONNECTOR_ON_DUPLICATES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
