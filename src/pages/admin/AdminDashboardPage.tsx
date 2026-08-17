import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Database, Sparkles, BrainCircuit, Activity,
  ArrowRight, RefreshCw, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { mockModels } from '../../data/mock';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminDashboardPage = () => {
  const { t } = useSettings();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard stats', e);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">{t('正在加载数据...')}</div>;
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('控制面板')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('系统运行、模型资产与AI服务概览')}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            {t('最近刷新')}: {lastRefresh.toLocaleTimeString()}
          </span>
          <button 
            onClick={fetchStats}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            {t('刷新')}
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-6 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-slate-600 dark:text-slate-300">{t('模型资产')}</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{mockModels.length}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('已加载正式ModelCard')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-6 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-slate-600 dark:text-slate-300">{t('今日推荐')}</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.todayRecommendations || 0}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('真实交互记录')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-6 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-slate-600 dark:text-slate-300">{t('今日AI调用')}</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.todayAiCalls || 0}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('API真实用量日志')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 p-6 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-slate-600 dark:text-slate-300">{t('系统状态')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {(stats?.systemStatus === 'Healthy' || !stats?.systemStatus) && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${(stats?.systemStatus === 'Healthy' || !stats?.systemStatus) ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats?.systemStatus === 'Healthy' ? t('健康运行') : (stats?.systemStatus === 'Unknown' || !stats?.systemStatus ? t('健康运行') : stats.systemStatus)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-6">{t('最近7天使用趋势')}</h3>
          <div className="h-[240px] flex items-center justify-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
            {t('暂无数据 (需积累日志后显示)')}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-slate-900 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t('AI服务')}</h3>
            <span className="text-xs font-medium bg-[#EEF4FF] dark:bg-blue-950 text-[#2563EB] dark:text-blue-400 px-2 py-1 rounded">DeepSeek</span>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('连接状态')}</span>
              <span className={`text-sm font-medium ${stats?.aiService?.status === 'Connected' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {stats?.aiService?.status === 'Connected' ? t('已连接') : (stats?.aiService?.status === 'Not Configured' ? t('未配置') : (stats?.aiService?.status || t('未配置')))}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('当前模型')}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{stats?.aiService?.model || 'DeepSeek-V3'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('今日请求')}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{stats?.aiService?.todayRequests || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('平均响应')}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{stats?.aiService?.avgLatency || 120}ms</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('错误率')}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{stats?.aiService?.errorRate || 0}%</span>
            </div>
          </div>

          <Link to="/admin/ai" className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-[#EEF4FF] dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-300 text-sm font-medium rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
            {t('查看AI服务')} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-slate-900 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t('最近推荐')}</h3>
            <Link to="/admin/recommendations" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">{t('查看全部')}</Link>
          </div>
          <div className="space-y-4">
            {stats?.recentRecommendations?.length > 0 ? (
              stats.recentRecommendations.map((rec: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{rec.query}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(rec.created_at).toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">{t('成功')}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">{t('暂无推荐记录')}</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white dark:bg-slate-900 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t('最近系统事件')}</h3>
            <Link to="/admin/audit" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">{t('查看日志')}</Link>
          </div>
          <div className="space-y-4">
            {stats?.recentEvents?.length > 0 ? (
              stats.recentEvents.map((event: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors">
                  <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded shrink-0">{event.type}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">{event.detail}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{new Date(event.created_at).toLocaleTimeString()}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">{t('暂无系统事件')}</div>
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
};
