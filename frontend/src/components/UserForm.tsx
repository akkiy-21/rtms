import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userFormSchema, UserFormData } from './features/users/user-form-schema';
import { USER_LABELS } from '../localization/constants/user-labels';
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

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void;
  children?: React.ReactNode;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmit, children }) => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      id: '',
      name: '',
      role: 'CU',
      ...initialData,
    },
  });

  const handleSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{USER_LABELS.FIELDS.ID}</FormLabel>
              <FormControl>
                <Input placeholder={USER_LABELS.PLACEHOLDERS.ID} {...field} />
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
              <FormLabel>{USER_LABELS.FIELDS.NAME}</FormLabel>
              <FormControl>
                <Input placeholder={USER_LABELS.PLACEHOLDERS.NAME} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{USER_LABELS.FIELDS.ROLE}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={USER_LABELS.PLACEHOLDERS.ROLE} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AD">{USER_LABELS.ROLE_DESCRIPTIONS.AD}</SelectItem>
                  <SelectItem value="CU">{USER_LABELS.ROLE_DESCRIPTIONS.CU}</SelectItem>
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

export default UserForm;