import { Link } from 'react-router';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';



const items = [
    // {
    //     title: 'КПЭ кафедрамм',
    //     url: '/',
    //     icon: Home,
    //     isActive: window.location.pathname === '/'
    // },
    {
        title: 'Назначение экспертов',
        url: '/assign-experts',
        icon: Home,
        isActive: window.location.pathname === '/assign-experts'
    },

    {
        title: 'Выставление метрик',
        url: '/',
        icon: Home,
        isActive: window.location.pathname === '/'
    },
];

export const AppSidebar = () => {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className='mb-2'>Автоматизированная система оценки деятельности работников </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title} className={ cn(item.isActive && 'bg-blue-100 rounded-xl') }>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>

    );
};
