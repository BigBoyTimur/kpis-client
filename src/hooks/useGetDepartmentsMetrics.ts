// hooks/useGetDepartmentsMetrics.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/axios';
import { Metric } from '@/types';

export interface DepartmentMetric {
  id: number;
  department_id: number;
  value: number;
  year: number;
  quarter: number;
  period_date: string;
  metrics_id: number;
  author_id: number;
  status: number;
}

export const useGetDepartmentsMetrics = () => {
  return useQuery({
    queryKey: ['departments-metrics'],
    queryFn: () => apiClient.get<DepartmentMetric[]>('/departments-metrics').then(res => res.data),
    retry: 1,
  });
};