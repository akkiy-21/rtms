import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { classificationFormSchema, ClassificationFormData } from './features/classifications/classification-form-schema';
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
import { ClassificationGroup } from '../types/classification';
import { CLASSIFICATION_LABELS } from '../localization/constants/classification-labels';

interface ClassificationFormProps {
  initialData?: Partial<ClassificationFormData>;
  groups: ClassificationGroup[];
  onSubmit: (data: ClassificationFormData) => void;
  children?: React.ReactNode;
}

const ClassificationForm: React.FC<ClassificationFormProps> = ({ 
  initialData, 
  groups, 
  onSubmit, 
  children 
}) => {
  const form = useForm<ClassificationFormData>({
    resolver: zodResolver(classificationFormSchema),
    defaultValues: {
      name: '',
      group_id: 0,
      ...initialData,
    },
  });

  const handleSubmit = (data: ClassificationFormData) => {
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
              <FormLabel>{CLASSIFICATION_LABELS.FIELDS.NAME}</FormLabel>
              <FormControl>
                <Input placeholder={CLASSIFICATION_LABELS.PLACEHOLDERS.NAME} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="group_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{CLASSIFICATION_LABELS.CLASSIFICATION_GROUP}</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={CLASSIFICATION_LABELS.PLACEHOLDERS.GROUP_SELECT} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
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

export default ClassificationForm;