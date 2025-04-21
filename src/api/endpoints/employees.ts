import { Employee } from '@/types';
import apiClient from '../axios';

export type GetEmployeesProps = {
    skip?: number;
    limit?: number;
};

export const employees = {
    getEmployees: async ({ skip = 0, limit = 100 }: GetEmployeesProps): Promise<Employee[]> => {
        const response = await apiClient.get('/employees', {
            params: {
                skip,
                limit
            }
        });
        return response.data;
    }
};