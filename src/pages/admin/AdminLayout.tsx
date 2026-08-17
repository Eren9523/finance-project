import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  LayoutDashboard, 
  Database, 
  Sparkles, 
  BrainCircuit, 
  Users, 
  Shield, 
  LogOut, 
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  FlaskConical
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navigationGroups = [
  {
    name: '基础',
    items: [
      { name: '控制面板', to: '/admin', icon: LayoutDashboard }
    ]
  },
  {
    name: '模型资产',
    icon: Database,
    items: [
      { name: 'ModelCard管理', to: '/admin/models' },
      { name: 'Taxonomy', to: '/admin/taxonomy' }
    ]
  },
  {
    name: '推荐运营',
    icon: Sparkles,
    items: [
      { name: '推荐记录', to: '/admin/recommendations' },
      { name: '用户反馈', to: '/admin/feedback' },
      { name: '推荐报告', to: '/admin/reports' }
    ]
  },
  {
    name: 'AI服务',
    icon: BrainCircuit,
    items: [
      { name: '服务配置', to: '/admin/ai' },
      { name: '用量与成本', to: '/admin/ai/usage' },
      { name: 'Prompt管理', to: '/admin/prompts' }
    ]
  },
  {
    name: '用户与权限',
    icon: Users,
    items: [
      { name: '用户管理', to: '/admin/users' },
      { name: '角色权限', to: '/admin/roles' }
    ]
  },
  {
    name: '系统治理',
    icon: Shield,
    items: [
      { name: '审计日志', to: '/admin/audit' },
      { name: 'Version Bundle', to: '/admin/versions' },
      { name: '系统状态', to: '/admin/status' },
      { name: '系统设置', to: '/admin/settings' }
    ]
  }
];

const NavGroup: React.FC<{ group: any, setSidebarOpen: any }> = ({ group, setSidebarOpen }) => {
  const { t } = useSettings();
  const location = useLocation();
  const isActiveGroup = group.items.some((item: any) => location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to)));
  const [expanded, setExpanded] = useState(isActiveGroup || group.name === '基础');

  if (group.name === '基础') {
    return (
      <div className="mb-4">
        {group.items.map((item: any) => (
          <NavLink
            key={item.name}
            to={item.to}
            end={item.to === '/admin'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn(
              "group flex items-center px-3 py-2.5 text-sm font-medium rounded-[10px] transition-colors",
              isActive
                ? "bg-[#EEF4FF] dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-300 font-semibold"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-[#2563EB]" : "text-slate-400 group-hover:text-slate-600")} />
                {t(item.name)}
              </>
            )}
          </NavLink>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-2">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[10px] transition-colors"
      >
        <group.icon className="mr-3 h-5 w-5 text-slate-400" />
        {t(group.name)}
        {expanded ? <ChevronDown className="ml-auto w-4 h-4 text-slate-400" /> : <ChevronRight className="ml-auto w-4 h-4 text-slate-400" />}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-11 py-1 space-y-1">
              {group.items.map((item: any) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "block px-3 py-2 text-sm rounded-lg transition-colors",
                    isActive
                      ? "text-[#2563EB] dark:text-blue-400 bg-[#EEF4FF] dark:bg-blue-950/70 font-medium"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {t(item.name)}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AdminLayout = () => {
  const { userInfo, logout } = useAuth();
  const { settings, effectiveLogoUrl } = useSettings();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(!settings.sidebarDefaultOpen);

  useEffect(() => {
    setIsCollapsed(!settings.sidebarDefaultOpen);
  }, [settings.sidebarDefaultOpen]);

  const { t } = useSettings();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [...navigationGroups];
  if (settings.expPages) {
    navGroups.push({
      name: '实验室 (BETA)',
      icon: FlaskConical,
      items: [
        { name: '算法实验与调试', to: '/admin/settings' }
      ]
    });
  }

  return (
    <div className="flex h-screen bg-[#F7F8FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white dark:bg-slate-900 rounded-md shadow-sm text-slate-600 dark:text-slate-300">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-[#E7EAF0] dark:border-slate-800 transform transition-all duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen flex flex-col shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "lg:w-[72px]" : "lg:w-[240px]",
        "w-[240px]"
      )}>
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <img src={effectiveLogoUrl} alt="Logo" className="w-7 h-7 object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  {settings.adminName || '模型推荐助手'}
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">管理后台</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            title={isCollapsed ? t("展开侧边栏") : t("折叠侧边栏")}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
          >
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3">
          {navGroups.map((group) => (
            <NavGroup key={group.name} group={group} setSidebarOpen={setSidebarOpen} />
          ))}
        </nav>

        <div className="p-4 border-t border-[#E7EAF0] dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={userInfo?.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc'} alt="avatar" className="w-9 h-9 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{userInfo?.nickname || 'admin'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t(userInfo?.role || '系统管理员')}</p>
              </div>
            )}
            {!isCollapsed && (
              <Link to="/admin/settings" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Settings className="w-4 h-4" />
              </Link>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center text-sm font-medium text-red-600 rounded-[10px] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors",
              isCollapsed ? "justify-center p-2" : "px-3 py-2"
            )}
            title={t("退出登录")}
          >
            <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && t("退出登录")}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Header */}
        <header className="h-16 lg:h-20 bg-[#F7F8FA] dark:bg-slate-950 border-b border-transparent dark:border-slate-900 shrink-0 flex items-center justify-between px-6 lg:px-9">
          <div className="flex-1" id="admin-header-left">
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/workbench"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              ← {t('返回业务端')}
            </Link>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-9 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
