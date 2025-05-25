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
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import { Employee, Metric } from '@/types';
import { metrics } from '@/api/endpoints/metrics';
import { employees } from '@/api/endpoints/employees';
import { Checkbox } from '@/components/ui/checkbox'; // Импортируем компонент Checkbox
import { employeesToMetrics } from '@/api/endpoints/employeesToMetrics';

type AssignExpertsForm = {
    expert: number; // ID эксперта (employee_id)
    year: number;   // Год
    quarter: number; // Квартал (1-4)
    metrics: {
        metric_id: number; // ID метрики
        metric_number: number; // Номер метрики
        metric_subnumber: string; // Подномер метрики
        metric_description: string;
        isSelected: boolean; // Выбрана ли метрика
    }[];
};

type AssignExpertsFormProps = {
    onSuccess: () => void;
};

export const AssignExpertsForm = ({ onSuccess }: AssignExpertsFormProps) => {
    const form = useForm<AssignExpertsForm>({
        defaultValues: {
            expert: 1,
            year: 2025,
            quarter: 1,
            metrics: [], // Инициализация списка метрик
        },
    });

    const { fields, append } = useFieldArray({
        control: form.control,
        name: 'metrics', // Имя массива метрик
    });

    const onSubmit = async (data: AssignExpertsForm) => {
        const selectedMetrics = data.metrics.filter((metric) => metric.isSelected);
        const payload = {
            employee_id: data.expert,
            metrics_id: selectedMetrics.map((metric) => metric.metric_id),
            quarter: data.quarter,
            date_start: new Date(),
            date_end: new Date(),
            year: data.year,
        };

        try {
            const response = await employeesToMetrics.createEmployeesToMetrics(payload);
            console.log('Связь успешно создана:', response);
            onSuccess(); // Вызываем функцию обновления списка связей
        } catch (error) {
            console.error('Ошибка при создании связи:', error);
        }
    };

    const [ employeesList, setEmployeesList ] = useState<Employee[]>([]);

    useEffect(() => {
        // Загружаем метрики и инициализируем форму
        metrics.getMetrics({}).then((data: Metric[]) => {
            data.forEach((metric) => {
                append({
                    metric_id: metric.metric_id,
                    metric_number: metric.metric_number,
                    metric_subnumber: metric.metric_subnumber,
                    metric_description: metric.description,
                    isSelected: false,
                });
            });
        });

        // Загружаем список сотрудников
        employees.getEmployees({}).then((data: Employee[]) => setEmployeesList(data));
    }, [ append ]);

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Горизонтальное расположение полей */}
                    <div className="flex flex-row gap-10">
                        {/* Поле для выбора эксперта */}
                        <FormField
                            control={form.control}
                            name="expert"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Эксперт</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        defaultValue={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выбрать эксперта" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {employeesList.map((employee) => (
                                                <SelectItem
                                                    key={employee.employee_id}
                                                    value={employee.employee_id.toString()}
                                                >
                                                    {`${employee.last_name} ${employee.first_name} ${employee.surname}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Поле для ввода года */}
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

                        {/* Поле для выбора квартала */}
                        <FormField
                            control={form.control}
                            name="quarter"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Квартал</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        defaultValue={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите квартал" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Список чекбоксов для выбора метрик */}
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
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <span>
                                    {field.metric_number}{field.metric_subnumber} - {field.metric_description}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Кнопка на следующей строке */}
                    <div className="w-full">
                        <Button type="submit" className="w-full">
                            Сохранить
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};