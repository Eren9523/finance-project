import React from 'react';
import { motion } from 'motion/react';
import { Package } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminVersionsPage = () => {
  const { t } = useSettings();

  const versions = [
    { name: 'Dataset', version: 'v2026.08', status: 'Synced' },
    { name: 'ModelCard', version: 'v1.4.2', status: 'Synced' },
    { name: 'Taxonomy', version: 'v3.0.0', status: 'Synced' },
    { name: 'Graph', version: 'v1.1.5', status: 'Synced' },
    { name: 'Index', version: 'v1.1.5', status: 'Synced' },
    { name: 'Ranker', version: 'v2.2.0', status: 'Synced' },
    { name: 'Prompt', version: 'v2.4.1', status: 'Synced' },
    { name: 'LLM', version: 'deepseek-v4-flash', status: 'Active' },
    { name: 'Pricing', version: 'Snap #3', status: 'Active' },
    { name: 'Frontend', version: 'v1.0.8-prod', status: 'Deployed' },
    { name: 'Backend', version: 'v1.0.8-prod', status: 'Deployed' },
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('版本追踪')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('统一追踪所有资源、模型、配置与代码的版本')}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">{t('组件名称')}</th>
                <th className="px-6 py-4 font-medium">{t('当前版本')}</th>
                <th className="px-6 py-4 font-medium">{t('同步状态')}</th>
                <th className="px-6 py-4 font-medium">{t('更新时间')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {versions.map((v, i) => (
                <motion.tr 
                  key={v.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 text-xs">
                      {v.version}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                      {t(v.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    2026-08-11
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
