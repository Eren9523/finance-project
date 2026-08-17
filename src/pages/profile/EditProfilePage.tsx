import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Check, Mail, Briefcase, Building, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';
import { cn } from '../../lib/utils';

const PRESET_AVATARS = [
  { id: 'm1', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc' },
  { id: 'm2', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jack&backgroundColor=f8fafc' },
  { id: 'm3', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Leo&backgroundColor=f8fafc' },
  { id: 'm4', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jasper&backgroundColor=f8fafc' },
  { id: 'm5', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Oliver&backgroundColor=f8fafc' },
  { id: 'f1', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka&backgroundColor=f8fafc' },
  { id: 'f2', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jocelyn&backgroundColor=f8fafc' },
  { id: 'f3', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sophia&backgroundColor=f8fafc' },
  { id: 'f4', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Mia&backgroundColor=f8fafc' },
  { id: 'f5', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Bella&backgroundColor=f8fafc' },
];

export const EditProfilePage = () => {
  const { userInfo, updateUserInfo } = useAuth();
  const [formData, setFormData] = useState({
    nickname: userInfo?.nickname || '',
    email: userInfo?.email || '',
    role: userInfo?.role || '',
    department: userInfo?.department || '',
    avatar: userInfo?.avatar || '',
  });
  
  useEffect(() => {
    if (userInfo) {
      setFormData({
        nickname: userInfo.nickname || '',
        email: userInfo.email || '',
        role: userInfo.role || '',
        department: userInfo.department || '',
        avatar: userInfo.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc',
      });
    }
  }, [userInfo]);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authApi.updateProfile(formData);
      if (res.success && res.data) {
        updateUserInfo(res.data);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert(res.error?.message || 'Failed to update profile');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">个人资料</h1>
        <p className="mt-1 text-sm text-slate-500">管理您的基本身份信息</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
              <img src={formData.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc'} alt="Current Avatar" className="h-full w-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900">当前头像</h3>
              <p className="mt-1 mb-3 text-xs text-slate-500">支持预设头像快速更换</p>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <ImageIcon className="h-4 w-4 text-slate-400" />
                更换头像
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Nickname */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">昵称</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="请输入您的昵称"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">邮箱</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">岗位 / 用户类型</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  value={formData.role.split(' · ')[0] || '其他'}
                  onChange={(e) => setFormData({ ...formData, role: `${e.target.value} · ${userInfo?.isAdmin ? '管理员' : '普通用户'}` })}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="客户经理">客户经理</option>
                  <option value="风控专员">风控专员</option>
                  <option value="运营人员">运营人员</option>
                  <option value="技术人员">技术人员</option>
                  <option value="管理人员">管理人员</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">所属机构 / 部门</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Building className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="例如：总行业务部门"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-70"
            >
              {isSaving ? '保存中...' : '保存更改'}
            </button>
            {showSuccess && (
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                <Check className="h-4 w-4" /> 保存成功
              </span>
            )}
          </div>
        </form>
      </motion.div>

      {/* Avatar Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsAvatarModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900">选择头像</h3>
                <button
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap justify-center gap-4">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, avatar: preset.url });
                        setIsAvatarModalOpen(false);
                      }}
                      className={cn(
                        "relative h-16 w-16 overflow-hidden rounded-full border-2 transition-all hover:scale-105",
                        formData.avatar === preset.url ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-blue-300"
                      )}
                    >
                      <img src={preset.url} alt="preset" className="h-full w-full object-cover" />
                      {formData.avatar === preset.url && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <Check className="h-6 w-6 text-blue-600 drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
