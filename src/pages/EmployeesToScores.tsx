import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '@/api/axios';
import { Employee, Metric } from '@/types';
import { useGetEmployees } from '@/hooks/useGetEmployees';
import { useGetMetrics } from '@/hooks/useGetMetrics';

type MetricScore = {
  metrics_id: number;
  score: number;
};

type EmployeeMetrics = {
  employee_id: number;
  year: number;
  quarter: number;
  metrics: MetricScore[];
};

export const EmployeesMetricsTable: React.FC = () => {
  const { data: employees } = useGetEmployees();
  const { data: metrics } = useGetMetrics();

  const [employeeMetrics, setEmployeeMetrics] = useState<EmployeeMetrics[]>([]);
  const [error, setError] = useState<string>();
  const [yearFilter, setYearFilter] = useState<number>(2025);
  const [quarterFilter, setQuarterFilter] = useState<number>(Math.floor(new Date().getMonth()/3) + 1);

  useEffect(() => {
    apiClient
      .get<EmployeeMetrics[]>('/employees_metrics/all')
      .then(res => setEmployeeMetrics(res.data))
      .catch(err => {
        console.error(err);
        setError('Не удалось загрузить метрики сотрудников');
      });
  }, []);

  const filtered = useMemo(() => 
    employeeMetrics.filter(
      em => em.year === yearFilter && em.quarter === quarterFilter
    )
  , [employeeMetrics, yearFilter, quarterFilter]);

  const scoreMap = useMemo(() => {
    const map = new Map<number, Map<number, number>>();
    for (const em of filtered) {
      const inner = new Map<number, number>();
      for (const { metrics_id, score } of em.metrics) {
        inner.set(metrics_id, score);
      }
      map.set(em.employee_id, inner);
    }
    return map;
  }, [filtered]);

  if (error) return <div className="text-red-600 p-6">{error}</div>;

  return (
    <div className="flex flex-col gap-6 w-full h-full px-8 py-6">
      <h1 className="text-2xl font-semibold">Таблица метрик по сотрудникам</h1>

      <div className="flex gap-4 mb-4">
        <label>
          Год:&nbsp;
          <input
            type="number"
            value={yearFilter}
            onChange={e => setYearFilter(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1"
          />
        </label>
        <label>
          Квартал:&nbsp;
          <select
            value={quarterFilter}
            onChange={e => setQuarterFilter(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[1,2,3,4].map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex-1 overflow-auto w-full">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-20 bg-gray-200 border border-gray-300 p-2">
                Сотрудник \ Показатель
              </th>
              {metrics?.map(metric => (
                <th
                  key={metric.metric_id}
                  className="sticky top-0 z-10 bg-gray-100 border border-gray-300 p-2 text-center"
                >
                  <span
                    title={`${metric.metric_number ?? ''}${metric.metric_subnumber ?? ''} ${metric.description}`}
                    className="underline decoration-dotted cursor-help"
                  >
                    {metric.metric_number}{metric.metric_subnumber}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees?.map(emp => (
              <tr key={emp.employee_id} className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white border border-gray-300 p-2 font-medium">
                  {`${emp.last_name} ${emp.first_name} ${emp.surname}`}
                </td>
                {metrics?.map(metric => {
                  const score = scoreMap.get(emp.employee_id)?.get(metric.metric_id) ?? '';
                  return (
                    <td
                      key={metric.metric_id}
                      className="border border-gray-300 p-2 text-center"
                    >
                      {score}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
