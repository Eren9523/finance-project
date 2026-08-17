import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Check, Save } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PreferencesPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('user_preferences');
    if (saved) return JSON.parse(saved);
    return {
    domains: ['信贷风控', '客户营销'],
    customerTypes: ['个体工商户'],
    stage: '贷前',
    mode: '单模型 + 组合推荐',
    explanationLevel: '标准',
    autoSave: true,
    showEvidence: true,
    };
  });

  const DOMAINS = ['信贷风控', '客户营销', '运营管理'];
  const CUSTOMER_TYPES = ['个人客户', '信用卡客户', '个体工商户', '小微企业', '对公客户'];
  const STAGES = ['贷前', '贷中', '贷后', '营销', '运营'];
  const MODES = ['单模型优先', '单模型 + 组合推荐'];
  const EXP_LEVELS = ['简洁', '标准', '专业'];

  const toggleArrayItem = (key: 'domains' | 'customerTypes', item: string) => {
    setPreferences(prev => {
      const arr = prev[key];
      if (arr.includes(item)) {
        return { ...prev, [key]: arr.filter(i => i !== item) };
      } else {
        return { ...prev, [key]: [...arr, item] };
      }
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('user_preferences', JSON.stringify(preferences));
      setIsSaving(false);
      alert('偏好设置已保存');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">工作偏好</h1>
        <p className="mt-1 text-sm text-slate-500">设置您的默认工作习惯与推荐参数</p>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">常用业务领域 (可多选)</h3>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map(domain => (
                <button
                  key={domain}
                  onClick={() => toggleArrayItem('domains', domain)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors border",
                    preferences.domains.includes(domain)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">常用客户类型 (可多选)</h3>
            <div className="flex flex-wrap gap-2">
              {CUSTOMER_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => toggleArrayItem('customerTypes', type)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors border",
                    preferences.customerTypes.includes(type)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">默认业务阶段</h3>
            <div className="flex flex-wrap gap-2">
              {STAGES.map(stage => (
                <button
                  key={stage}
                  onClick={() => setPreferences({ ...preferences, stage })}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors border",
                    preferences.stage === stage
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">默认推荐模式</h3>
              <select
                value={preferences.mode}
                onChange={(e) => setPreferences({ ...preferences, mode: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {MODES.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">解释详细度</h3>
              <select
                value={preferences.explanationLevel}
                onChange={(e) => setPreferences({ ...preferences, explanationLevel: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {EXP_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoSave}
                onChange={(e) => setPreferences({ ...preferences, autoSave: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">自动保存推荐记录</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showEvidence}
                onChange={(e) => setPreferences({ ...preferences, showEvidence: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">显示推荐证据</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  保存偏好设置
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
