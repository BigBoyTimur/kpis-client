import { AppLayout } from '@/components/AppLayout';
import { SummaryTable } from '@/pages/SummaryTable';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AssignExperts } from '@/pages/AssignExperts';
import { MetricsPage } from "@/pages/MetricsPage";
import { SetMetrics } from '@/pages/SetMetrics';
import { EmployeesPage } from '@/pages/EmployeesPage';
import Auth from '@/pages/Auth';
import { EmployeesMetricsTable } from '@/pages/EmployeesToScores';
import { EmployeePeriods } from '@/pages/EmployeePeriods';
import { EmployeesToDepartments } from '@/pages/EmployeesToDepartments';
import DepartmentsMetricsPage from '@/pages/DepartmentsMetricsPage'; // Без фигурных скобок

const router = createBrowserRouter([
    {
        path: '/',
        Component: AppLayout,
        children: [
            {
                index: true,
                Component: SetMetrics
            },
            {
                path: 'summary-table',
                Component: SummaryTable
            },
            {
                path: 'assign-experts',
                Component: AssignExperts
            },
            {
                path: 'metrics',
                Component: MetricsPage
            },
            {
                path: 'employees',
                Component: EmployeesPage 
            },
            {
                path: 'employeesScores',
                Component: EmployeesMetricsTable 
            },
            {
                path: 'employee-periods',         
                Component: EmployeePeriods,       
            },
            {
                path: 'employee-departments',         
                Component: EmployeesToDepartments,   
            },
            {
                path: 'departments-metrics',         
                Component: DepartmentsMetricsPage  
            }
        ]
    },
    {
        path: 'auth',
        Component: Auth
    }
]);

export const AppDefaultRouterProvider = () => <RouterProvider router={router} />;