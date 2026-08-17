import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Bookmark, FileText, Settings, User, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ProfileLayout = () => {
  const navItems = [
    { name: '概览', path: '/profile', icon: LayoutDashboard, exact: true },
    { name: '我的推荐', path: '/profile/recommendations', icon: History },
    { name: '收藏模型', path: '/profile/favorites', icon: Bookmark },
    { name: '推荐报告', path: '/profile/reports', icon: FileText },
    { name: '工作偏好', path: '/profile/preferences', icon: Settings },
    { divider: true },
    { name: '个人资料', path: '/profile/edit', icon: User },
    { name: '账户安全', path: '/profile/security', icon: ShieldCheck },
  ];

  const location = useLocation();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      {/* Sidebar */}
      <aside className="w-full shrink-0 lg:w-56">
        <nav className="flex flex-col gap-1">
          {navItems.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="my-2 h-px bg-slate-200" />;
            }
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.name}
                to={item.path!}
                end={item.exact}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {item.icon && <item.icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />}
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};
