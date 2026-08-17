import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  Lock, 
  Plus, 
  Search, 
  Edit3, 
  Copy, 
  Trash2, 
  UserPlus, 
  Check, 
  X, 
  Layers, 
  Database, 
  Sparkles, 
  BrainCircuit, 
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../../contexts/SettingsContext';

interface RoleItem {
  id: string;
  code: string;
  name: string;
  description: string;
  dataScope: 'all' | 'dept' | 'self';
  userCount: number;
  users: { name: string; avatar: string }[];
  isSystem?: boolean;
  permissions: {
    module: string;
    actions: string[];
  }[];
}

export const AdminRolesPage = () => {
  const { t, showToast } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'cards' | 'matrix'>('cards');
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Partial<RoleItem> | null>(null);

  // System Modules for Permissions
  const permissionModules = [
    {
      key: 'models',
      name: '模型资产管理',
      icon: Database,
      actions: ['查看', '新建/修改', '上下架审核', 'Taxonomy分类维护', '版本删除']
    },
    {
      key: 'recommendations',
      name: '推荐运营管理',
      icon: Sparkles,
      actions: ['查看记录', '满意度反馈处理', '推荐报告生成', '完整报告导出']
    },
    {
      key: 'ai_services',
      name: 'AI服务与Prompt',
      icon: BrainCircuit,
      actions: ['API Key配置', '用量成本审计', 'Prompt模板调试', '模型选型规则微调']
    },
    {
      key: 'users_roles',
      name: '用户与权限体系',
      icon: Users,
      actions: ['用户账号管理', '角色定义与授权', '部门架构划分']
    },
    {
      key: 'system_governance',
      name: '系统治理与合规',
      icon: Settings,
      actions: ['审计日志查看', 'Version Bundle包更新', '系统服务监控']
    }
  ];

  // Roles Data
  const [roles, setRoles] = useState<RoleItem[]>([
    {
      id: 'R001',
      code: 'super_admin',
      name: '超级系统管理员',
      description: '拥有对全行模型推荐系统、用户权限、AI 服务及系统配置的绝对最高控制权。',
      dataScope: 'all',
      userCount: 2,
      isSystem: true,
      users: [
        { name: 'admin', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=admin&backgroundColor=f8fafc' },
        { name: 'sysop', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=sysop&backgroundColor=f8fafc' }
      ],
      permissions: permissionModules.map(m => ({ module: m.name, actions: m.actions }))
    },
    {
      id: 'R002',
      code: 'model_asset_manager',
      name: '模型资产管理员',
      description: '负责金融 ModelCard 的维护、算法标签 Taxonomy 结构梳理、版本迭代与上下架审核。',
      dataScope: 'all',
      userCount: 5,
      users: [
        { name: 'model_lead', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=model_lead&backgroundColor=f8fafc' },
        { name: 'algo_dev', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=algo_dev&backgroundColor=f8fafc' },
        { name: 'card_editor', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=card_editor&backgroundColor=f8fafc' }
      ],
      permissions: [
        { module: '模型资产管理', actions: ['查看', '新建/修改', '上下架审核', 'Taxonomy分类维护', '版本删除'] },
        { module: '推荐运营管理', actions: ['查看记录', '推荐报告生成'] },
        { module: 'AI服务与Prompt', actions: ['Prompt模板调试'] },
        { module: '用户与权限体系', actions: [] },
        { module: '系统治理与合规', actions: ['审计日志查看'] }
      ]
    },
    {
      id: 'R003',
      code: 'recommendation_ops',
      name: '推荐运营分析师',
      description: '跟踪分析业务人员推荐场景反馈、监控选型满意度评分、生成导出全行运营报告。',
      dataScope: 'all',
      userCount: 8,
      users: [
        { name: 'ops_zhang', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=ops_zhang&backgroundColor=f8fafc' },
        { name: 'ops_li', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=ops_li&backgroundColor=f8fafc' }
      ],
      permissions: [
        { module: '模型资产管理', actions: ['查看'] },
        { module: '推荐运营管理', actions: ['查看记录', '满意度反馈处理', '推荐报告生成', '完整报告导出'] },
        { module: 'AI服务与Prompt', actions: ['用量成本审计'] },
        { module: '用户与权限体系', actions: [] },
        { module: '系统治理与合规', actions: [] }
      ]
    },
    {
      id: 'R004',
      code: 'risk_auditor',
      name: '风控与业务主审员',
      description: '负责风控模型评估、贷前/反欺诈场景模型试用、查看深度架构与导出方案。',
      dataScope: 'dept',
      userCount: 12,
      users: [
        { name: 'risk_lead', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=risk_lead&backgroundColor=f8fafc' },
        { name: 'audit_wang', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=audit_wang&backgroundColor=f8fafc' }
      ],
      permissions: [
        { module: '模型资产管理', actions: ['查看'] },
        { module: '推荐运营管理', actions: ['查看记录', '推荐报告生成', '完整报告导出'] },
        { module: 'AI服务与Prompt', actions: [] },
        { module: '用户与权限体系', actions: [] },
        { module: '系统治理与合规', actions: ['审计日志查看'] }
      ]
    },
    {
      id: 'R005',
      code: 'branch_user',
      name: '普通业务人员 / 支行经理',
      description: '可使用智能助手输入金融业务诉求，查看 AI 推荐的模型架构与报告。',
      dataScope: 'self',
      userCount: 15,
      users: [
        { name: 'biz_user1', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=biz_user1&backgroundColor=f8fafc' }
      ],
      permissions: [
        { module: '模型资产管理', actions: ['查看'] },
        { module: '推荐运营管理', actions: ['查看记录', '推荐报告生成'] },
        { module: 'AI服务与Prompt', actions: [] },
        { module: '用户与权限体系', actions: [] },
        { module: '系统治理与合规', actions: [] }
      ]
    }
  ]);

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole?.name || !editingRole?.code) {
      showToast(t('请填写角色名称和编码'), 'error');
      return;
    }

    if (editingRole.id) {
      // Update
      setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...editingRole } as RoleItem : r));
      showToast(t('角色配置已更新'), 'success');
    } else {
      // Create
      const newRole: RoleItem = {
        id: `R00${roles.length + 1}`,
        code: editingRole.code,
        name: editingRole.name,
        description: editingRole.description || '',
        dataScope: editingRole.dataScope || 'dept',
        userCount: 0,
        users: [],
        permissions: permissionModules.map(m => ({ module: m.name, actions: ['查看'] }))
      };
      setRoles([...roles, newRole]);
      showToast(t('新建角色成功'), 'success');
    }

    setShowRoleModal(false);
    setEditingRole(null);
  };

  const handleCopyRole = (role: RoleItem) => {
    const copied: RoleItem = {
      ...role,
      id: `R00${roles.length + 1}`,
      code: `${role.code}_copy`,
      name: `${role.name} (${t('副本')})`,
      isSystem: false,
      userCount: 0,
      users: []
    };
    setRoles([...roles, copied]);
    showToast(t('角色已复制'), 'success');
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
    showToast(t('角色已删除'), 'success');
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-md ring-1 ring-purple-600/10">{t('用户与权限')}</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('角色定义')}</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('定义基于 RBAC 模型的访问控制角色，细粒度配置模型资产、推荐运营、AI 服务的访问与操作权限。')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingRole({ name: '', code: '', description: '', dataScope: 'dept' });
              setShowRoleModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('新建角色')}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>{t('系统定义角色')}</span>
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{roles.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t('个')}</span></div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('内置 1 个超管预置角色')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>{t('关联活跃成员')}</span>
            <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">42 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t('人')}</span></div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">100% {t('已赋予合规角色')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>{t('细粒度权限节点')}</span>
            <Key className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">22 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t('个控制点')}</span></div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('模块涵盖资产/运营/AI/治理')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>{t('数据隔离边界')}</span>
            <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">3 {t('级')}</div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('全行 / 本部门 / 仅个人')}</div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Toolbar & Tabs */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('cards')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === 'cards' 
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              {t('角色卡片概览')} ({filteredRoles.length})
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === 'matrix' 
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              {t('权限控制矩阵对比 (RBAC Matrix)')}
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('搜索角色名称或代码...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tab 1: Role Cards Grid */}
        {activeTab === 'cards' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role, idx) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between text-slate-900 dark:text-slate-100"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t(role.name)}</h3>
                        {role.isSystem && (
                          <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[10px] font-semibold rounded border border-purple-200/60 dark:border-purple-800">
                            {t('系统内置')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{role.code}</p>
                    </div>

                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-medium border shrink-0",
                      role.dataScope === 'all' && "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                      role.dataScope === 'dept' && "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                      role.dataScope === 'self' && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    )}>
                      {role.dataScope === 'all' && t('数据: 全行视角')}
                      {role.dataScope === 'dept' && t('数据: 本部门视角')}
                      {role.dataScope === 'self' && t('数据: 仅限个人')}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-2 min-h-[36px]">
                    {t(role.description)}
                  </p>

                  {/* User Members Preview */}
                  <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl mb-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('绑定成员')} ({role.userCount}{t('人')})</span>
                    <div className="flex items-center -space-x-1.5">
                      {role.users.slice(0, 3).map((u, i) => (
                        <img key={i} src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full border border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800" />
                      ))}
                      {role.userCount > 3 && (
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center border border-white dark:border-slate-900">
                          +{role.userCount - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Permissions Summary Tags */}
                  <div className="space-y-1.5 mb-4">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{t('已开通模块核心权限:')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.map((p) => {
                        const count = p.actions.length;
                        if (count === 0) return null;
                        return (
                          <span key={p.module} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium">
                            {t(p.module)} ({count})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setShowAssignUserModal(true);
                    }}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {t('成员分配')}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyRole(role)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={t('复制角色')}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setShowRoleModal(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={t('编辑角色配置')}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {!role.isSystem && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                        title={t('删除角色')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tab 2: Permission Matrix Table */}
        {activeTab === 'matrix' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4 min-w-[180px]">{t('系统核心功能模块')}</th>
                  <th className="px-6 py-4 min-w-[160px]">{t('细粒度操作控制点')}</th>
                  {roles.map(r => (
                    <th key={r.id} className="px-4 py-4 text-center min-w-[120px]">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{t(r.name)}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-normal">{r.code}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {permissionModules.map((module) => (
                  <React.Fragment key={module.key}>
                    {module.actions.map((action, actionIdx) => (
                      <tr key={`${module.key}-${action}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                        {actionIdx === 0 && (
                          <td 
                            rowSpan={module.actions.length} 
                            className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-800/40 border-r border-slate-100 dark:border-slate-800 align-top"
                          >
                            <div className="flex items-center gap-2">
                              <module.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              {t(module.name)}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                          {t(action)}
                        </td>
                        {roles.map(r => {
                          const modulePerm = r.permissions.find(p => p.module === module.name);
                          const hasAction = modulePerm?.actions.includes(action) || r.code === 'super_admin';
                          return (
                            <td key={r.id} className="px-4 py-3 text-center border-r border-slate-100/50 dark:border-slate-800/50">
                              {hasAction ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="text-slate-200 dark:text-slate-700">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Create / Edit Role Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden text-slate-900 dark:text-slate-100"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {editingRole?.id ? t('编辑角色与权限策略') : t('新建系统访问角色')}
                </h3>
                <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdateRole} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t('角色名称')} *</label>
                    <input
                      type="text"
                      required
                      placeholder={t('如: 风控架构审核员')}
                      value={editingRole?.name || ''}
                      onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t('角色唯一标识 (Code)')} *</label>
                    <input
                      type="text"
                      required
                      placeholder="如: risk_arch_reviewer"
                      value={editingRole?.code || ''}
                      onChange={(e) => setEditingRole({ ...editingRole, code: e.target.value })}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t('角色定位与职责说明')}</label>
                  <textarea
                    rows={2}
                    placeholder={t('简要阐述该角色的使用人群及权限范围...')}
                    value={editingRole?.description || ''}
                    onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t('数据查阅边界 (Data Scope)')}</label>
                  <select
                    value={editingRole?.dataScope || 'dept'}
                    onChange={(e) => setEditingRole({ ...editingRole, dataScope: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="all">{t('全行级视角 (可查阅全行所有部门的推荐方案与统计)')}</option>
                    <option value="dept">{t('部门级视角 (仅可查阅本部门人员发起的方案与报告)')}</option>
                    <option value="self">{t('个人级视角 (仅可查阅个人历史推荐记录)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t('开放功能模块授权')}</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {permissionModules.map((m) => (
                      <label key={m.key} className="flex items-center justify-between text-slate-700 dark:text-slate-300 p-1.5 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{t(m.name)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{m.actions.length} {t('项控制点')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {t('取消')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-xs"
                  >
                    {t('保存配置')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Assign Users Modal */}
      <AnimatePresence>
        {showAssignUserModal && selectedRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-slate-900 dark:text-slate-100"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t('分配角色成员')} - {t(selectedRole.name)}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedRole.code}</p>
                </div>
                <button onClick={() => setShowAssignUserModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('搜索账号名或部门...')}
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg"
                  />
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {[
                    { name: 'zhangsan (张三)', dept: '普惠金融部', checked: true },
                    { name: 'lisi (李四)', dept: '网络金融部', checked: true },
                    { name: 'wangwu (王五)', dept: '风险管理部', checked: false },
                    { name: 'zhaoliu (赵六)', dept: '公司业务部', checked: false },
                  ].map((u, i) => (
                    <label key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={u.checked} className="rounded text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.dept}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowAssignUserModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {t('取消')}
                  </button>
                  <button
                    onClick={() => {
                      showToast(t('成员关联更成功'), 'success');
                      setShowAssignUserModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-xs"
                  >
                    {t('确认关联')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
