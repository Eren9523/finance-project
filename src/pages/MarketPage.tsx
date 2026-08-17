import React, { useState } from 'react';
import { mockModels } from '../data/mock';
import { Search, Filter, Layers, Zap, ArrowUpRight, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSettings } from '../contexts/SettingsContext';
import { cn } from '../lib/utils';

export const MarketPage = () => {
  const { t } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const { toggleFavorite, isFavorite } = useFavorites();

  const categories = ['全部', '风控', '营销', '运营'];

  const filteredModels = mockModels.filter(m => {
    const matchSearch = m.name.includes(searchTerm) || m.tags.some(t => t.includes(searchTerm));
    const matchCat = categoryFilter === '全部' || m.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('模型市场库')}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('浏览、检索全行沉淀的优质模型资产，快速了解模型能力与落地案例。')}</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('搜索模型名称或标签...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex space-x-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  categoryFilter === cat ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {t(cat)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredModels.map((model, idx) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-lg hover:ring-1 hover:ring-blue-200 dark:hover:ring-blue-800"
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  model.category === '风控' ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300' :
                  model.category === '营销' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' :
                  'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                }`}>
                  {t(model.category)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(model.id);
                    }}
                    className={cn(
                      "rounded-full p-1.5 transition-colors",
                      isFavorite(model.id)
                        ? "bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400"
                        : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
                    )}
                  >
                    <Bookmark className={cn("h-4 w-4", isFavorite(model.id) && "fill-current")} />
                  </button>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 dark:text-slate-600 transition-colors group-hover:text-blue-500" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{model.name}</h3>
              <p className="mb-6 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{model.description}</p>
              
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Layers className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{model.scenarios[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="truncate">{Object.entries(model.metrics)[0]?.[0].toUpperCase()}: {Object.entries(model.metrics)[0]?.[1]}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              {model.tags.map(tag => (
                <span key={tag} className="inline-flex rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10 dark:ring-slate-400/20">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
