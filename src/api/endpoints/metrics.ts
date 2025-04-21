import { Metric } from '@/types';
import apiClient from '../axios';

export type GetMetricsProps = {
    skip?: number;
    limit?: number;
};

export const metrics = {
    getMetrics: async ({ skip = 0, limit = 100 }: GetMetricsProps): Promise<Metric[]> => {
        const response = await apiClient.get('/metrics', {
            params: {
                skip,
                limit
            }
        });
        return response.data;
    }
};