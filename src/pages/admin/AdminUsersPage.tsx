import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminUsersPage = () => {
  const { t } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: 'U001', name: 'admin', email: 'admin@jsrcb.com', role: '系统管理员', dept: '总行数据中心', status: '正常', lastLogin: '今天 14:20' },
    { id: 'U002', name: 'zhangsan', email: 'zhangs@jsrcb.com', role: '普通用户', dept: '普惠金融部', status: '正常', lastLogin: '今天 09:15' },
    { id: 'U003', name: 'lisi', email: 'lisi@jsrcb.com', role: '普通用户', dept: '网络金融部', status: '正常', lastLogin: '昨天 16:30' },
    { id: 'U004', name: 'wangwu', email: 'wangw@jsrcb.com', role: '普通用户', dept: '风险管理部', status: '已禁用', lastLogin: '2026-08-01' },
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('机构与账号管理')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('管理系统账号与访问角色')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('用户总数')}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">42</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('今日新增')}</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('管理员')}</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('已禁用')}</div>
          <div className="text-2xl font-bold text-slate-500 dark:text-slate-400">1</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder={t('搜索用户名或邮箱...')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Filter className="w-4 h-4" />
              {t('筛选')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-6 py-4">{t('用户')}</th>
                <th className="px-6 py-4">{t('所属机构')}</th>
                <th className="px-6 py-4">{t('角色')}</th>
                <th className="px-6 py-4">{t('账户状态')}</th>
                <th className="px-6 py-4">{t('最近登录')}</th>
                <th className="px-6 py-4 text-right">{t('操作')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user.name}&backgroundColor=f8fafc`} alt="" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {t(user.dept)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      user.role === '系统管理员' ? "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    )}>
                      {t(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      user.status === '正常' ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-slate-500/20"
                    )}>
                      {t(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {t(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium mr-4">{t('详情')}</button>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <MoreHorizontal className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
