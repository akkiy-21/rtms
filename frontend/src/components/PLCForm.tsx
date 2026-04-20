import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { plcFormSchema, PLCFormData } from './features/plcs/plc-form-schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { 
  PLC_LABELS, 
  PLC_MANUFACTURERS, 
  PLC_PROTOCOLS, 
  NUMERICAL_BASE_LABELS, 
  DATA_TYPE_LABELS 
} from '../localization/constants/plc-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';

interface PLCFormProps {
  initialData?: Partial<PLCFormData>;
  onSubmit: (data: PLCFormData) => void;
  children?: React.ReactNode;
}

const PLCForm: React.FC<PLCFormProps> = ({ initialData, onSubmit, children }) => {
  const form = useForm<PLCFormData>({
    resolver: zodResolver(plcFormSchema),
    defaultValues: {
      model: initialData?.model || '',
      manufacturer: initialData?.manufacturer || 'KEYENCE',
      protocol: initialData?.protocol || '',
      address_ranges: initialData?.address_ranges || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'address_ranges',
  });

  const handleSubmit = (data: PLCFormData) => {
    onSubmit(data);
  };

  const handleAddAddressRange = () => {
    append({
      address_type: '',
      address_range: '',
      numerical_base: 'decimal',
      data_type: 'bit',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{PLC_LABELS.MODEL}</FormLabel>
              <FormControl>
                <Input placeholder={PLC_LABELS.MODEL_PLACEHOLDER} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manufacturer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{PLC_LABELS.MANUFACTURER}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={PLC_LABELS.MANUFACTURER_PLACEHOLDER} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="KEYENCE">{PLC_MANUFACTURERS.KEYENCE}</SelectItem>
                  <SelectItem value="OMRON">{PLC_MANUFACTURERS.OMRON}</SelectItem>
                  <SelectItem value="MITSUBISHI">{PLC_MANUFACTURERS.MITSUBISHI}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="protocol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{PLC_LABELS.PROTOCOL}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={PLC_LABELS.PROTOCOL_PLACEHOLDER} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MC">{PLC_PROTOCOLS.MC}</SelectItem>
                  <SelectItem value="FINS">{PLC_PROTOCOLS.FINS}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{PLC_LABELS.ADDRESS_RANGES}</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAddressRange}
            >
              <Plus className="h-4 w-4 mr-2" />
              {ACTION_LABELS.ADD}
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{PLC_LABELS.ADDRESS_RANGE_NUMBER} {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`address_ranges.${index}.address_type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{PLC_LABELS.ADDRESS_TYPE}</FormLabel>
                        <FormControl>
                          <Input placeholder={PLC_LABELS.ADDRESS_TYPE_PLACEHOLDER} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`address_ranges.${index}.address_range`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{PLC_LABELS.ADDRESS_RANGE_VALUE}</FormLabel>
                        <FormControl>
                          <Input placeholder={PLC_LABELS.ADDRESS_RANGE_PLACEHOLDER} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`address_ranges.${index}.numerical_base`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{PLC_LABELS.NUMERICAL_BASE}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={PLC_LABELS.NUMERICAL_BASE_PLACEHOLDER} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="decimal">{NUMERICAL_BASE_LABELS.decimal}</SelectItem>
                            <SelectItem value="hex">{NUMERICAL_BASE_LABELS.hex}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`address_ranges.${index}.data_type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{PLC_LABELS.DATA_TYPE}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={PLC_LABELS.DATA_TYPE_PLACEHOLDER} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bit">{DATA_TYPE_LABELS.bit}</SelectItem>
                            <SelectItem value="word">{DATA_TYPE_LABELS.word}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {PLC_LABELS.NO_ADDRESS_RANGES}
            </div>
          )}
        </div>

        {children}
      </form>
    </Form>
  );
};

export default PLCForm;