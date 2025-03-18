import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Outlet } from 'react-router';

export const AppLayout = () => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='px-5 py-3'>
                {/* <SidebarTrigger /> */}
                <Outlet />
            </main>
        </SidebarProvider>
    );
};
