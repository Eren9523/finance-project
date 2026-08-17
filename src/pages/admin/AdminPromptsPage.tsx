import React from 'react';
import { FileText, Copy, Edit, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminPromptsPage = () => {
  const { t, showToast } = useSettings();

  const prompts = [
    {
      id: 'p_req_parser',
      name: t('Requirement Parser Prompt'),
      version: 'v2.4.1',
      status: 'Active',
      updatedAt: '2026-08-10 14:30',
      updatedBy: 'admin',
      preview: 'You are an expert banking AI assistant. Your task is to parse user natural language requirements into structured JSON...'
    },
    {
      id: 'p_clarification',
      name: t('Clarification Prompt'),
      version: 'v1.2.0',
      status: 'Active',
      updatedAt: '2026-08-01 09:15',
      updatedBy: 'system',
      preview: 'Given the user query and the parsed requirements which have missing fields, generate a polite clarification question...'
    },
    {
      id: 'p_recommendation',
      name: t('Recommendation Explanation Prompt'),
      version: 'v3.0.2',
      status: 'Active',
      updatedAt: '2026-08-11 11:20',
      updatedBy: 'admin',
      preview: 'You are generating a final recommendation report. You have selected the following models: {{models}}. Please explain...'
    },
    {
      id: 'p_pricing',
      name: t('Pricing Extractor Prompt'),
      version: 'v1.0.0',
      status: 'Active',
      updatedAt: '2026-08-11 00:00',
      updatedBy: 'admin',
      preview: 'SYSTEM: 你是一个结构化数据提取器。下面提供的是后端刚刚从DeepSeek官方API价格页面读取的正文...'
    },
    {
      id: 'p_report',
      name: t('Report Generator Prompt'),
      version: 'v1.0.5',
      status: 'Archived',
      updatedAt: '2026-07-20 16:45',
      updatedBy: 'admin',
      preview: 'Generate a markdown report based on the recommendation results...'
    }
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('提示词模板管理')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('管理系统中大模型调用的各个阶段系统提示词，支持版本化与追溯。')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {prompts.map((prompt, i) => (
          <motion.div
            key={prompt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-[16px] bg-white dark:bg-slate-900 border border-[#E7EAF0] dark:border-slate-800 shadow-xs overflow-hidden flex flex-col text-slate-900 dark:text-slate-100"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{prompt.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono bg-slate-200/50 dark:bg-slate-800 px-1.5 rounded text-slate-600 dark:text-slate-300">{prompt.version}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {prompt.updatedAt}</span>
                    <span>By: {prompt.updatedBy}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${prompt.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  {prompt.status === 'Active' ? t('启用') : t('禁用')}
                </span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(prompt.preview);
                    showToast(t('提示词已复制到剪贴板'), 'success');
                  }}
                  className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors ml-2" 
                  title={t('复制')}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ml-1">
                  {t('版本历史')}
                </button>
              </div>
            </div>
            <div className="p-6 bg-slate-50/30 dark:bg-slate-950/30">
              <div className="relative">
                <div className="absolute top-3 right-3">
                  <button className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-1 rounded">
                    <Edit className="w-3 h-3" />
                    {t('创建新版本')}
                  </button>
                </div>
                <pre className="text-sm text-slate-600 dark:text-slate-300 font-mono whitespace-pre-wrap bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs leading-relaxed pr-24">
                  {prompt.preview}
                </pre>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
