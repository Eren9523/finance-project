import React from 'react';
import { motion } from 'motion/react';
import { Tag, FolderTree, Edit, Trash2, Plus } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminTaxonomyPage = () => {
  const { t } = useSettings();

  const taxonomy = [
    { category: '业务领域', tags: ['客户营销', '信贷风控', '运营管理', '财富管理', '反欺诈', '智能客服'] },
    { category: '适用客群', tags: ['对公客户', '零售客户', '同业客户', '小微企业', '个体工商户'] },
    { category: '业务阶段', tags: ['贷前准入', '贷中审查', '贷后预警', '存量营销', '流失挽留'] },
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('标签体系')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('管理模型资产的业务分类和维度标签。')}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-xs">
          <Plus className="h-4 w-4" />
          {t('新增维度')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {taxonomy.map((tax, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col text-slate-900 dark:text-slate-100"
          >
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                <FolderTree className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                {t(tax.category)}
              </div>
              <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 flex-1">
              <div className="flex flex-wrap gap-2">
                {tax.tags.map((tag, j) => (
                  <div key={j} className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300 cursor-default">
                    <Tag className="h-3 w-3 opacity-50" />
                    {t(tag)}
                    <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 ml-1">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                  <Plus className="h-3 w-3" />
                  {t('添加标签')}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
