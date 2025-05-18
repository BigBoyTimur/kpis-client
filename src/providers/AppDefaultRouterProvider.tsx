import App from '@/pages/App';
import { AppLayout } from '@/components/AppLayout';
import { SummaryTable } from '@/pages/SummaryTable';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AssignExperts } from '@/pages/AssignExperts';
import { SetMetrics } from '@/pages/SetMetrics';
import Auth from '@/pages/auth';

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
