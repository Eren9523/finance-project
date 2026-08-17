import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Zap, CheckCircle2, DollarSign, Clock, RefreshCw, X } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminAIUsagePage = () => {
  const { t, showToast } = useSettings();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calibrating, setCalibrating] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsageStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCalibrate = async () => {
    setCalibrating(true);
    try {
      const res = await adminApi.calibratePricing();
      if (res.success) {
        showToast(t('价格校准完成') + ': ' + (res.data ? 'Pricing #' + res.data.version : t('无变化')), 'success');
        fetchStats();
      } else {
        showToast(t('校准失败') + ': ' + res.error?.message, 'error');
      }
    } catch (e: any) {
      showToast(t('校准失败') + ': ' + e.message, 'error');
    } finally {
      setCalibrating(false);
    }
  };

  if (loading && !stats) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">{t('正在加载数据...')}</div>;
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <AnimatePresence>
        {calibrating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col text-slate-900 dark:text-slate-100"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('价格校准')}</h3>
                <button onClick={() => setCalibrating(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-slate-700 dark:text-slate-300">{t('读取DeepSeek官方文档')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-slate-900 dark:text-slate-100 font-medium">{t('解析当前模型价格...')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-40">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                  <span className="text-slate-700 dark:text-slate-300">{t('结构校验')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-40">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                  <span className="text-slate-700 dark:text-slate-300">{t('比较价格版本')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('AI API 额度监控')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('查看真实API用量、Token构成与模型调用成本')}</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg px-3 py-2 outline-none">
            <option>{t('今日')}</option>
            <option>{t('近 7 天')}</option>
            <option>{t('近 30 天')}</option>
            <option>{t('自定义')}</option>
          </select>
          <button 
            onClick={handleCalibrate}
            disabled={calibrating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            {t('校准官方价格')}
          </button>
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-6 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('AI请求')}</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.requests || 0}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> {t('今日')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-6 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">Tokens</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{((stats?.tokens || 0) / 1000).toFixed(1)}K</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t('API真实计量')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-6 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('计算成本')}</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">¥{(stats?.cost || 0).toFixed(4)}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {t('按已校准官方单价')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 p-6 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('平均响应')}</h3>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/80 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.avgLatency || '-'}s</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-transparent border border-slate-300 dark:border-slate-600"></span> {t('今日')}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t('Token使用趋势')}</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300">{t('Token用量')}</button>
              <button className="px-3 py-1 text-xs font-medium rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">{t('折合成本')}</button>
            </div>
          </div>
          <div className="h-[280px] flex items-center justify-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
            {t('暂无趋势数据')}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-slate-900 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs p-6 flex flex-col">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-6">{t('模型分布')}</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">DeepSeek V4 Pro</span>
                <span className="text-slate-500 dark:text-slate-400">{stats?.distribution?.pro || 0}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stats?.distribution?.pro || 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">DeepSeek V4 Flash</span>
                <span className="text-slate-500 dark:text-slate-400">{stats?.distribution?.flash || 0}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats?.distribution?.flash || 0}%` }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-slate-900 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs p-6">
           <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-6">{t('Token构成')}</h3>
           <div className="space-y-4">
             <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('缓存命中输入')}</span>
                  <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{stats?.breakdown?.cacheHit || 0}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('缓存未命中输入')}</span>
                  <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{stats?.breakdown?.cacheMiss || 0}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('模型输出')}</span>
                  <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{stats?.breakdown?.completion || 0}</span>
                </div>
                <div className="flex justify-between items-center pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">{t('深度思考 (Thinking)')}</span>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{stats?.breakdown?.thinking || 0}</span>
                </div>
             </div>
           </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white dark:bg-slate-900 rounded-[16px] border border-[#E7EAF0] dark:border-slate-800 shadow-xs p-6">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t('官方价格策略')}</h3>
             <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-1 rounded">
               <CheckCircle2 className="w-3 h-3" />
               {t('已校准')}
             </span>
           </div>
           
           <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">{t('当前版本')}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{t('策略版本')} #{stats?.pricing?.version || '1'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">{t('最后校准')}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{stats?.pricing?.time || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Flash (¥/1M)</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">0.02 / 1.0 / 2.0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Pro (¥/1M)</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">0.025 / 3.0 / 6.0</span>
              </div>
           </div>
        </motion.div>
      </div>

    </div>
  );
};
