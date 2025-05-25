import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Calendar,
  PersonStanding,
  Inbox,
  Search,
  BriefcaseBusiness,
  BarChart,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [

  { title: 'Назначение экспертов',             url: '/assign-experts',     icon: Inbox },
  { title: 'Выставление показателей',         url: '/',                  icon: BriefcaseBusiness },
  { title: 'Просмотр показателей',             url: '/metrics',            icon: BarChart },
  { title: 'Сотрудники',                       url: '/employees',          icon: Users },
  { title: 'Показатели сотрудников',           url: '/employeesScores',    icon: Search },
  { title: 'Сроки выставления \n показателей',    url: '/employee-periods',   icon: Calendar },
  { title: 'Заведующие кафедрами',             url: '/employee-departments', icon: PersonStanding },
];

export const AppSidebar = () => {
  const { pathname } = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2">
            Автоматизированная система оценки деятельности работников
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(isActive && 'bg-blue-100 rounded-xl')}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className="flex items-center gap-2 p-2"
                      >
                        <item.icon
                          className={cn(
                            'shrink-0',
                            isActive ? 'text-blue-600' : 'text-gray-600'
                          )}
                        />
                        <span
                          className={cn(
                            isActive ? 'font-semibold text-blue-800' : 'text-gray-800'
                          )}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
