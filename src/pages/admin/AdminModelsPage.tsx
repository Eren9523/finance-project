import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Plus, MoreHorizontal, Database, Loader2, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminModelsPage = () => {
  const { confirmAction, showToast, t } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [models, setModels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/admin/models');
      const data = await res.json() as { success?: boolean; data?: any };
      if (data.success && data.data) {
        setModels(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateModelStatus = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/models/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json() as { success?: boolean; data?: any };
      if (data.success && data.data) {
        setModels(models.map(m => m.id === id ? data.data : m));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteModel = async (id: string) => {
    confirmAction({
      title: t('删除 ModelCard 资产'),
      message: t('确定要永久删除此模型资产及其版本基线吗？此操作不可逆。'),
      confirmText: t('确定删除'),
      onConfirm: async () => {
        setIsUpdating(true);
        try {
          const res = await fetch(`/api/admin/models/${id}`, {
            method: 'DELETE'
          });
          const data = await res.json() as { success?: boolean };
          if (data.success) {
            setModels(models.filter(m => m.id !== id));
            showToast(t('模型资产已成功删除'), 'success');
          }
        } catch (err) {
          console.error(err);
          showToast(t('删除模型资产失败'), 'error');
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };

  const filteredModels = models.filter(m => {
    const matchStatus = filterStatus === 'All' || m.status === filterStatus;
    const matchSearch = m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        m.id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: models.length,
    approved: models.filter(m => m.status === 'Approved').length,
    review: models.filter(m => m.status === 'Needs Review').length,
    conflict: models.filter(m => m.status === 'Conflict').length,
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('模型资产')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('管理系统中的ModelCard与知识资产状态')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('ModelCard总数')}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('已审核 (Approved)')}</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('待复核 (Needs Review)')}</div>
          <div className="text-2xl font-bold text-amber-500 dark:text-amber-400">{stats.review}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('源冲突 (Conflict)')}</div>
          <div className="text-2xl font-bold text-red-500 dark:text-red-400">{stats.conflict}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder={t('搜索模型名称或ID...')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
            >
              <option value="All">{t('全部状态')}</option>
              <option value="Approved">Approved</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Conflict">Conflict</option>
            </select>
            <button 
              onClick={() => {
                fetch('/api/admin/models', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: t('新导入的模型资产'),
                    category: t('未分类'),
                    scenarios: [t('通用')],
                    status: 'Needs Review'
                  })
                }).then(() => fetchModels());
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors active:scale-95 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              {t('新建/导入')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="px-6 py-4">Model ID</th>
                  <th className="px-6 py-4">{t('模型名称')}</th>
                  <th className="px-6 py-4">{t('业务领域')}</th>
                  <th className="px-6 py-4">{t('审核状态')}</th>
                  <th className="px-6 py-4 text-right">{t('操作')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                      {t('未找到匹配的模型资产')}
                    </td>
                  </tr>
                ) : filteredModels.map((model) => {
                  const status = model.status || 'Needs Review';
                  const statusColor = 
                    status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20' : 
                    status === 'Needs Review' ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 ring-amber-600/20' : 
                    'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 ring-red-600/20';

                  return (
                    <tr key={model.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">
                        {model.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium max-w-[200px] truncate" title={model.name}>
                        {model.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {model.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          value={status}
                          disabled={isUpdating}
                          onChange={(e) => updateModelStatus(model.id, e.target.value)}
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset outline-none cursor-pointer appearance-none dark:bg-slate-800",
                            statusColor
                          )}
                        >
                          <option value="Approved">Approved</option>
                          <option value="Needs Review">Needs Review</option>
                          <option value="Conflict">Conflict</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title={t('编辑')}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteModel(model.id)}
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" 
                            title={t('删除')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
