import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Building2, 
  Calendar, 
  Sparkles, 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Printer, 
  Share2, 
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { exportToPDF } from '../../lib/pdfExport';
import { exportToWord } from '../../lib/docExport';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useSettings } from '../../contexts/SettingsContext';

interface ReportItem {
  id: string;
  title: string;
  scenario: string;
  department: string;
  author: string;
  fitScore: number;
  modelsCount: number;
  models: string[];
  status: 'applied' | 'evaluating' | 'archived';
  exportCount: number;
  createdAt: string;
  summary: string;
  riskNote: string;
}

export const AdminReportsPage = () => {
  const { t } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');

  // Mock initial reports data
  const [reports, setReports] = useState<ReportItem[]>([
    {
      id: 'RPT-20260811-001',
      title: '县域农户小额信贷首贷响应与风控组合评估报告',
      scenario: '县域新客经营贷营销与准入风控',
      department: '普惠金融部',
      author: '张明 (高级经理)',
      fitScore: 95,
      modelsCount: 2,
      models: ['m_001 (消费贷授信未用信促提模型)', 'm_002 (AUM维稳增存模型)'],
      status: 'applied',
      exportCount: 18,
      createdAt: '2026-08-11 14:02',
      summary: '针对县域无信贷记录农户，采用消费贷未用信促提模型识别响应意向，结合AUM增存模型精准测算授信额度与资产留存，提升首贷转化率32%。',
      riskNote: '需关注经营流水真实性及外部工商司法数据补全，建议设置动态授信复核期。'
    },
    {
      id: 'RPT-20260811-002',
      title: '信用卡毫秒级实时反欺诈与违约预警评估报告',
      scenario: '信用卡高频交易反欺诈监控',
      department: '风险管理部',
      author: '李华 (风控主管)',
      fitScore: 92,
      modelsCount: 2,
      models: ['m_006 (信用卡反欺诈交易识别模型)', 'm_004 (零售客户违约概率预警模型)'],
      status: 'applied',
      exportCount: 25,
      createdAt: '2026-08-11 11:45',
      summary: '构建事中毫秒级流式计算拦截与事后PD违约预警双防线，可大幅降低盗刷欺诈损失与信用卡坏账风险。',
      riskNote: '拦截阈值设定需兼顾拦截率与良好客户交易误伤率，建议按周动态微调得分卡。'
    },
    {
      id: 'RPT-20260810-008',
      title: '小微企业经营贷财报流水智能解析与贷前准入报告',
      scenario: '小微企业经营贷批量授信',
      department: '公司业务部',
      author: '王强 (资深分析师)',
      fitScore: 89,
      modelsCount: 3,
      models: ['m_005 (企业财报与流水智能解析)', 'm_003 (个人经营贷小微企业准入)', 'm_004 (违约概率模型)'],
      status: 'evaluating',
      exportCount: 12,
      createdAt: '2026-08-10 16:20',
      summary: '自动化解析企业多银行流水与发票票据，提取真实经营收入与现金流特征，辅助快速核定经营贷款额度。',
      riskNote: '对跨省分支机构发票真实性依赖核验 API 稳定性，需配置容错降级评分逻辑。'
    },
    {
      id: 'RPT-20260809-014',
      title: '财富管理中高净值客户AUM流失预警与挽留推荐报告',
      scenario: '财富客户维稳与增量拓展',
      department: '零售网络金融部',
      author: '赵雪 (产品经理)',
      fitScore: 94,
      modelsCount: 1,
      models: ['m_002 (AUM维稳增存模型)'],
      status: 'applied',
      exportCount: 30,
      createdAt: '2026-08-09 10:15',
      summary: '通过客户资产变动趋势与到期理财特征，提前14天预测50万以上高净值客户流失风险，触发理财经理一对一挽留营销。',
      riskNote: '需联合短信与App Push通道协同，避免过度打扰非意向客户。'
    },
    {
      id: 'RPT-20260808-003',
      title: '对公洗钱与关联交易网络图谱分析专项报告',
      scenario: '反洗钱与对公关联风险排查',
      department: '合规与反洗钱部',
      author: '孙伟 (合规官)',
      fitScore: 88,
      modelsCount: 2,
      models: ['m_005 (财报流水解析模型)', 'm_006 (反欺诈识别模型)'],
      status: 'archived',
      exportCount: 7,
      createdAt: '2026-08-08 15:30',
      summary: '针对多层资金转账与股权穿透复杂网络进行智能化图谱建模，识别疑似洗钱团伙与异常资金池。',
      riskNote: '图数据库查询在大并发下存在延时，建议采用离线T+1批处理与实时增量结合。'
    }
  ]);

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || r.department === deptFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: ReportItem = {
      id: `RPT-20260811-${Math.floor(Math.random() * 899 + 100)}`,
      title: t('全行AI模型推荐方案季度运营与落地评估报告'),
      scenario: t('跨部门模型选型汇总评估'),
      department: t('总行数据中心'),
      author: t('系统管理员 (admin)'),
      fitScore: 96,
      modelsCount: 6,
      models: ['m_001', 'm_002', 'm_003', 'm_004', 'm_005', 'm_006'],
      status: 'applied',
      exportCount: 1,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      summary: t('汇总包含营销促活、风控准入、反欺诈与财报解析四大业务领域的整体选型表现，平均匹配契合度达93.2%。'),
      riskNote: t('建议加强边缘网点及县域支行对模型输出结果的二次复核与反馈跟进。')
    };
    setReports([newReport, ...reports]);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-md ring-1 ring-blue-600/10">{t('推荐运营')}</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('推荐报告管理')}</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('管理智能推荐助手生成的分析报告，查看业务方案落地采纳率、导出记录与定量评估图表。')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('生成汇总报告')}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>{t('累计生成报告')}</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">1,284 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t('份')}</span></div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            {t('较上月增长')} +14.2%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>{t('方案落地采纳率')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">88.6%</div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('已成功入库落地执行')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>{t('报告导出与分享')}</span>
            <Download className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">842 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t('次')}</span></div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('支持 PDF / Word / JSON')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>{t('平均契合度得分')}</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">93.4 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ 100</span></div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('根据业务反馈算法自迭代')}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Navigation Tabs & Search Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Sub Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('list')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === 'list' 
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              {t('报告明细列表')} ({filteredReports.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === 'analytics' 
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              {t('部门覆盖与指标统计')}
            </button>
          </div>

          {/* Filters */}
          {activeTab === 'list' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('搜索报告编号、标题、申请人...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">{t('全部部门')}</option>
                <option value="普惠金融部">{t('普惠金融部')}</option>
                <option value="风险管理部">{t('风险管理部')}</option>
                <option value="公司业务部">{t('公司业务部')}</option>
                <option value="零售网络金融部">{t('零售网络金融部')}</option>
                <option value="合规与反洗钱部">{t('合规与反洗钱部')}</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">{t('全部状态')}</option>
                <option value="applied">{t('已落地执行')}</option>
                <option value="evaluating">{t('评估研判中')}</option>
                <option value="archived">{t('已归档保存')}</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Reports Table */}
        {activeTab === 'list' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">{t('报告编号')}</th>
                  <th className="px-6 py-3.5">{t('报告标题 / 适用场景')}</th>
                  <th className="px-6 py-3.5">{t('归属部门 / 申请人')}</th>
                  <th className="px-6 py-3.5">{t('匹配契合度')}</th>
                  <th className="px-6 py-3.5">{t('状态')}</th>
                  <th className="px-6 py-3.5">{t('生成时间')}</th>
                  <th className="px-6 py-3.5 text-right">{t('操作')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredReports.map((report, idx) => (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-blue-500 shrink-0" />
                        {report.id}
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate" title={report.title}>
                        {report.title}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 flex items-center gap-1.5">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                          {report.scenario}
                        </span>
                        <span>· {report.modelsCount} {t('个组件')}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {report.department}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{report.author}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              report.fitScore >= 90 ? "bg-emerald-500" : "bg-blue-500"
                            )}
                            style={{ width: `${report.fitScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{report.fitScore}%</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.status === 'applied' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3" /> {t('已落地')}
                        </span>
                      )}
                      {report.status === 'evaluating' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                          <Clock className="w-3 h-3" /> {t('评估中')}
                        </span>
                      )}
                      {report.status === 'archived' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {t('已归档')}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {report.createdAt}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          {t('预览')}
                        </button>
                        <button
                          onClick={() => alert(`${t('已触发下载报告')}: ${report.id}.pdf`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                        >
                          <Download className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                          {t('导出')}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}

                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                      {t('暂无找到匹配的推荐报告数据')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Analytics Overview */}
        {activeTab === 'analytics' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department Distribution */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/40 dark:bg-slate-800/30">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {t('各业务部门报告申请分布')}
                </h3>
                <div className="space-y-3">
                  {[
                    { dept: '普惠金融部', count: 420, percent: 32 },
                    { dept: '风险管理部', count: 350, percent: 27 },
                    { dept: '零售网络金融部', count: 260, percent: 20 },
                    { dept: '公司业务部', count: 180, percent: 14 },
                    { dept: '合规与反洗钱部', count: 74, percent: 7 },
                  ].map((item) => (
                    <div key={item.dept} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{t(item.dept)}</span>
                        <span className="text-slate-500 dark:text-slate-400">{item.count} {t('份')} ({item.percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Models in Reports */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/40 dark:bg-slate-800/30">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {t('报告中引用频次最高的模型 Top 5')}
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'm_001', name: '消费贷授信未用信促提模型', count: 520, tag: '营销' },
                    { id: 'm_004', name: '零售客户违约概率预警模型 (PD)', count: 480, tag: '风控' },
                    { id: 'm_002', name: 'AUM维稳增存模型', count: 390, tag: '营销' },
                    { id: 'm_006', name: '信用卡反欺诈交易识别模型', count: 310, tag: '反欺诈' },
                    { id: 'm_005', name: '企业财报与流水智能解析模型', count: 240, tag: '特征提取' },
                  ].map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{t(m.name)}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{m.id} · {t(m.tag)}</p>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {m.count} <span className="text-[10px] font-normal text-slate-400">{t('次引用')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Report Detail Drawer/Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/80 dark:bg-slate-800/80">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    {selectedReport.id}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">{selectedReport.title}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('适用场景')}: <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedReport.scenario}</span> · {t('归属')}: {selectedReport.department} ({selectedReport.author})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div id="admin-report-content" className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900">
                {/* Summary */}
                <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 text-xs mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {t('报告核心执行摘要 (Executive Summary)')}
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedReport.summary}</p>
                </div>

                {/* 5-Dimensional Radar Assessment */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {t('五维度模型适配度评估 (5D Evaluation)')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="h-[180px] w-full flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={[
                          { subject: t('场景契合'), A: selectedReport.fitScore, fullMark: 100 },
                          { subject: t('数据满足'), A: Math.max(70, selectedReport.fitScore - 4), fullMark: 100 },
                          { subject: t('预测精度'), A: Math.max(75, selectedReport.fitScore - 2), fullMark: 100 },
                          { subject: t('合规易用'), A: 92, fullMark: 100 },
                          { subject: t('部署集成'), A: 88, fullMark: 100 },
                        ]}>
                          <PolarGrid stroke="#64748b" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name={t('适配度')} dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.45} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                        <span className="font-medium text-slate-600 dark:text-slate-400">{t('场景契合')}:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{selectedReport.fitScore}%</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                        <span className="font-medium text-slate-600 dark:text-slate-400">{t('数据满足')}:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{Math.max(70, selectedReport.fitScore - 4)}%</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                        <span className="font-medium text-slate-600 dark:text-slate-400">{t('预测精度')}:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{Math.max(75, selectedReport.fitScore - 2)}%</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                        <span className="font-medium text-slate-600 dark:text-slate-400">{t('合规易用')}:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">92%</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                        <span className="font-medium text-slate-600 dark:text-slate-400">{t('部署集成')}:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">88%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Models Applied */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    {t('推荐关联模型组件')} ({selectedReport.models.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.models.map((m, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg flex items-center justify-between">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{m}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          {t('推荐匹配得分')}: {selectedReport.fitScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Note */}
                <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 rounded-xl p-4">
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 text-xs mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {t('风险提示与合规复核建议')}
                  </h4>
                  <p className="text-amber-800 dark:text-amber-300">{selectedReport.riskNote}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {t('导出记录')}: {selectedReport.exportCount} {t('次')} · {t('生成时间')}: {selectedReport.createdAt}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await exportToWord({
                          title: selectedReport.title,
                          domain: selectedReport.scenario,
                          generatedAt: selectedReport.createdAt,
                          summaryNote: selectedReport.summary,
                          riskNote: selectedReport.riskNote,
                        }, `${selectedReport.id}.docx`);
                      } catch (err) {
                        console.error(err);
                        alert(t('Word 导出失败，请重试'));
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {t('导出 Word (.docx)')}
                  </button>
                  <button
                    onClick={async () => {
                      const el = document.getElementById('admin-report-content');
                      if (el) {
                        try {
                          await exportToPDF(el, `${selectedReport.id}.pdf`);
                        } catch (err) {
                          console.error(err);
                          alert(t('导出失败，请重试'));
                        }
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t('导出 PDF')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Create Summary Report Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden text-slate-900 dark:text-slate-100"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {t('生成全行模型推荐汇总分析报告')}
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t('报告周期范围')}</label>
                  <select className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    <option>{t('2026 年第三季度 (7月 - 9月)')}</option>
                    <option>{t('2026 年上半年')}</option>
                    <option>{t('近 30 天')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t('包含部门范围')}</label>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {['普惠金融部', '风险管理部', '公司业务部', '零售网络金融部', '合规与反洗钱部', '县域网点'].map((d) => (
                      <label key={d} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                        <span>{t(d)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t('重点评估维度')}</label>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>{t('选型命中准确率与模型契合度分值')}</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>{t('多模型全链路组合架构采纳率')}</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>{t('业务场景痛点与缺失特征改进建议')}</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {t('取消')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('立即智能生成')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
