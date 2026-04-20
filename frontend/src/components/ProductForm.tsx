import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, ProductFormData } from './features/products/product-form-schema';
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
import { Customer } from '../types/customer';
import { getCustomers } from '../services/api';
import { PRODUCT_LABELS } from '../localization/constants/product-labels';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  children?: React.ReactNode;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      internal_product_number: '',
      customer_product_number: '',
      product_name: '',
      customer_id: 0,
      ...initialData,
    },
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const fetchedCustomers = await getCustomers();
    setCustomers(fetchedCustomers);
  };

  const handleSubmit = (data: ProductFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="internal_product_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{PRODUCT_LABELS.FIELDS.INTERNAL_PRODUCT_NUMBER}</FormLabel>
              <FormControl>
                <Input placeholder={PRODUCT_LABELS.PLACEHOLDERS.INTERNAL_PRODUCT_NUMBER} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_product_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{PRODUCT_LABELS.FIELDS.CUSTOMER_PRODUCT_NUMBER}</FormLabel>
              <FormControl>
                <Input placeholder={PRODUCT_LABELS.PLACEHOLDERS.CUSTOMER_PRODUCT_NUMBER} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{PRODUCT_LABELS.FIELDS.PRODUCT_NAME}</FormLabel>
              <FormControl>
                <Input placeholder={PRODUCT_LABELS.PLACEHOLDERS.PRODUCT_NAME} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{PRODUCT_LABELS.FIELDS.CUSTOMER}</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={PRODUCT_LABELS.PLACEHOLDERS.CUSTOMER} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {children}
      </form>
    </Form>
  );
};

export default ProductForm;