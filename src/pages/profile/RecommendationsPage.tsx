import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History } from 'lucide-react';
import { apiClient } from '../../api/client';

export const RecommendationsPage = () => {
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
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">我的推荐</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">查看您的历史模型推荐记录</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">正在加载...</div>
      ) : records.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-24 shadow-sm"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
            <History className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">还没有推荐记录</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">使用智能推荐助手获取最适合您的模型</p>
          <button className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            开始第一次智能推荐 →
          </button>
        </motion.div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">推荐单号</th>
                <th className="px-6 py-4 font-medium">原始需求</th>
                <th className="px-6 py-4 font-medium">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((rec, i) => (
                <tr key={rec.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 flex items-center gap-2">
                    <History className="h-3.5 w-3.5" />
                    {rec.id || 'REC-XXX'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 truncate max-w-[300px]">{rec.query}</td>
                  <td className="px-6 py-4 text-slate-500">{rec.timestamp ? new Date(rec.timestamp).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
