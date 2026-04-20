// AlarmGroupForm.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { alarmGroupFormSchema, AlarmGroupFormData } from './features/alarms/alarm-group-form-schema';
import { Client } from '../types/client';
import { ALARM_LABELS } from '../localization/constants/alarm-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

interface AlarmGroupFormProps {
  initialData?: Partial<AlarmGroupFormData>;
  onSubmit: (data: AlarmGroupFormData) => void;
  onCancel?: () => void;
  clients: Client[];
  isLoading?: boolean;
  submitLabel?: string;
}

const AlarmGroupForm: React.FC<AlarmGroupFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  clients, 
  isLoading = false,
  submitLabel = ACTION_LABELS.CREATE
}) => {
  const form = useForm<AlarmGroupFormData>({
    resolver: zodResolver(alarmGroupFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      client_id: initialData?.client_id || 0,
    },
  });

  const handleSubmit = (data: AlarmGroupFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ALARM_LABELS.FIELDS.GROUP_NAME}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={ALARM_LABELS.PLACEHOLDERS.GROUP_NAME} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ALARM_LABELS.FIELDS.CLIENT}</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={ALARM_LABELS.PLACEHOLDERS.SELECT_CLIENT} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              {ACTION_LABELS.CANCEL}
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? MESSAGE_FORMATTER.SAVING() : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AlarmGroupForm;