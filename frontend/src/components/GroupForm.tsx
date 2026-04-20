import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { groupFormSchema, GroupFormData } from './features/groups/group-form-schema';
import { GROUP_LABELS } from '../localization/constants/group-labels';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

interface GroupFormProps {
  initialData?: Partial<GroupFormData>;
  onSubmit: (data: GroupFormData) => void;
}

export interface GroupFormHandle {
  submit: () => Promise<void>;
  form: UseFormReturn<GroupFormData>;
}

const GroupForm = forwardRef<GroupFormHandle, GroupFormProps>(({ initialData, onSubmit }, ref) => {
  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: '',
      ...initialData,
    },
  });

  // initialDataが変更されたときにフォームをリセット
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: '',
        ...initialData,
      });
    }
  }, [initialData, form]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      await form.handleSubmit(onSubmit)();
    },
    form,
  }));

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{GROUP_LABELS.FIELDS.GROUP_NAME}</FormLabel>
              <FormControl>
                <Input placeholder={GROUP_LABELS.PLACEHOLDERS.NAME} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
});

GroupForm.displayName = 'GroupForm';

export default GroupForm;