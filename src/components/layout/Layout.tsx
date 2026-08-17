import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useSettings } from '../../contexts/SettingsContext';

export const Layout = () => {
  const { settings, t } = useSettings();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center text-sm text-slate-500 dark:text-slate-400 transition-colors space-y-2">
        <p>{t('江苏农商联合银行 —— 大模型驱动的模型市场智能推荐助手')}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{settings.footerCopyright}</p>
      </footer>
    </div>
  );
};
