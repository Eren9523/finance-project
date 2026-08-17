import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Smartphone, Monitor, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const SecurityPage = () => {
  const { userInfo } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">账户安全</h1>
        <p className="mt-1 text-sm text-slate-500">管理密码与登录设备</p>
      </div>
      
      <div className="grid gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">账户状态</h3>
              <p className="text-sm text-emerald-600 font-medium">正常</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">当前绑定邮箱</p>
                <p className="text-sm text-slate-500">{userInfo?.email?.replace(/(.{2})(.*)(?=@)/, '$1***') || 'a***@example.com'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                <p className="text-sm font-medium text-slate-900">账户密码</p>
                <p className="text-sm text-slate-500">•••••••••••</p>
              </div>
              <button 
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                修改密码
              </button>
            </div>

            {isChangingPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl bg-slate-50 p-4 border border-slate-200"
              >
                <div className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">当前密码</label>
                    <input type="password" value={passwordForm.old} onChange={e => setPasswordForm({...passwordForm, old: e.target.value})} className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">新密码</label>
                    <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">确认新密码</label>
                    <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">确认修改</button>
                    <button onClick={() => setIsChangingPassword(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">取消</button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">最近登录设备</h3>
            <p className="text-sm text-slate-500">查看并管理您的登录设备</p>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Monitor className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">MacBook Pro (当前设备)</p>
                  <p className="text-xs text-slate-500">IP: 192.168.1.*** · 南京市</p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">在线</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Smartphone className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">iPhone 14 Pro</p>
                  <p className="text-xs text-slate-500">IP: 117.136.***.*** · 昨天 19:30</p>
                </div>
              </div>
              <button className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors">
                退出登录
              </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4" />
              退出所有设备
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
