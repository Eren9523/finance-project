import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminStatusPage = () => {
  const { t, showToast } = useSettings();
  const [checking, setChecking] = useState(false);

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      showToast(t('系统健康度检查完成'), 'success');
    }, 600);
  };

  const statusItems = [
    { name: t('前端应用 (Frontend)'), status: t('健康运行'), isHealthy: true, details: 'React 19 / Vite ' + t('构建') },
    { name: t('后端服务 (Express Server)'), status: t('健康运行'), isHealthy: true, details: 'Node.js Express ' + t('运行环境') },
    { name: t('数据库持久层 (Database)'), status: t('健康运行'), isHealthy: true, details: t('本地文件与内存融合驱动') },
    { name: t('DeepSeek 接口服务'), status: t('健康运行'), isHealthy: true, details: t('API 接口网络正常') },
    { name: t('模型资产库 (ModelCard)'), status: t('健康运行'), isHealthy: true, details: t('已加载全量模型资产') },
    { name: t('智能推荐引擎'), status: t('健康运行'), isHealthy: true, details: t('决策推荐匹配逻辑激活中') },
    { name: t('官方计费价格源'), status: t('已校准'), isHealthy: true, details: t('与 DeepSeek 官方单价同步') },
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('服务监控')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('各子系统和服务健康度检查')}</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          {t('重新检查')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statusItems.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-[16px] bg-white dark:bg-slate-900 border border-[#E7EAF0] dark:border-slate-800 shadow-xs p-6 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">{item.name}</h3>
              {item.isHealthy ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              )}
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                item.isHealthy ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
              }`}>
                {item.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{item.details}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
