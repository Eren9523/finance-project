import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminFeedbackPage = () => {
  const { t } = useSettings();

  const feedbacks = [
    { id: 'FB-001', user: 'zhangsan', recId: 'REC-20260811-002', rating: 'up', comment: '模型推荐很精准，直接用于风控拦截。', time: '2026-08-11 14:20' },
    { id: 'FB-002', user: 'lisi', recId: 'REC-20260811-003', rating: 'down', comment: '推荐的模型缺乏时效性，要求包含最近半年的指标。', time: '2026-08-11 11:45' },
    { id: 'FB-003', user: 'wangwu', recId: 'REC-20260810-045', rating: 'up', comment: '组合推荐的两个模型效果很好。', time: '2026-08-10 17:10' }
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('推荐调优反馈')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('查看用户对智能推荐助手的评分和具体反馈意见。')}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">{t('反馈单号')}</th>
                <th className="px-6 py-4 font-medium">{t('用户')}</th>
                <th className="px-6 py-4 font-medium">{t('关联推荐单')}</th>
                <th className="px-6 py-4 font-medium">{t('评价')}</th>
                <th className="px-6 py-4 font-medium">{t('评论详情')}</th>
                <th className="px-6 py-4 font-medium">{t('时间')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {feedbacks.map((fb, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={fb.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                    {fb.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{fb.user}</td>
                  <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{fb.recId}</td>
                  <td className="px-6 py-4">
                    {fb.rating === 'up' ? (
                       <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                         <ThumbsUp className="h-4 w-4" /> {t('满意')}
                       </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                         <ThumbsDown className="h-4 w-4" /> {t('不满意')}
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-[300px]">{t(fb.comment)}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{fb.time}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
