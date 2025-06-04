// src/components/AssignExpertsForm.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Employee, Metric, EmployeesToMetrics } from '@/types';
import { metrics } from '@/api/endpoints/metrics';
import { employeesToMetrics } from '@/api/endpoints/employeesToMetrics';
import apiClient from '@/api/axios';

type AssignExpertsFormValues = {
  expert?: number;
  year: number;
  quarter: number;
  metrics: {
    metric_id: number;
    metric_number: number | undefined;
    metric_subnumber: string | undefined;
    metric_description: string | undefined;
    isSelected: boolean;
  }[];
};

type AssignExpertsFormProps = {
  onSuccess: () => void;
  existingAssignments: EmployeesToMetrics[];
  employeesList: Employee[];
};

export const AssignExpertsForm: React.FC<AssignExpertsFormProps> = ({
  onSuccess,
  existingAssignments,
  employeesList,
}) => {
  const form = useForm<AssignExpertsFormValues>({
    defaultValues: {
      expert: undefined,
      year: 2025,
      quarter: 1,
      metrics: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'metrics',
  });

  // Локальное состояние для ввода поиска по ФИО
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Отсортированный список сотрудников (по ФИО: фамилия, имя, отчество)
  const sortedEmployees = useMemo(() => {
    return [...employeesList].sort((a, b) => {
      const nameA = `${a.last_name} ${a.first_name} ${a.surname}`.toLowerCase();
      const nameB = `${b.last_name} ${b.first_name} ${b.surname}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [employeesList]);

  // Отфильтрованный список в соответствии с вводом в поле поиска
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) {
      return sortedEmployees;
    }
    const lower = searchTerm.trim().toLowerCase();
    return sortedEmployees.filter((emp) =>
      `${emp.last_name} ${emp.first_name} ${emp.surname}`.toLowerCase().includes(lower)
    );
  }, [sortedEmployees, searchTerm]);

  // При загрузке метрик инициализируем поле metrics
  useEffect(() => {
    metrics.getMetrics({}).then((data: Metric[]) => {
      const initialFields = data.map((metric) => ({
        metric_id: metric.metric_id,
        metric_number: metric.metric_number,
        metric_subnumber: metric.metric_subnumber,
        metric_description: metric.description,
        isSelected: false,
      }));
      replace(initialFields);
    });
  }, [replace]);

  // Автоматически отмечаем галочками метрики для выбранного эксперта
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'expert') {
        const selectedExpertId = value.expert;
        const assignment = existingAssignments.find(
          (a) => a.employee_id === selectedExpertId
        );
        const assignedMetricIds = assignment ? assignment.metrics_id : [];
        const updatedFields = fields.map((f) => ({
          ...f,
          isSelected: assignedMetricIds.includes(f.metric_id),
        }));
        replace(updatedFields);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, fields, existingAssignments, replace]);

  // Сразу вызываем watch('metrics') – компонент будет перерендериваться при любом изменении isSelected
  const watchedMetrics = form.watch('metrics');

  // Вычисляем список выбранных метрик прямо перед рендером
  const selectedMetricNumbers = watchedMetrics
    .filter((m) => m.isSelected)
    .map((f) => {
      const sub = f.metric_subnumber ?? '';
      return `${f.metric_number}${sub}`;
    });

  const onSubmit = async (data: AssignExpertsFormValues) => {
    if (!data.expert) {
      alert('Пожалуйста, выберите эксперта');
      return;
    }
    const selectedMetrics = data.metrics.filter((m) => m.isSelected);

    const payload = {
      employee_id: data.expert,
      metrics_id: selectedMetrics.map((m) => m.metric_id),
      quarter: data.quarter,
      date_start: new Date(),
      date_end: new Date(),
      year: data.year,
    };

    try {
      await employeesToMetrics.createEmployeesToMetrics(payload);
      alert('Сохранено успешно');
      onSuccess();
    } catch (error) {
      console.error('Ошибка при создании связи:', error);
    }
  };

  // Функция для скачивания Excel-файла
  const downloadTable = async () => {
    try {
      const response = await apiClient.get('/table_maker/experts', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'experts.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Ошибка при скачивании таблицы:', error);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col gap-4">
            {/* Поисковое поле */}
            <FormItem>
              <FormLabel>Поиск эксперта по ФИО</FormLabel>
              <FormControl>
                <Input
                  placeholder="Введите фамилию, имя или отчество"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </FormControl>
            </FormItem>

            {/* Селект для выбора эксперта (отфильтрованный и отсортированный) */}
            <FormField
              control={form.control}
              name="expert"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Эксперт</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === '') {
                        field.onChange(undefined);
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
                    value={field.value?.toString() ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выбрать эксперта" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredEmployees.map((emp) => (
                        <SelectItem
                          key={emp.employee_id}
                          value={emp.employee_id.toString()}
                        >
                          {`${emp.last_name} ${emp.first_name} ${emp.surname}`}
                        </SelectItem>
                      ))}
                      {filteredEmployees.length === 0 && (
                        <SelectItem disabled value="not-found">
                          <span className="text-gray-500">Ничего не найдено</span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-row gap-10">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Год</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Введите год"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quarter"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Квартал</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выбрать квартал" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4].map((q) => (
                        <SelectItem key={q} value={q.toString()}>
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormLabel>Показатели</FormLabel>
          <div className="h-64 overflow-y-auto border p-4 rounded-md">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-4 mb-4">
                <FormField
                  control={form.control}
                  name={`metrics.${index}.isSelected`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const conflict = existingAssignments.find(
                                (a) =>
                                  a.metrics_id.includes(fields[index].metric_id) &&
                                  a.employee_id !== form.getValues('expert')
                              );
                              if (conflict) {
                                const conflictingEmployee = employeesList.find(
                                  (e) => e.employee_id === conflict.employee_id
                                );
                                alert(
                                  `Метрика ${fields[index].metric_number}${fields[index].metric_subnumber} уже закреплена за экспертом ${conflictingEmployee?.last_name} ${conflictingEmployee?.first_name} ${conflictingEmployee?.surname}`
                                );
                              }
                            }
                            field.onChange(checked);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <span>
                  {field.metric_number}
                  {field.metric_subnumber} – {field.metric_description}
                </span>
              </div>
            ))}
          </div>

          <div>
            <FormLabel>Выбранные показатели:</FormLabel>
            <p>{selectedMetricNumbers.length > 0 ? selectedMetricNumbers.join(', ') : '—'}</p>
          </div>

          <div className="w-full">
            <Button type="submit" className="w-full">
              Сохранить
            </Button>
          </div>
          <div className="w-full">
            <Button type="button" onClick={downloadTable} className="w-full">
                Скачать документ
            </Button>
          </div>
        </form>
      </Form>


    </div>
  );
};
