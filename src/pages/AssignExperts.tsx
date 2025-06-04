import React, { useEffect, useState } from 'react';
import { AssignExpertsForm } from '@/components/AssignExpertsForm';
import { EmployeesToMetricsList } from '@/components/EmployeesToMetricsList';
import { EmployeesToMetrics, Employee, Metric } from '@/types';
import { employeesToMetrics } from '@/api/endpoints/employeesToMetrics';
import { employees } from '@/api/endpoints/employees';
import { metrics } from '@/api/endpoints/metrics';

export const AssignExperts: React.FC = () => {
  const [employeesToMetricsData, setEmployeesToMetricsData] = useState<EmployeesToMetrics[]>([]);
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [metricsData, setMetricsData] = useState<Metric[]>([]);

  // Функция для обновления списка связей
  const updateEmployeesToMetrics = async () => {
    const response = await employeesToMetrics.getEmployeesToMetrics({});
    setEmployeesToMetricsData(response.data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await updateEmployeesToMetrics();
        const employeesResponse = await employees.getEmployees({});
        setEmployeesData(employeesResponse);
        const metricsResponse = await metrics.getMetrics({});
        setMetricsData(metricsResponse);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchData();
  }, []);

  // Функция для объединения данных
  const getEnrichedData = () => {
    return employeesToMetricsData.map((item) => {
      // Находим сотрудника по ID
      const employee = employeesData.find((emp) => emp.employee_id === item.employee_id);

      // Находим метрики по их ID
      const enrichedMetrics = item.metrics_id.map((metricId) => {
        const metric = metricsData.find((m) => m.metric_id === metricId);
        return {
          metric_number: metric?.metric_number || 0, // Используем 0 как значение по умолчанию
          metric_subnumber: metric?.metric_subnumber as string || '',
          description: metric?.description || 'Описание отсутствует',
        };
      });

      return {
        ...item,
        employeeName: employee
          ? `${employee.last_name} ${employee.first_name} ${employee.surname}`
          : 'Неизвестный сотрудник',
        metrics: enrichedMetrics,
      };
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Назначение экспертов</h1>
      <AssignExpertsForm
        onSuccess={updateEmployeesToMetrics}
        existingAssignments={employeesToMetricsData}
        employeesList={employeesData}
      />
      <EmployeesToMetricsList data={getEnrichedData()} />
    </div>
  );
};
