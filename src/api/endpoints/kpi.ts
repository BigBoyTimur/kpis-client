import apiClient from '../axios';

type GetTableProps = {
    employeeId: number;
    year?: number;
    quarter?: number;
}

type SaveTableProps = {
    departmentId: number;
    metricId: number;
    score: number;
}[]

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
    },
    saveTable: async (data: SaveTableProps) => {
        console.log(data);
        const response = await apiClient.post<SaveTableProps>('/kpi/table', data);
        return response.data;
    }
};