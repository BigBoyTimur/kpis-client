import { useGetDepartmentHeads } from '@/hooks/useGetDepartmentHeads';
import { useGetDepartments } from '@/hooks/useGetDepartments';

export const EmployeesToDepartments = () => {
  const { 
    data: departmentHeads = [], 
    isLoading, 
    isError 
  } = useGetDepartmentHeads();
  
  const { data: departments = [] } = useGetDepartments();

  if (isLoading) {
    return <div className="p-4">Loading data...</div>;
  }
  if (isError) {
    return <div className="p-4 text-red-500">Error loading data</div>;
  }

  // Prepare table data by mapping departments to their monthly heads
  const tableData = departments.map(department => {
    const headsForDepartment = departmentHeads.filter(
      (head) => head.department === department.nameOfDepartment
    );
    
    const monthData: Record<number, {name: string; position: string}> = {};
    
    // Populate monthData for each month
    for (let month = 1; month <= 12; month++) {
      const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      const monthName = monthNames[month - 1];
      
      const head = headsForDepartment.find(h => h.month.startsWith(monthName));
      
      monthData[month] = head 
        ? {
            name: head.head_name,
            position: head.position
          } 
        : { name: '-', position: '-' };
    }
    
    return {
      department,
      monthData
    };
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Заведующие кафедрами</h1>
      
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Кафедра
              </th>
              {['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'].map((monthName) => (
                <th 
                  key={monthName}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {monthName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map(({department, monthData}) => (
              <tr key={department.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  {department.nameOfDepartment}
                </td>
                
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(monthNumber => (
                  <td key={monthNumber} className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {monthData[monthNumber].name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {monthData[monthNumber].position}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};