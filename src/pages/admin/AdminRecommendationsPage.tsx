import React from 'react';
import { motion } from 'motion/react';
import { Search, Filter, History } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminRecommendationsPage = () => {
  const { t } = useSettings();

  const records = [
    { id: 'REC-20260811-001', user: 'admin', query: '县域新客经营贷营销，贷前', status: 'success', models: ['M001', 'M005'], time: '2026-08-11 14:02' },
    { id: 'REC-20260811-002', user: 'zhangsan', query: '信用卡欺诈识别模型，用于风险过滤', status: 'success', models: ['M008'], time: '2026-08-11 13:45' },
    { id: 'REC-20260811-003', user: 'lisi', query: 'AUM 50万客户维稳模型', status: 'success', models: ['M002'], time: '2026-08-11 11:20' },
    { id: 'REC-20260810-045', user: 'wangwu', query: '对公洗钱预警网络图谱', status: 'success', models: ['M011', 'M013'], time: '2026-08-10 16:30' },
    { id: 'REC-20260810-042', user: 'admin', query: '房贷违约预测', status: 'clarifying', models: [], time: '2026-08-10 15:10' }
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('推荐记录')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('查看系统中所有用户的模型推荐交互记录与结果。')}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('搜索推荐记录、用户或关键词...')}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <Filter className="h-4 w-4" />
          {t('筛选')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">{t('推荐单号')}</th>
                <th className="px-6 py-4 font-medium">{t('用户')}</th>
                <th className="px-6 py-4 font-medium">{t('原始需求')}</th>
                <th className="px-6 py-4 font-medium">{t('状态')}</th>
                <th className="px-6 py-4 font-medium">{t('推荐模型')}</th>
                <th className="px-6 py-4 font-medium">{t('时间')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('操作')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {records.map((rec, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={rec.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-slate-400" />
                    {rec.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{rec.user}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{t(rec.query)}</td>
                  <td className="px-6 py-4">
                    {rec.status === 'success' ? (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">{t('完成')}</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">{t('澄清中')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {rec.models.length > 0 ? rec.models.map(m => (
                        <span key={m} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-mono">{m}</span>
                      )) : <span className="text-slate-400">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{rec.time}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs">
                      {t('详情')}
                    </button>
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
