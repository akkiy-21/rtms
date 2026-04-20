import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerFormSchema, CustomerFormData } from './features/customers/customer-form-schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { CUSTOMER_LABELS } from '../localization/constants/customer-labels';

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => void;
  children?: React.ReactNode;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSubmit, children }) => {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      ...initialData,
    },
  });

  const handleSubmit = (data: CustomerFormData) => {
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
              <FormLabel>{CUSTOMER_LABELS.FIELDS.CUSTOMER_NAME}</FormLabel>
              <FormControl>
                <Input placeholder={CUSTOMER_LABELS.PLACEHOLDERS.CUSTOMER_NAME} {...field} />
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

export default CustomerForm;