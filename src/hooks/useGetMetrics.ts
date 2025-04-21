import { useQuery } from '@tanstack/react-query';
import { GetMetricsProps, metrics } from '@/api/endpoints/metrics';


export const useGetMetrics = ({
    skip,
    limit
}: GetMetricsProps = {}) => {
    return useQuery({
        queryKey: [ 'metrics', skip, limit ],
        queryFn: () => metrics.getMetrics({ skip, limit }),
        retry: 1,
    });
};