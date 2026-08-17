import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { Link } from 'react-router-dom';
import { ArrowRight, History, Bookmark, FileText, MessageSquare, ShieldCheck, Settings } from 'lucide-react';

export const ProfileOverviewPage = () => {
  const { userInfo } = useAuth();
  const { favorites } = useFavorites();

  const stats = [
    { label: '推荐记录', value: 12, icon: History },
    { label: '收藏模型', value: favorites.length, icon: Bookmark },
    { label: '推荐报告', value: 4, icon: FileText },
    { label: '反馈记录', value: 3, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">个人中心</h1>
        <p className="mt-1 text-sm text-slate-500">管理您的推荐记录、工作偏好与账户信息</p>
      </div>

      {/* User Identity Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-slate-50 shadow-sm">
            <img src={userInfo.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc'} alt="Avatar" className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{userInfo.nickname}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-600">
              <span>{userInfo.role}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span>{userInfo.department}</span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
              <span>{userInfo.email}</span>
              <span>最近登录：{userInfo.lastLogin}</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                账户正常
              </span>
            </div>
          </div>
        </div>
        <div>
          <Link
            to="/profile/edit"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            编辑资料
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
            <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <stat.icon className="h-4 w-4" />
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[65%_1fr]">
        {/* Recent Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-slate-900">最近推荐记录</h3>
            <Link to="/profile/recommendations" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              查看全部
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {/* Mock Item 1 */}
            <div className="p-6 transition-colors hover:bg-slate-50/50">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">县域新客经营贷营销</h4>
                  <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5">客户营销</span>
                    <span>·</span>
                    <span>个体工商户</span>
                    <span>·</span>
                    <span>贷前</span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p className="text-xs font-medium text-slate-400">推荐方案：</p>
                    <p>经营贷准入评分卡</p>
                    <p>个体工商户营销模型</p>
                    <p>风险过滤模型</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="text-xs text-slate-400">2小时前</span>
                  <Link
                    to="/workbench"
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    查看详情 <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Mock Item 2 */}
            <div className="p-6 transition-colors hover:bg-slate-50/50">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">对公客户贷后风险预警</h4>
                  <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5">信贷风控</span>
                    <span>·</span>
                    <span>对公客户</span>
                    <span>·</span>
                    <span>贷后</span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p className="text-xs font-medium text-slate-400">推荐方案：</p>
                    <p>对公客户违约概率模型</p>
                    <p>企业关联图谱模型</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="text-xs text-slate-400">昨天</span>
                  <Link
                    to="/workbench"
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    继续分析 <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Preferences & Favorites */}
        <div className="space-y-6">
          {/* Work Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">工作偏好</h3>
              <Link to="/profile/preferences" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                管理
              </Link>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1.5">常用业务领域</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">信贷风控</span>
                  <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">客户营销</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1.5">常用客群与阶段</p>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span>个体工商户</span>
                  <span className="text-slate-300">|</span>
                  <span>贷前</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Favorites */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">我的收藏</h3>
              <Link to="/profile/favorites" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                全部
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {favorites.length > 0 ? (
                favorites.slice(0, 3).map((fav) => (
                  <div key={fav.id} className="p-5 transition-colors hover:bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm truncate max-w-[200px]">{fav.id} {fav.name}</h4>
                        <p className="mt-1 text-xs text-slate-500 truncate max-w-[200px]">{fav.scenarios[0]} · {Object.entries(fav.metrics)[0]?.[0]}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-sm text-slate-500">
                  暂未收藏任何模型
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
