import React from 'react';
import { motion } from 'motion/react';
import { FileText } from 'lucide-react';

export const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">推荐报告</h1>
        <p className="mt-1 text-sm text-slate-500">查看和下载已保存的推荐方案报告</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 shadow-sm"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">暂无保存的推荐报告</h3>
        <p className="mt-2 text-sm text-slate-500">您可以在推荐详情中保存分析报告</p>
      </motion.div>
    </div>
  );
};
