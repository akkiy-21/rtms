import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loggingSettingFormSchema } from './features/logging/logging-setting-form-schema';
import { LoggingSettingFormData } from '../types/logging';
import { Client } from '../types/client';
import { getPLC } from '../services/api';
import { PLCWithAddressRanges } from '../types/plc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useApiError } from '@/hooks/use-api-error';
import { LOGGING_LABELS } from '@/localization/constants/logging-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';

interface LoggingSettingFormProps {
  initialData?: Partial<LoggingSettingFormData>;
  onSubmit: (data: LoggingSettingFormData) => void;
  clients: Client[];
  isLoading?: boolean;
}

const LoggingSettingForm: React.FC<LoggingSettingFormProps> = ({ 
  initialData, 
  onSubmit, 
  clients,
  isLoading = false 
}) => {
  const { handleError } = useApiError();
  const [addressTypes, setAddressTypes] = useState<string[]>([]);
  const [plcInfo, setPlcInfo] = useState<PLCWithAddressRanges | null>(null);
  const [addressError, setAddressError] = useState<string>('');

  const form = useForm<LoggingSettingFormData>({
    resolver: zodResolver(loggingSettingFormSchema),
    defaultValues: {
      logging_name: initialData?.logging_name || '',
      description: initialData?.description || '',
      client_id: initialData?.client_id || 0,
      address_type: initialData?.address_type || '',
      address: initialData?.address || '',
      is_rising: initialData?.is_rising ?? true,
    },
  });

  const watchedClientId = form.watch('client_id');
  const watchedAddressType = form.watch('address_type');

  useEffect(() => {
    if (watchedClientId && watchedClientId > 0) {
      fetchPLCInfo(watchedClientId);
    }
  }, [watchedClientId]);

  useEffect(() => {
    const address = form.getValues('address');
    if (address && watchedAddressType) {
      validateAddress(address, watchedAddressType);
    }
  }, [watchedAddressType]);

  const fetchPLCInfo = async (clientId: number) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (client && client.plc) {
        const fetchedPlcInfo = await getPLC(client.plc.id);
        setPlcInfo(fetchedPlcInfo);
        
        const types = fetchedPlcInfo.address_ranges.map(range => range.address_type);
        setAddressTypes(types);
        
        // 現在選択されているアドレスタイプが新しいPLCで利用できない場合はリセット
        const currentAddressType = form.getValues('address_type');
        if (currentAddressType && !types.includes(currentAddressType)) {
          form.setValue('address_type', '');
          form.setValue('address', '');
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const validateAddress = (address: string, addressType: string) => {
    if (!plcInfo || !address || !addressType) {
      setAddressError('');
      return;
    }

    const addressRange = plcInfo.address_ranges.find(range => range.address_type === addressType);
    if (!addressRange) {
      setAddressError('');
      return;
    }

    const [min, max] = addressRange.address_range.split('-').map(Number);
    const addressNum = Number(address);

    if (isNaN(addressNum) || addressNum < min || addressNum > max) {
      setAddressError(LOGGING_LABELS.HELP_TEXT.ADDRESS_RANGE.replace('{min}', min.toString()).replace('{max}', max.toString()));
    } else {
      setAddressError('');
    }
  };

  const handleFormSubmit = (data: LoggingSettingFormData) => {
    if (!addressError) {
      onSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="logging_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LOGGING_LABELS.FIELDS.LOGGING_NAME}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={LOGGING_LABELS.PLACEHOLDERS.LOGGING_NAME} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LOGGING_LABELS.FIELDS.DESCRIPTION}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={LOGGING_LABELS.PLACEHOLDERS.DESCRIPTION} />
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
              <FormLabel>{LOGGING_LABELS.FIELDS.CLIENT}</FormLabel>
              <Select
                value={field.value?.toString() || ''}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={LOGGING_LABELS.PLACEHOLDERS.CLIENT} />
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

        <FormField
          control={form.control}
          name="address_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LOGGING_LABELS.FIELDS.ADDRESS_TYPE}</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue('address', '');
                  setAddressError('');
                }}
                disabled={!watchedClientId || addressTypes.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={LOGGING_LABELS.PLACEHOLDERS.ADDRESS_TYPE} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {addressTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LOGGING_LABELS.FIELDS.ADDRESS}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={LOGGING_LABELS.PLACEHOLDERS.ADDRESS}
                  disabled={!watchedAddressType}
                  onChange={(e) => {
                    field.onChange(e);
                    validateAddress(e.target.value, watchedAddressType);
                  }}
                />
              </FormControl>
              {addressError && (
                <p className="text-sm text-destructive">{addressError}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_rising"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{LOGGING_LABELS.FIELDS.IS_RISING}</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {LOGGING_LABELS.HELP_TEXT.IS_RISING}
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button 
            type="submit" 
            disabled={isLoading || !!addressError}
          >
            {isLoading ? `${ACTION_LABELS.SUBMIT}中...` : ACTION_LABELS.SUBMIT}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LoggingSettingForm;