// DeviceForm.tsx
// デバイスフォームコンポーネント - react-hook-formとshadcn/uiを使用

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deviceFormSchema, DeviceFormData } from './features/devices/device-form-schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { DEVICE_LABELS } from '../localization/constants/device-labels';
import { TECHNICAL_TERMS } from '../localization/constants/technical-terms';

interface DeviceFormProps {
  initialData?: Partial<DeviceFormData>;
  onSubmit: (data: DeviceFormData) => void;
  children?: React.ReactNode;
}

const DeviceForm: React.FC<DeviceFormProps> = ({ initialData, onSubmit, children }) => {
  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      mac_address: '',
      name: '',
      standard_cycle_time: undefined,
      planned_production_quantity: undefined,
      planned_production_time: undefined,
      ...initialData,
    },
  });

  // initialDataが変更されたときにフォームをリセット
  useEffect(() => {
    if (initialData) {
      form.reset({
        mac_address: '',
        name: '',
        standard_cycle_time: undefined,
        planned_production_quantity: undefined,
        planned_production_time: undefined,
        ...initialData,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: DeviceFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mac_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{TECHNICAL_TERMS.MAC_ADDRESS}</FormLabel>
              <FormControl>
                <Input placeholder={DEVICE_LABELS.PLACEHOLDERS.MAC_ADDRESS} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{DEVICE_LABELS.FIELDS.DEVICE_NAME}</FormLabel>
              <FormControl>
                <Input placeholder={DEVICE_LABELS.PLACEHOLDERS.DEVICE_NAME} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="standard_cycle_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{DEVICE_LABELS.FIELDS.STANDARD_CYCLE_TIME}（オプション）</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={DEVICE_LABELS.PLACEHOLDERS.STANDARD_CYCLE_TIME}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : parseFloat(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="planned_production_quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{DEVICE_LABELS.FIELDS.PLANNED_PRODUCTION_QUANTITY}（オプション）</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={DEVICE_LABELS.PLACEHOLDERS.PLANNED_PRODUCTION_QUANTITY}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : parseInt(value, 10));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="planned_production_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{DEVICE_LABELS.FIELDS.PLANNED_PRODUCTION_TIME}（オプション）</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={DEVICE_LABELS.PLACEHOLDERS.PLANNED_PRODUCTION_TIME}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : parseFloat(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {children}
      </form>
    </Form>
  );
};

export default DeviceForm;