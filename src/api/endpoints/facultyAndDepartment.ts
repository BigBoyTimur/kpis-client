import { Department } from '@/types';
import apiClient from '../axios';

type GetMetricsProps = {
    skip?: number;
    limit?: number;
};

export const facultyAndDepartment = {
    getDepartments: async ({ skip = 0, limit = 100 }: GetMetricsProps): Promise<Department[]> => {
        const response = await apiClient.get('/faculty_and_department/departments', {
            params: {
                skip,
                limit
            }
        });
        return (response.data as Record<string, unknown>[]).map(department => ({
            nameOfDepartment: department.name_of_department as string,
            id: department.id as number,
            affiliation: department.affiliation as number
        }));
    }
};