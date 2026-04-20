import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { QualityControlSignalFormData, SignalType, QualityControlSignal } from '../types/qualityControl';
import { Client } from '../types/client';
import { AddressRange } from '../types/plc';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';
import { VALIDATION_MESSAGES } from '../localization/constants/validation-messages';

// フォームバリデーションスキーマ
const qualityControlSignalFormSchema = z.object({
  client_id: z.number().min(1, VALIDATION_MESSAGES.REQUIRED(SETTINGS_LABELS.QC_CLIENT)),
  address_type: z.string().min(1, VALIDATION_MESSAGES.REQUIRED(SETTINGS_LABELS.QC_ADDRESS_TYPE)),
  address: z.string().min(1, VALIDATION_MESSAGES.REQUIRED(SETTINGS_LABELS.QC_ADDRESS)),
  signal_type: z.nativeEnum(SignalType),
  signal_shot_number: z.number().min(0, VALIDATION_MESSAGES.INVALID_RANGE(0, 999999)),
  signal_name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED(SETTINGS_LABELS.SIGNAL_NAME)),
  parent_id: z.number().nullable(),
});

interface QualityControlSignalFormProps {
  qualityControlSignal: QualityControlSignal;
  onSubmit: (data: QualityControlSignalFormData) => void;
  clients: Client[];
  addressRanges: AddressRange[];
  parentSignals: QualityControlSignal[];
}

const QualityControlSignalForm: React.FC<QualityControlSignalFormProps> = ({
  qualityControlSignal,
  onSubmit,
  clients,
  addressRanges,
  parentSignals
}) => {
  const [isClientDisabled, setIsClientDisabled] = useState(false);

  const form = useForm<QualityControlSignalFormData>({
    resolver: zodResolver(qualityControlSignalFormSchema),
    defaultValues: {
      client_id: qualityControlSignal.client_id,
      address_type: qualityControlSignal.address_type,
      address: qualityControlSignal.address,
      signal_type: qualityControlSignal.signal_type,
      signal_shot_number: qualityControlSignal.signal_shot_number,
      signal_name: qualityControlSignal.signal_name,
      parent_id: qualityControlSignal.parent_id,
    },
  });

  const watchedSignalType = form.watch('signal_type');
  const watchedParentId = form.watch('parent_id');
  const watchedClientId = form.watch('client_id');

  useEffect(() => {
    if (watchedSignalType === SignalType.Optional) {
      if (watchedParentId) {
        const parentSignal = parentSignals.find(signal => signal.id === watchedParentId);
        if (parentSignal) {
          form.setValue('client_id', parentSignal.client_id);
          setIsClientDisabled(true);
        }
      } else {
        setIsClientDisabled(false);
      }
    } else {
      setIsClientDisabled(false);
    }
  }, [watchedSignalType, watchedParentId, parentSignals, form]);

  const handleSubmit = (data: QualityControlSignalFormData) => {
    onSubmit(data);
  };

  const handleSignalTypeChange = (value: string) => {
    const newSignalType = value as SignalType;
    form.setValue('signal_type', newSignalType);
    if (newSignalType !== SignalType.Optional) {
      form.setValue('parent_id', null);
    }
  };

  const getAvailableAddressTypes = (clientId: number) => {
    return addressRanges
      .filter(range => range.plc_id === clients.find(client => client.id === clientId)?.plc.id)
      .map(range => range.address_type);
  };

  const isOptionalSignalType = watchedSignalType === SignalType.Optional;

  const availableParentSignals = parentSignals.filter(signal => 
    signal.signal_type === SignalType.Optional && 
    (signal.parent_id === null || signal.parent_id === undefined)
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="signal_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{SETTINGS_LABELS.SIGNAL_NAME}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="signal_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{SETTINGS_LABELS.SIGNAL_TYPE}</FormLabel>
              <Select onValueChange={handleSignalTypeChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={SETTINGS_LABELS.SELECT_SIGNAL_TYPE} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={SignalType.Good}>{SETTINGS_LABELS.SIGNAL_TYPE_GOOD}</SelectItem>
                  <SelectItem value={SignalType.Ng}>{SETTINGS_LABELS.SIGNAL_TYPE_NG}</SelectItem>
                  <SelectItem value={SignalType.Optional}>{SETTINGS_LABELS.SIGNAL_TYPE_OPTIONAL}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isOptionalSignalType && (
          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{SETTINGS_LABELS.PARENT_SIGNAL}</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value))} 
                  defaultValue={field.value?.toString() || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={SETTINGS_LABELS.SELECT_PARENT_SIGNAL} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">{SETTINGS_LABELS.NONE}</SelectItem>
                    {availableParentSignals.map((signal) => (
                      <SelectItem key={signal.id} value={signal.id.toString()}>
                        {signal.signal_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{SETTINGS_LABELS.QC_CLIENT}</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value?.toString() || ''}
                disabled={isClientDisabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={SETTINGS_LABELS.QC_SELECT_CLIENT} />
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
              <FormLabel>{SETTINGS_LABELS.QC_ADDRESS_TYPE}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={SETTINGS_LABELS.QC_SELECT_ADDRESS_TYPE} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getAvailableAddressTypes(watchedClientId).map((type) => (
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
              <FormLabel>{SETTINGS_LABELS.QC_ADDRESS}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="signal_shot_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{SETTINGS_LABELS.SIGNAL_SHOT_NUMBER}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {SETTINGS_LABELS.SAVE}
        </Button>
      </form>
    </Form>
  );
};

export default QualityControlSignalForm;