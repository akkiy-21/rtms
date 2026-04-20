import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loggingDataSettingFormSchema, dataTypeToAddressCount, LoggingDataSettingFormData } from './features/logging/logging-data-setting-form-schema';
import { LoggingDataSettingFormData as OriginalFormData } from '@/types/logging';
import { Client } from '@/types/client';
import { AddressRange } from '@/types/plc';
import { LOGGING_LABELS } from '@/localization/constants/logging-labels';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

interface LoggingDataSettingFormProps {
  initialData?: Partial<OriginalFormData>;
  onSubmit: (data: OriginalFormData) => void;
  onCancel?: () => void;
  client: Client;
  addressRanges: AddressRange[];
  isSubmitting?: boolean;
}

const dataTypes = [
  LOGGING_LABELS.DATA_TYPES.UNSIGNED_SMALLINT,
  LOGGING_LABELS.DATA_TYPES.UNSIGNED_INT,
  LOGGING_LABELS.DATA_TYPES.SMALLINT,
  LOGGING_LABELS.DATA_TYPES.INT,
  LOGGING_LABELS.DATA_TYPES.REAL,
  LOGGING_LABELS.DATA_TYPES.DOUBLE,
  LOGGING_LABELS.DATA_TYPES.ASCII
];

const LoggingDataSettingForm: React.FC<LoggingDataSettingFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  client, 
  addressRanges,
  isSubmitting = false
}) => {
  const [availableAddressTypes, setAvailableAddressTypes] = useState<string[]>([]);
  const [selectedAddressRange, setSelectedAddressRange] = useState<AddressRange | null>(null);

  const form = useForm<LoggingDataSettingFormData>({
    resolver: zodResolver(loggingDataSettingFormSchema),
    defaultValues: {
      data_name: initialData?.data_name || '',
      address_type: initialData?.address_type || '',
      address: initialData?.address || '',
      address_count: initialData?.address_count || 1,
      data_type: initialData?.data_type || '',
    },
  });

  const watchedAddressType = form.watch('address_type');
  const watchedDataType = form.watch('data_type');

  useEffect(() => {
    const types = Array.from(new Set(addressRanges.map(range => range.address_type)));
    setAvailableAddressTypes(types);
    if (types.length > 0 && !form.getValues('address_type')) {
      form.setValue('address_type', types[0]);
    }
  }, [addressRanges, form]);

  useEffect(() => {
    const range = addressRanges.find(range => range.address_type === watchedAddressType);
    setSelectedAddressRange(range || null);
  }, [watchedAddressType, addressRanges]);

  useEffect(() => {
    if (watchedDataType && watchedDataType !== LOGGING_LABELS.DATA_TYPES.ASCII && watchedDataType in dataTypeToAddressCount) {
      form.setValue('address_count', dataTypeToAddressCount[watchedDataType]);
    }
  }, [watchedDataType, form]);

  const isAddressValid = (address: string): boolean => {
    if (!selectedAddressRange || !address) return true; // バリデーションはzodで行う
    const [start, end] = selectedAddressRange.address_range.split('-').map(addr => 
      parseInt(addr, selectedAddressRange.numerical_base === 'hex' ? 16 : 10)
    );
    const addressNum = parseInt(address, selectedAddressRange.numerical_base === 'hex' ? 16 : 10);
    return !isNaN(addressNum) && addressNum >= start && addressNum <= end;
  };

  const handleSubmit = (data: LoggingDataSettingFormData) => {
    onSubmit(data as OriginalFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="data_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LOGGING_LABELS.FIELDS.DATA_NAME}</FormLabel>
              <FormControl>
                <Input placeholder={LOGGING_LABELS.PLACEHOLDERS.DATA_NAME} {...field} />
              </FormControl>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={LOGGING_LABELS.PLACEHOLDERS.ADDRESS_TYPE} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableAddressTypes.map((type) => (
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
                  placeholder={LOGGING_LABELS.PLACEHOLDERS.ADDRESS} 
                  {...field}
                />
              </FormControl>
              {field.value && !isAddressValid(field.value) && (
                <p className="text-sm text-destructive">{LOGGING_LABELS.MESSAGES.INVALID_ADDRESS_RANGE}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LOGGING_LABELS.FIELDS.DATA_TYPE}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={LOGGING_LABELS.PLACEHOLDERS.DATA_TYPE} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dataTypes.map((type) => (
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
          name="address_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LOGGING_LABELS.FIELDS.ADDRESS_COUNT}</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min={1}
                  disabled={watchedDataType !== LOGGING_LABELS.DATA_TYPES.ASCII}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              {ACTION_LABELS.CANCEL}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? MESSAGE_FORMATTER.CREATING() : ACTION_LABELS.CREATE}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LoggingDataSettingForm;