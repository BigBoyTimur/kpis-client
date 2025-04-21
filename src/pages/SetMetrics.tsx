import { useGetKpiTable } from '@/hooks/useGetKpiTable';
import { Department, Metric } from '@/types';
import { useGetDepartments } from '@/hooks/useGetDepartments';
import { useGetMetrics } from '@/hooks/useGetMetrics';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGetEmployees } from '@/hooks/useGetEmployees';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type TableData = {
    department: Department;
    metric: Omit<Metric, 'metric_id'> & { id: number };
    score: number
}

export const SetMetrics = () => {
    const { data: employees } = useGetEmployees();

    const [ employee, setEmployee ] = useState<number>();

    const { data: kpiTableResponseData } = useGetKpiTable({
        employeeId: employee ?? 1,
    });

    const kpiTableData = useMemo(() => kpiTableResponseData?.data as TableData[] ?? [], [ kpiTableResponseData ]);

    const { data: departments } = useGetDepartments();

    const { data: metrics } = useGetMetrics();

    const dataMap = useMemo(() => {
        const map = new Map<string, number>();
        kpiTableData?.forEach(item => {
            const key = `${item.department.id}-${item.metric.id}`;
            map.set(key, item.score);
        });
        return map;
    }, [ kpiTableData ]);

    const onEmployeeChange = (value: string) => setEmployee(+value);

    return (
        <div className='flex flex-col gap-5 items-center'>
            <Select defaultValue='1' onValueChange={ value => onEmployeeChange(value) }>
                <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Выберите сотрудника" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Сотрудники</SelectLabel>
                        {employees?.map((employee => <SelectItem value={`${employee.employee_id}`}>{employee.last_name} {employee.first_name} {employee.surname}</SelectItem>))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <div className="overflow-x-auto max-h-[calc(100vh-50px)] max-w-[calc(100vw-20rem)]">
                <table className="border-collapse border border-gray-200">
                    <thead className="sticky top-0">
                        <tr>
                            <th className="border border-gray-300 p-2">Кафедра \ Метрика</th>
                            {metrics?.map(metric => (
                                <th
                                    key={metric.metric_id}
                                    className="border border-gray-300 p-2 sticky bg-gray-50 min-w-70 whitespace-normal"
                                >
                                    {`${ metric.metric_number}${metric.metric_subnumber ?? ''} ${metric.description}`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {departments?.map(department => (
                            <tr key={department.id}>
                                <td className="border border-gray-300 p-2 font-medium sticky left-0 bg-gray-50">
                                    {department.nameOfDepartment}
                                </td>
                                {metrics?.map(metric => {
                                    const key = `${department.id}-${metric.metric_id}`;
                                    const score = dataMap.get(key);
                                    return (
                                        <td
                                            key={metric.metric_id}
                                            className="border border-gray-300 p-2 text-center"
                                        >
                                            {score ?? 'нет значения'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Button className='p-7 w-100 text-lg'>Сохранить изменения</Button>
        </div>
    );
};
