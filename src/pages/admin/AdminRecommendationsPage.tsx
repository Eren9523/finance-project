import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, History } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { apiClient } from '../../api/client';

export const AdminRecommendationsPage = () => {
  const { t } = useSettings();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      let serverRecords = null;
      let fallbackToLocal = false;
      try {
        const res = await apiClient('/api/recommendations');
        if (res.success && res.data && res.data.length > 0) {
          setRecords(res.data.reverse());
          serverRecords = res.data;
        } else {
          fallbackToLocal = true;
        }
      } catch (e) {
        console.error(e);
        fallbackToLocal = true;
      }
      
      if (fallbackToLocal) {
        try {
          const localRecs = JSON.parse(localStorage.getItem('recommendations') || '[]');
          if (localRecs.length > 0) {
            setRecords(localRecs.reverse());
          } else if (!serverRecords) {
            setRecords([]);
          }
        } catch(e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    fetchRecords();
  }, []);

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
                <th className="px-6 py-4 font-medium">{t('原始需求')}</th>
                <th className="px-6 py-4 font-medium">{t('推荐模型')}</th>
                <th className="px-6 py-4 font-medium">{t('时间')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">{t('正在加载...')}</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">{t('暂无推荐记录')}</td>
                </tr>
              ) : records.map((rec, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={rec.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-slate-400" />
                    {rec.id || 'REC-XXX'}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{t(rec.query || '-')}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {rec.singleRecs && rec.singleRecs.length > 0 ? rec.singleRecs.map((m: any) => (
                        <span key={m.modelId || (m.model && m.model.name)} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-mono">{m.modelId || (m.model && m.model.name)}</span>
                      )) : <span className="text-slate-400">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{rec.timestamp ? new Date(rec.timestamp).toLocaleString() : '-'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
