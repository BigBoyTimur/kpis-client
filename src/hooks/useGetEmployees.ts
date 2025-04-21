import { useQuery } from '@tanstack/react-query';
import { employees, GetEmployeesProps } from '@/api/endpoints/employees';

export const useGetEmployees = ({
    skip,
    limit
}: GetEmployeesProps = {}) => {
    return useQuery({
        queryKey: [ 'employees', skip, employees ],
        queryFn: () => employees.getEmployees({ skip, limit }),
        retry: 1,
    });
};