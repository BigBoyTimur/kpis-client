import { useQuery } from '@tanstack/react-query';
import { kpi } from '@/api/endpoints/kpi';

type UseGetKpiTableOptions = {
  employeeId: number;
  year?: number;
  quarter?: number;
  enabled?: boolean;
};

export const useGetKpiTable = ({
    employeeId,
    year,
    quarter,
}: UseGetKpiTableOptions) => {
    return useQuery({
        queryKey: [ 'kpiTable', employeeId, year, quarter ],
        queryFn: () => kpi.getTable({ employeeId, year, quarter }),
        retry: 1,
    });
};