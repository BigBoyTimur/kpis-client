// Пример интеграции нового POST /table в компонент SetMetrics
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '@/api/axios'; // axios с baseURL = http://127.0.0.1:8000
import { useGetEmployees } from '@/hooks/useGetEmployees';
import { useGetDepartments } from '@/hooks/useGetDepartments';
import { useGetKpiTable } from '@/hooks/useGetKpiTable';
import { useGetMetrics } from '@/hooks/useGetMetrics';
import { Department, Metric } from '@/types';
import { Button } from '@/components/ui/button';
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
  score: number;
};

export const SetMetrics: React.FC = () => {
  const { data: employeesRaw } = useGetEmployees();
  const { data: departments } = useGetDepartments();
  const { data: predefinedMetrics } = useGetMetrics();

// Отсортированный по алфавиту массив сотрудников
const employees = useMemo(() => {
    return (employeesRaw ?? []).slice().sort((a, b) => {
      const nameA = `${a.last_name} ${a.first_name} ${a.surname}`.toLowerCase();
      const nameB = `${b.last_name} ${b.first_name} ${b.surname}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [employeesRaw]);
  
  // Автовыбор первого сотрудника после того как список загрузился и отсортировался
  const [employee, setEmployee] = useState<number>();
  useEffect(() => {
    if (employees.length > 0 && employee == null) {
      setEmployee(employees[0].employee_id);
    }
  }, [employees, employee]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [quarter, setQuarter] = useState<number>(
    Math.floor(new Date().getMonth() / 3) + 1
  );

  const { data: kpiTableResponseData } = useGetKpiTable({
    employeeId: employee ?? 1,
    year,
    quarter,
  });
  const kpiTableData = useMemo(
    () => (kpiTableResponseData?.data as TableData[]) ?? [],
    [kpiTableResponseData]
  );

  // Собираем уникальные metric IDs из kpiTableData
  const metricIds = useMemo(() => {
    const setIds = new Set<number>();
    kpiTableData.forEach((item) => setIds.add(item.metric.id));
    return Array.from(setIds);
  }, [kpiTableData]);

  const metrics = useMemo(() => {
    if (!predefinedMetrics) return [];
  
    // Получаем массив объектов Metric, соответствующих metricIds
    const arr: Metric[] = metricIds
      .map((id) => predefinedMetrics.find((m) => m.metric_id === id))
      .filter((m): m is Metric => m !== undefined);
  
    // Сортируем по metric_number (как число), затем по metric_subnumber (буквенно)
    return arr.sort((a, b) => {
      // Преобразуем metric_number к числу
      const numA = Number(a.metric_number);
      const numB = Number(b.metric_number);
      if (numA !== numB) {
        return numA - numB;
      }
      // Если номера равны и оба имеют subnumber, сравниваем их
      const subA = (a.metric_subnumber ?? '').toString();
      const subB = (b.metric_subnumber ?? '').toString();
      return subA.localeCompare(subB, undefined, { numeric: true });
    });
  }, [metricIds, predefinedMetrics]);
  
  // Карта ключ "departmentId-metricId" → score
  const [scoreMap, setScoreMap] = useState<Map<string, number>>(new Map());
  // Копия карты для сброса (если нужно)
  const [initialScoreMap, setInitialScoreMap] = useState<Map<string, number>>(new Map());

  // Множество изменённых ячеек
  const [modifiedCells, setModifiedCells] = useState<Set<string>>(new Set());

  // Разрешаем/запрещаем редактирование
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const map = new Map<string, number>();
    kpiTableData.forEach((item) => {
      const key = `${item.department.id}-${item.metric.id}`;
      map.set(key, item.score);
    });
    setScoreMap(map);
    setInitialScoreMap(new Map(map));
    setModifiedCells(new Set());
  }, [kpiTableData]);

  const onEmployeeChange = (value: string) => {
    setEmployee(+value);
    setIsEditing(false);
    setModifiedCells(new Set());
  };

  const handleScoreChange = (
    deptId: number,
    metricId: number,
    value: number
  ) => {
    const key = `${deptId}-${metricId}`;
    setScoreMap((prev) => {
      const updated = new Map(prev);
      updated.set(key, value);
      return updated;
    });
    setModifiedCells((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.add(key);
      return updatedSet;
    });
  };

  const handleSave = async () => {
    if (!employee) return alert('Выберите сотрудника');
    if (!departments) return;

    // Для каждой изменённой ячейки отправляем POST /table
    const promises: Promise<any>[] = [];
    modifiedCells.forEach((key) => {
      const [departmentIdStr, metricIdStr] = key.split('-');
      const departmentId = Number(departmentIdStr);
      const metricId = Number(metricIdStr);
      const score = scoreMap.get(key)!;

      // Собираем объект body по контракту бэкенда
      const body = {
        department: { id: departmentId },
        metric: { id: metricId },
        score,
      };

      // Query параметры: year, quarter, employee_id
      const url = `/kpi/table?year=${year}&quarter=${quarter}&employee_id=${employee}`;

      promises.push(
        apiClient.post(url, body).catch((err) => {
          console.error(`Error saving cell ${key}:`, err.response?.data || err.message);
          // Можно собрать ошибки и показать после Promise.all
        })
      );
    });

    try {
      await Promise.all(promises);
      alert('Все изменения сохранены');
      // После сохранения обновляем исходную карту
      setInitialScoreMap(new Map(scoreMap));
      setModifiedCells(new Set());
    } catch {
      alert('Некоторые изменения не удалось сохранить. Проверьте консоль.');
    }
  };

  const handleReset = () => {
    setScoreMap(new Map(initialScoreMap));
    setModifiedCells(new Set());
  };

  return (
    <div className="flex flex-col gap-5 items-center p-6">
      <h1 className="text-2xl font-medium">Эксперт</h1>

      {/* Выбор сотрудника, года и квартала */}
      <div className="flex gap-4">
        <Select
          defaultValue={employee?.toString()}
          onValueChange={(value) => onEmployeeChange(value)}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Выберите сотрудника" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Сотрудники</SelectLabel>
              {employees?.map((emp) => (
                <SelectItem key={emp.employee_id} value={`${emp.employee_id}`}>
                  {`${emp.last_name} ${emp.first_name} ${emp.surname}`}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <label>
          Год:&nbsp;
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1"
          />
        </label>

        <label>
          Квартал:&nbsp;
          <select
            value={quarter}
            onChange={(e) => setQuarter(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Кнопки */}
      <div className="flex gap-4 w-[300px]">
        <Button
          variant="outline"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? 'Запретить редактирование' : 'Разрешить редактирование'}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!isEditing || modifiedCells.size === 0}
        >
          Сбросить
        </Button>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto max-h-[calc(70vh-50px)] max-w-[calc(100vw-20rem)]">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="sticky top-0 left-0 border border-gray-300 p-2 z-10 bg-gray-300">
                Кафедра \ №
              </th>
              {metrics.map((metric) => (
                <th
                  key={metric.metric_id}
                  className="sticky top-0 bg-gray-50 border border-gray-300 p-2 text-center"
                >
                  <span
                    className="underline decoration-dotted cursor-help"
                    title={metric.description}
                  >
                    {metric.metric_number}
                    {metric.metric_subnumber ?? ''}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {departments?.map((department) => (
              <tr key={department.id}>
                <td className="sticky left-0 bg-gray-50 border border-gray-300 p-2 font-medium">
                  {department.nameOfDepartment}
                </td>
                {metrics.map((metric) => {
                  const key = `${department.id}-${metric.metric_id}`;
                  const value = scoreMap.get(key) ?? '';
                  const isModified = modifiedCells.has(key);
                  return (
                    <td
                      key={metric.metric_id}
                      className={`border border-gray-300 p-2 text-center ${
                        isModified ? 'bg-yellow-100' : ''
                      }`}
                    >
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                          const num =
                            e.target.value === '' ? 0 : Number(e.target.value);
                          handleScoreChange(
                            department.id,
                            metric.metric_id,
                            num
                          );
                        }}
                        disabled={!isEditing}
                        className={`w-16 text-center border rounded ${
                          isModified ? 'border-yellow-500' : 'border-gray-300'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Кнопка «Сохранить изменения» */}
      <Button
        className="mt-4 w-60 text-lg"
        onClick={handleSave}
        disabled={isEditing || modifiedCells.size === 0}
      >
        Сохранить изменения
      </Button>
    </div>
  );
};
