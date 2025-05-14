import { useGetKpiTable } from '@/hooks/useGetKpiTable';
import { Department, Metric } from '@/types';
import { useGetDepartments } from '@/hooks/useGetDepartments';
import { useGetMetrics } from '@/hooks/useGetMetrics';
import { kpi } from '@/api/endpoints/kpi'

import { useEffect, useMemo, useState } from 'react';
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

export type TableData = {
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

    const { data: metrics } = {
        data: kpiTableData.map((item) => ({
            ...item.metric,
            metric_id: item.metric.id,
        })),
    };

    const dataMap = useMemo(() => {
        const map = new Map<string, number>();
        kpiTableData?.forEach(item => {
            const key = `${item.department.id}-${item.metric.id}`;
            map.set(key, item.score);
        });
        return map;
    }, [ kpiTableData ]);

    const onEmployeeChange = (value: string) => setEmployee(+value);

    const [scoreMap, setScoreMap] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        const map = new Map<string, number>();
        kpiTableData.forEach(item => {
            const key = `${item.department.id}-${item.metric.id}`;
            map.set(key, item.score);
        });
        setScoreMap(map);
    }, [kpiTableData]);    

    return (
        <div className='flex flex-col gap-5 items-center'>
            <h1 className='font-medium'>Эксперт</h1>
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
                <table className="border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="sticky top-0 left-0 border border-gray-300 p-1 z-100 bg-gray-300">Кафедра \ Показатель</th>
                            {metrics?.map(metric => (
                                <th
                                    key={metric.metric_id}
                                    className="p-2 sticky top-0 bg-gray-50 min-w-70 whitespace-normal border border-gray-300"
                                >
                                    {`${ metric.metric_number ?? ''}${metric.metric_subnumber ?? ''} ${metric.description}`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {departments?.map(department => (
                            <tr key={department.id}>
                                <td className="border border-gray-300 p-2 font-medium sticky left-0 bg-gray-50 ">
                                    {department.nameOfDepartment}
                                </td>
                                {metrics?.map(metric => {
                                    const key = `${department.id}-${metric.metric_id}`;
                                    return (
                                        <td key={metric.metric_id} className="border border-gray-300 p-2 text-center">
                                            <input
                                                type="number"
                                                value={scoreMap.get(key) ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                                                    setScoreMap(prev => {
                                                        const updated = new Map(prev);
                                                        updated.set(key, value);
                                                        return updated;
                                                    });
                                                }}
                                                className="w-16 text-center border border-gray-300 rounded"
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Button
                className='p-7 w-100 text-lg'
                onClick={() => {
                    const updatedData = Array.from(scoreMap.entries()).map(([key, score]) => {
                        const [departmentId, metricId] = key.split('-').map(Number);
                        return { departmentId, metricId, score };
                    });
                    console.log(updatedData);
                    kpi.saveTable(updatedData);
                }}
            >
                Сохранить изменения
            </Button>
        </div>
    );
};
