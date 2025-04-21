import { useQuery } from '@tanstack/react-query';
import { facultyAndDepartment, GetDepartmentsProps } from '@/api/endpoints/facultyAndDepartment';


export const useGetDepartments= ({
    skip,
    limit
}: GetDepartmentsProps = {}) => {
    return useQuery({
        queryKey: [ 'departments', skip, limit ],
        queryFn: () => facultyAndDepartment.getDepartments({ skip, limit }),
        retry: 1,
    });
};