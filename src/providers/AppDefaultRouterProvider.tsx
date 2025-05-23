import App from '@/pages/App';
import { AppLayout } from '@/components/AppLayout';
import { SummaryTable } from '@/pages/SummaryTable';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AssignExperts } from '@/pages/AssignExperts';
import { MetricsPage } from "@/pages/MetricsPage";
import { SetMetrics } from '@/pages/SetMetrics';
import { EmployeesPage } from '@/pages/EmployeesPage';
import Auth from '@/pages/Auth';
import { EmployeesMetricsTable } from '@/pages/EmployeesToScores';
import { EmployeePeriods } from '@/pages/EmployeePeriods';
import { EmployeesToDepartments } from '@/pages/EmployeesToDepartments';

const placeholder = () => <div>placeholder</div>;

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
                Component: EmployeesToDepartments   
            },
            
        ],
        // children: [
        //     {
        //         path: 'shows/:showId',
        //         Component: Show,
        //         loader: ({ request, params }) =>
        //             fetch(`/api/show/${params.id}.json`, {
        //                 signal: request.signal,
        //             }),
        //     },
        // ],
    },
    {
        path: 'auth',
        Component: Auth
    }
]);

export const AppDefaultRouterProvider =  () => (<RouterProvider router={router}/>);
