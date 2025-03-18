import { useEffect, useState, useMemo } from 'react';
import { metrics } from '../api/endpoints/metrics';
import { facultyAndDepartment } from '../api/endpoints/facultyAndDepartment';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Department, Metric } from '@/types';

import './app.css';

type TableData = {
  metrics: Metric[];
  departments: Department[];
};

function App() {
    // const [ tableData, setTableData ] = useState<TableData>({
    //     metrics: [],
    //     departments: [],
    // });

    // const [ checkedStates, setCheckedStates ] = useState<{ [key: string]: boolean }>({});

    // useEffect(() => {
    //     metrics.getMetrics({}).then((data) => {
    //         setTableData((prev) => ({ ...prev, metrics: data }));
    //     });

    //     facultyAndDepartment.getDepartments({}).then((data) => {
    //         setTableData((prev) => ({ ...prev, departments: data }));
    //     });
    // }, []);

    // const handleCheckboxChange = (metricId: number, departmentId: number) => {
    //     const key = `${metricId}-${departmentId}`;
    //     setCheckedStates((prev) => ({
    //         ...prev,
    //         [key]: !prev[key],
    //     }));
    // };

    // return (
    //     <div className="table-container">
    //         <h1 className='mb-3 text-2xl'>КПЭ Заведущих кафедрами</h1>
    //         <table>
    //             <thead>
    //                 <tr>
    //                     <th>Метрика / Отдел</th>
    //                     {tableData.departments.map((department) => (
    //                         <th key={department.id}>{department.nameOfDepartment}</th>
    //                     ))}
    //                 </tr>
    //             </thead>
    //             <tbody>
    //                 {tableData.metrics.map((metric) => (
    //                     <tr key={metric.metric_id}>
    //                         <td>{metric.description}</td>
    //                         {tableData.departments.map((department) => {
    //                             const key = `${metric.metric_id}-${department.id}`;
    //                             return (
    //                                 <td key={key}>
    //                                     <input
    //                                         type="checkbox"
    //                                         checked={!!checkedStates[key]}
    //                                         onChange={() => handleCheckboxChange(metric.metric_id, department.id)}
    //                                     />
    //                                 </td>
    //                             );
    //                         })}
    //                     </tr>
    //                 ))}
    //             </tbody>
    //         </table>
    //     </div>
    // );
}

export default App;