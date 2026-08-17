import React from 'react';
import { motion } from 'motion/react';
import { History } from 'lucide-react';

export const RecommendationsPage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">我的推荐</h1>
        <p className="mt-1 text-sm text-slate-500">查看您的历史模型推荐记录</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 shadow-sm"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
          <History className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">还没有推荐记录</h3>
        <p className="mt-2 text-sm text-slate-500">使用智能推荐助手获取最适合您的模型</p>
        <button className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          开始第一次智能推荐 →
        </button>
      </motion.div>
    </div>
  );
};
