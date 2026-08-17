import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  Settings2, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Save,
  Server,
  Network,
  BrainCircuit
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { adminApi } from '../../api/admin';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminAIPage = () => {
  const { t, showToast } = useSettings();
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'none' | 'success' | 'error'>('none');
  const [keyState, setKeyState] = useState<{configured: boolean, lastFour: string}>({
    configured: false,
    lastFour: ""
  });
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  const [aiConfig, setAiConfig] = useState({
    model: 'deepseek-chat',
    thinking: true,
    reasoningEffort: 'medium',
    streaming: true,
    timeout: 30000,
    maxRetry: 3,
    baseURL: 'https://api.deepseek.com',
    systemPrompt: ''
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const res = await adminApi.getConfig();
      if (res.success) {
        setAiConfig(prev => ({
          ...prev,
          model: res.data.model || 'deepseek-chat',
          systemPrompt: res.data.systemPrompt || '',
          baseURL: res.data.baseURL || 'https://api.deepseek.com'
        }));
        setKeyState({
          configured: res.data.hasApiKey,
          lastFour: res.data.hasApiKey ? '****' : ''
        });
      }
    } catch (e) {
      console.error('Failed to fetch config', e);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult('none');
    try {
      const res = await fetch('/api/recommend', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: "test", messages: [], mockDataContent: "" })
      });
      if (res.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch (e) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey) return;
    setIsSavingKey(true);
    try {
      const res = await adminApi.updateConfig({ apiKey });
      if (res.success) {
        setKeyState({
          configured: true,
          lastFour: apiKey.slice(-4) || '****'
        });
        setShowKeyForm(false);
        setApiKey('');
        setTestResult('success');
        showToast(t('API 密钥已保存成功'), 'success');
      }
    } catch (e) {
      console.error(e);
      setTestResult('error');
      showToast(t('保存密钥失败'), 'error');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await adminApi.updateConfig({ model: aiConfig.model, systemPrompt: aiConfig.systemPrompt, baseURL: aiConfig.baseURL });
      showToast(t('AI配置已保存生效'), 'success');
    } catch (e) {
      console.error(e);
      showToast(t('保存失败'), 'error');
    }
  };

  if (isLoadingConfig) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">{t('正在加载配置...')}</div>;
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto text-slate-900 dark:text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('服务配置')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('管理大模型服务、运行参数与连接状态')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: API & Provider */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[16px] bg-white dark:bg-slate-900 border border-[#E7EAF0] dark:border-slate-800 shadow-xs p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">DeepSeek API</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {keyState.configured ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        {t('已连接')}
                      </span>
                    ) : (
                       <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded">
                        {t('未配置密钥')}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{t('当前模型')}: {aiConfig.model}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleTestConnection}
                disabled={isTesting || !keyState.configured}
                className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Network className="w-4 h-4 mr-2" />}
                {t('测试连接')}
              </button>
            </div>

            <AnimatePresence>
              {testResult === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 rounded-lg flex items-start gap-3 overflow-hidden"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-200">{t('连接测试成功')}</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">{t('API响应正常，模型可用。')}</p>
                  </div>
                </motion.div>
              )}
              {testResult === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-3 bg-red-50 dark:bg-red-950/80 border border-red-100 dark:border-red-800 rounded-lg flex items-start gap-3 overflow-hidden"
                >
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-200">{t('连接测试失败')}</h4>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">{t('请检查API Key是否正确，或当前网络是否畅通。')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">{t('API 接口地址')}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{aiConfig.baseURL}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 items-center">
                <span className="text-slate-500 dark:text-slate-400">{t('API 密钥 (API Key)')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">
                    {keyState.configured ? `••••••••••••${keyState.lastFour}` : t('未配置')}
                  </span>
                  <button 
                    onClick={() => setShowKeyForm(!showKeyForm)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {keyState.configured ? t('重新配置') : t('去配置')}
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showKeyForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Key className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">{t('配置模型服务商 API 密钥')}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t('密钥将经过加密后安全存储。我们不会在前端明文展示。')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="password"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              placeholder="sk-..."
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                            />
                          </div>
                          <button
                            onClick={handleSaveKey}
                            disabled={isSavingKey || !apiKey}
                            className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-xs"
                          >
                            {isSavingKey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {t('保存密钥')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Model Params */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[16px] bg-white dark:bg-slate-900 border border-[#E7EAF0] dark:border-slate-800 shadow-xs p-6"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Settings2 className="w-5 h-5 text-slate-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t('模型推理参数')}</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('API 接口代理地址 (Endpoint)')}</label>
                <input 
                  type="text"
                  value={aiConfig.baseURL}
                  onChange={(e) => setAiConfig({...aiConfig, baseURL: e.target.value})}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-6"
                  placeholder="https://api.deepseek.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('默认推理模型')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'deepseek-chat', name: 'DeepSeek V4 Flash', desc: t('标准对话与推荐，速度极快') },
                    { id: 'deepseek-reasoner', name: 'DeepSeek V4 Pro', desc: t('深度思考，逻辑更强') }
                  ].map((m) => (
                    <div 
                      key={m.id}
                      onClick={() => setAiConfig({...aiConfig, model: m.id})}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        aiConfig.model === m.id 
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/50" 
                          : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{m.name}</span>
                        {aiConfig.model === m.id && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('深度思考 (Thinking)')}</label>
                  <select 
                    value={aiConfig.thinking ? 'true' : 'false'} 
                    onChange={(e) => setAiConfig({...aiConfig, thinking: e.target.value === 'true'})}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="true">{t('开启 (Enabled)')}</option>
                    <option value="false">{t('关闭 (Disabled)')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('推理强度 (Reasoning Effort)')}</label>
                  <select 
                    value={aiConfig.reasoningEffort || 'medium'} 
                    onChange={(e) => setAiConfig({...aiConfig, reasoningEffort: e.target.value})}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="low">{t('低 (Low)')}</option>
                    <option value="medium">{t('中等 (Medium)')}</option>
                    <option value="high">{t('高 (High)')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('流式传输 (Streaming)')}</label>
                  <select 
                    value={aiConfig.streaming ? 'true' : 'false'} 
                    onChange={(e) => setAiConfig({...aiConfig, streaming: e.target.value === 'true'})}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="true">{t('开启 (Enabled)')}</option>
                    <option value="false">{t('关闭 (Disabled)')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('超时时间 (毫秒 Timeout)')}</label>
                  <input 
                    type="number"
                    value={aiConfig.timeout || 30000} 
                    onChange={(e) => setAiConfig({...aiConfig, timeout: Number(e.target.value)})}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('最大重试次数 (Max Retry)')}</label>
                  <input 
                    type="number"
                    value={aiConfig.maxRetry || 3} 
                    onChange={(e) => setAiConfig({...aiConfig, maxRetry: Number(e.target.value)})}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={handleSaveConfig}
                className="h-10 px-6 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-xs"
              >
                {t('保存所有配置')}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Information */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[16px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-6 overflow-hidden relative text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <BrainCircuit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t('模型切换须知')}</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 relative z-10 leading-relaxed">
              <p>{t('系统目前主要支持 DeepSeek 官方接口服务。')}</p>
              <ul className="space-y-2 pl-4 list-disc marker:text-blue-500">
                <li><strong className="text-slate-900 dark:text-slate-100 font-medium">V4 Flash</strong>：{t('适合基础模型匹配，响应迅速，支持 JSON 结构化输出。')}</li>
                <li><strong className="text-slate-900 dark:text-slate-100 font-medium">V4 Pro</strong>：{t('会产生思考过程。适用于复杂的推荐方案组合与图谱推理。')}</li>
              </ul>
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <span className="block text-amber-900 dark:text-amber-200 mb-1 font-semibold">{t('注意事项')}</span>
                {t('推荐模块的 JSON 格式化强依赖于 V4 Flash 模型的 JSON 输出能力。如果切换至 R1 模型，系统会自动进行正则匹配提取 JSON，但可能偶发格式异常。')}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
