// hooks/useGetDepartmentHeads.ts
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export interface DepartmentHead {
  department: string;
  faculty: string;
  month: string;
  year: number;
  head_name: string;
  position: string;
  working_days: number;
}

export const useGetDepartmentHeads = () => {
  return useQuery<DepartmentHead[]>({
    queryKey: ["departmentHeads"],
    queryFn: async () => {
      const response = await axios.get<DepartmentHead[]>("http://localhost:8000/employees-to-departments/");
      return response.data;
    },
    staleTime: 60 * 1000 * 5, // 5 minutes of caching
  });
};