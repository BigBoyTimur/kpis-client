import apiClient from '../axios';
import { EmployeesToMetrics } from '@/types';

export const employeesToMetrics = {
    getEmployeesToMetrics: async ({ skip = 0, limit = 100 }) => {
        const response = await apiClient.get<EmployeesToMetrics[]>('/employees-to-metrics/', {
            params: {
                skip,
                limit,
            },
        });
        return response;
    },

    createEmployeesToMetrics: async (data: EmployeesToMetrics) => {
        console.log(data);
        const response = await apiClient.post<EmployeesToMetrics>('/employees-to-metrics/', data);
        return response.data;
    },
};