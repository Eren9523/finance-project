import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { BrainCircuit, Sparkles, LayoutGrid, FileBarChart, Layers, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

export const Navbar = () => {
  const location = useLocation();
  const { isLoggedIn, userInfo, logout, openLoginModal } = useAuth();
  const { settings, effectiveLogoUrl, t } = useSettings();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navItems = [
    { name: t('首页'), path: '/', icon: LayoutGrid },
    { name: t('智能推荐助手'), path: '/workbench', icon: Sparkles },
    { name: t('模型市场'), path: '/market', icon: BrainCircuit },
    { name: t('系统架构'), path: '/architecture', icon: Layers },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Logo for 江苏农商联合银行 */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center">
              <img src={effectiveLogoUrl} alt="Logo" className="h-8 w-auto object-contain dark:brightness-110" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 border-l border-slate-300 dark:border-slate-700 pl-3 ml-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
              {settings.systemName || '模型推荐助手'}
              {settings.betaFeatures && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 rounded-full">
                  BETA
                </span>
              )}
            </span>
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'group relative flex items-center gap-2 text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {location.pathname === item.path && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-[21px] left-0 h-0.5 w-full bg-blue-600 dark:bg-blue-400"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div 
              className="relative flex items-center h-16" 
              onMouseEnter={() => setIsDropdownOpen(true)} 
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <Link to="/profile" className="flex items-center gap-3 cursor-pointer group">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t('欢迎，')}{userInfo?.nickname}</span>
                <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-sm">
                  <img 
                    src={userInfo?.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc'} 
                    alt="Avatar" 
                    className="h-full w-full object-cover" 
                  />
                </div>
              </Link>
              
              {isDropdownOpen && (
                <div className="absolute right-0 top-14 mt-1 w-48 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-1 overflow-hidden z-50">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    {t('个人中心')}
                  </Link>
                  {userInfo?.isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      {t('管理后台')}
                    </Link>
                  )}
                  <button 
                    onClick={() => { setIsDropdownOpen(false); logout(); }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    {t('退出登录')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openLoginModal()}
              className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-5 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/60"
            >
              {t('登录 / 注册')}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
