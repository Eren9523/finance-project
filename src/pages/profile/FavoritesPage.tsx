import React from 'react';
import { motion } from 'motion/react';
import { Bookmark, ArrowUpRight, Layers, Zap } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const FavoritesPage = () => {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">收藏模型</h1>
        <p className="mt-1 text-sm text-slate-500">管理您收藏的模型卡片</p>
      </div>
      
      {favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 shadow-sm"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
            <Bookmark className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">暂未收藏任何模型</h3>
          <p className="mt-2 text-sm text-slate-500">前往模型市场发现更多优秀模型</p>
          <Link to="/market" className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            去模型市场看看 →
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((model, idx) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:ring-1 hover:ring-blue-200"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    model.category === '风控' ? 'bg-red-50 text-red-700' :
                    model.category === '营销' ? 'bg-blue-50 text-blue-700' :
                    'bg-purple-50 text-purple-700'
                  }`}>
                    {model.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(model.id);
                      }}
                      className={cn(
                        "rounded-full p-1.5 transition-colors bg-blue-50 text-blue-600"
                      )}
                      title="取消收藏"
                    >
                      <Bookmark className="h-4 w-4 fill-current" />
                    </button>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-blue-500" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{model.name}</h3>
                <p className="mb-6 line-clamp-2 text-sm text-slate-500">{model.description}</p>
                
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Layers className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{model.scenarios[0]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="truncate">{Object.entries(model.metrics)[0]?.[0].toUpperCase()}: {Object.entries(model.metrics)[0]?.[1]}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {model.tags.map(tag => (
                  <span key={tag} className="inline-flex rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
