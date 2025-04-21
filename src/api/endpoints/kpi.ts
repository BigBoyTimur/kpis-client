import apiClient from '../axios';

type GetTableProps = {
    employeeId: number;
    year?: number;
    quarter?: number;
}

export const kpi = {
    getTable: async ({ employeeId, year, quarter }: GetTableProps) => {
        const response = await apiClient.get('/kpi/table', {
            params: {
                employee_id: employeeId,
                year,
                quarter
            }
        });
        return response.data;
    }
};