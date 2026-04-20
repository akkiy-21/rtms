// src/components/EfficiencyAddressForm.tsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Client } from '../types/client';
import { Classification } from '../types/classification';
import { getPLC } from '../services/api';
import { PLCWithAddressRanges, AddressRange } from '../types/plc';
import { efficiencyAddressFormSchema, EfficiencyAddressFormData } from './features/efficiency/efficiency-address-form-schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { BUSINESS_TERMS } from '../localization/constants/business-terms';

interface EfficiencyAddressFormProps {
  initialData?: Partial<EfficiencyAddressFormData>;
  onSubmit: (data: EfficiencyAddressFormData) => void;
  clients: Client[];
  classifications: Classification[];
  onClose: () => void;
  open: boolean;
}

const EfficiencyAddressForm: React.FC<EfficiencyAddressFormProps> = ({ 
  initialData, 
  onSubmit, 
  clients, 
  classifications, 
  onClose, 
  open 
}) => {
  const [addressTypes, setAddressTypes] = useState<string[]>([]);
  const [plcInfo, setPlcInfo] = useState<PLCWithAddressRanges | null>(null);
  const [addressError, setAddressError] = useState<string>('');
  const [currentAddressRange, setCurrentAddressRange] = useState<AddressRange | null>(null);

  const form = useForm<EfficiencyAddressFormData>({
    resolver: zodResolver(efficiencyAddressFormSchema),
    defaultValues: {
      client_id: initialData?.client_id || 0,
      address_type: initialData?.address_type || '',
      address: initialData?.address || '',
      classification_id: initialData?.classification_id || 0,
    },
  });

  // フォームの値を監視
  const watchedClientId = form.watch('client_id');
  const watchedAddressType = form.watch('address_type');

  // フォームの初期値を設定
  useEffect(() => {
    if (open) {
      form.reset({
        client_id: initialData?.client_id || 0,
        address_type: initialData?.address_type || '',
        address: initialData?.address || '',
        classification_id: initialData?.classification_id || 0,
      });
    }
  }, [initialData, open, form]);

  useEffect(() => {
    if (watchedClientId) {
      fetchPLCInfo(watchedClientId);
    }
  }, [watchedClientId]);

  useEffect(() => {
    if (plcInfo && watchedAddressType) {
      const range = plcInfo.address_ranges.find(r => r.address_type === watchedAddressType);
      setCurrentAddressRange(range || null);
    } else {
      setCurrentAddressRange(null);
    }
  }, [plcInfo, watchedAddressType]);

  const fetchPLCInfo = async (clientId: number) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (client && client.plc) {
        const fetchedPlcInfo = await getPLC(client.plc.id);
        setPlcInfo(fetchedPlcInfo);
        
        const types = fetchedPlcInfo.address_ranges.map(range => range.address_type);
        setAddressTypes(types);
        
        if (!types.includes(form.getValues('address_type'))) {
          form.setValue('address_type', '');
          form.setValue('address', '');
        }
      }
    } catch (error) {
      console.error('Failed to fetch PLC information:', error);
    }
  };

  const handleAddressTypeChange = (value: string) => {
    form.setValue('address_type', value);
    form.setValue('address', '');
    setAddressError('');
  };

  const validateAddress = (address: string, addressType: string) => {
    if (!plcInfo || !currentAddressRange) return;

    const [min, max] = currentAddressRange.address_range.split('-').map(Number);
    let addressNum: number;
    let bitPart: number | undefined;

    if (currentAddressRange.data_type === 'word' && address.includes('.')) {
      const [mainPart, bitPartStr] = address.split('.');
      addressNum = Number(mainPart);
      bitPart = Number(bitPartStr);
    } else {
      addressNum = Number(address);
    }

    if (isNaN(addressNum) || addressNum < min || addressNum > max) {
      setAddressError(SETTINGS_LABELS.ADDRESS_VALIDATION_ERROR.replace('{min}', min.toString()).replace('{max}', max.toString()));
    } else if (currentAddressRange.data_type === 'word' && bitPart !== undefined) {
      if (isNaN(bitPart) || bitPart < 0 || bitPart > 15) {
        setAddressError(SETTINGS_LABELS.BIT_VALIDATION_ERROR);
      } else {
        setAddressError('');
      }
    } else if (currentAddressRange.data_type === 'bit' && address.includes('.')) {
      setAddressError(SETTINGS_LABELS.BIT_ADDRESS_ERROR);
    } else {
      setAddressError('');
    }
  };

  const handleSubmit = (data: EfficiencyAddressFormData) => {
    if (!addressError) {
      onSubmit(data);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? SETTINGS_LABELS.EDIT_EFFICIENCY_ADDRESS : SETTINGS_LABELS.CREATE_EFFICIENCY_ADDRESS}
          </DialogTitle>
          <DialogDescription>
            {initialData ? 
              "効率アドレスの設定を編集します。" : 
              "新しい効率アドレスを作成します。"
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>クライアント</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
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
                  <FormLabel>アドレスタイプ</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleAddressTypeChange(value);
                    }}
                    value={field.value}
                    disabled={!watchedClientId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={SETTINGS_LABELS.QC_SELECT_ADDRESS_TYPE} />
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
                  <FormLabel>{BUSINESS_TERMS.ADDRESS}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        validateAddress(e.target.value, watchedAddressType);
                      }}
                      disabled={!watchedAddressType}
                    />
                  </FormControl>
                  {addressError && (
                    <Alert variant="destructive">
                      <AlertDescription>{addressError}</AlertDescription>
                    </Alert>
                  )}
                  {currentAddressRange?.data_type === 'word' && !addressError && (
                    <p className="text-sm text-muted-foreground">
                      {SETTINGS_LABELS.WORD_ADDRESS_HELP}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classification_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{BUSINESS_TERMS.CLASSIFICATION}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={SETTINGS_LABELS.SELECT_CLASSIFICATION} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classifications.map((classification) => (
                        <SelectItem key={classification.id} value={classification.id.toString()}>
                          {classification.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {ACTION_LABELS.CANCEL}
              </Button>
              <Button type="submit" disabled={!!addressError}>
                {initialData ? ACTION_LABELS.UPDATE : ACTION_LABELS.CREATE}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EfficiencyAddressForm;