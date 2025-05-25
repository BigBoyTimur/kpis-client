// src/pages/EmployeesPage.tsx
import React from "react";
import { useGetEmployees } from "@/hooks/useGetEmployees";

export const EmployeesPage: React.FC = () => {
  const { data: employees, isLoading, error } = useGetEmployees({ skip: 0, limit: 100 });

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки сотрудников: {error.message}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Список экспертов</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ФИО</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>

            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees?.map((emp) => (
              <tr key={emp.employee_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.last_name ?? "-"} {emp.first_name ?? "-"} {emp.surname ?? "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.mail_box ?? "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.number_phone ?? "-"}</td>           
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesPage;