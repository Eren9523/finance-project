import React from 'react';
import { motion } from 'motion/react';
import { 
  User, MessageSquare, BrainCircuit, ListTree, CheckCircle2, 
  Search, Database, Network, ShieldCheck, Zap, Server, 
  Cloud, Lock, FileText, Settings, ArrowRight, Layers,
  ChevronRight, Sparkles, Box, Activity, GitCommit
} from 'lucide-react';
import { cn } from '../lib/utils';

export const ArchitecturePage = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
          >
            系统架构与核心技术
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-slate-500"
          >
            基于大模型的意图理解与知识图谱融合，打造银行业务智能助手
          </motion.p>
        </div>

        <div className="flex flex-col gap-6">
          {/* 01 业务交互层 */}
          <Section 
            title="01 业务交互层" 
            subtitle="Business Interaction Layer"
            delay={0.2}
          >
            <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-center justify-between w-full">
              {/* User Input Flow */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    <User className="h-6 w-6" />
                  </div>
                  <span className="mt-2 text-sm font-medium text-slate-700">业务人员</span>
                  <span className="text-xs text-slate-500">自然语言需求</span>
                </div>
                
                <ChevronRight className="h-5 w-5 text-slate-300" />
                
                <div className="rounded-2xl bg-blue-50/50 px-5 py-3 border border-blue-100 max-w-[200px]">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    "我要筛选县域新客中适合经营贷营销，同时排除近期高风险客户..."
                  </p>
                </div>
              </div>

              {/* LLM Processing Pipeline */}
              <div className="flex items-center gap-2 lg:gap-4 flex-1 justify-center">
                <ProcessStep icon={BrainCircuit} title="意图理解" desc="意图识别与实体抽取" color="blue" />
                <ChevronRight className="h-5 w-5 text-slate-300 hidden md:block" />
                <ProcessStep icon={MessageSquare} title="多轮对话" desc="槽位澄清与信息补全" color="indigo" />
                <ChevronRight className="h-5 w-5 text-slate-300 hidden md:block" />
                <ProcessStep icon={ListTree} title="结构化输出" desc="生成规范化需求描述" color="violet" />
              </div>

              <ChevronRight className="h-5 w-5 text-slate-300 hidden lg:block" />

              {/* Requirement Profile */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 min-w-[280px]">
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-slate-900">需求画像</h4>
                  <p className="text-xs text-slate-500">Requirement Profile</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tag text="信贷营销" color="indigo" />
                  <Tag text="个体工商户" color="purple" />
                  <Tag text="贷前" color="blue" />
                  <Tag text="经营贷" color="emerald" />
                  <Tag text="风险过滤" color="amber" />
                  <Tag text="营销名单" color="rose" />
                </div>
              </div>
            </div>
          </Section>

          {/* 02 智能推荐引擎 */}
          <Section 
            title="02 智能推荐引擎" 
            subtitle="Hybrid Recommendation Engine"
            delay={0.3}
          >
            <div className="flex flex-col lg:flex-row items-stretch gap-6 w-full justify-between">
              
              {/* Recall */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                <h5 className="text-sm font-medium text-slate-700 text-center mb-1">多路召回</h5>
                <CardItem icon={Search} text="关键词检索 (BM25)" />
                <CardItem icon={Network} text="语义检索 (Embedding)" />
                <CardItem icon={Database} text="图谱检索 (Graph)" />
              </div>

              <ArrowConnector />

              {/* Fusion */}
              <div className="flex flex-col items-center justify-center">
                <h5 className="text-sm font-medium text-slate-700 text-center mb-3">候选融合</h5>
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-slate-50 border border-slate-200 shadow-sm relative overflow-hidden">
                   <div className="absolute inset-0 bg-blue-500/5 blur-xl"></div>
                   <Sparkles className="h-6 w-6 text-blue-500 mb-1" />
                   <span className="text-xs text-slate-600 text-center leading-tight">RRF<br/>融合算法</span>
                </div>
              </div>

              <ArrowConnector />

              {/* Hard Constraints */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 min-w-[180px]">
                <h5 className="text-sm font-medium text-slate-700 text-center mb-4">硬约束过滤</h5>
                <div className="flex flex-col gap-2.5">
                  <CheckListItem text="模型状态" />
                  <CheckListItem text="权限控制" />
                  <CheckListItem text="客群匹配" />
                  <CheckListItem text="业务阶段" />
                  <CheckListItem text="必要数据" />
                  <CheckListItem text="合规要求" />
                </div>
              </div>

              <ArrowConnector />

              {/* Soft Constraints & Ranking */}
              <div className="flex flex-col gap-4 min-w-[200px] justify-center">
                <h5 className="text-sm font-medium text-slate-700 text-center mb-1">精排与软约束</h5>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
                  <Layers className="h-5 w-5 text-indigo-500" />
                  <span className="text-sm text-slate-700">重排序 (Reranker)</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
                  <Network className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-slate-700">图谱软约束评分</span>
                </div>
              </div>

              <ArrowConnector />

              {/* Score Fusion */}
               <div className="flex flex-col items-center justify-center min-w-[120px]">
                <h5 className="text-sm font-medium text-slate-700 text-center mb-3">得分融合</h5>
                <div className="w-full rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm h-[100px] flex flex-col justify-center items-center relative overflow-hidden">
                  <span className="text-sm text-slate-700 z-10">校准融合</span>
                  {/* Fake sine wave */}
                  <svg className="absolute bottom-0 left-0 w-full h-12 text-blue-100" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                     <path d="M0,50 Q25,20 50,50 T100,50" />
                  </svg>
                </div>
              </div>

              <ArrowConnector />

              {/* Output */}
               <div className="flex flex-col gap-4 justify-center min-w-[180px]">
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">单模型推荐</span>
                    <span className="text-xs text-slate-500">Top3 / Top5</span>
                  </div>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 flex items-center gap-3">
                  <Network className="h-5 w-5 text-indigo-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">组合推荐</span>
                    <span className="text-xs text-slate-500">工作流规划</span>
                  </div>
                </div>
              </div>

            </div>
          </Section>

          <div className="flex flex-col xl:flex-row gap-6 w-full">
            {/* 03 知识与数据底座 */}
            <div className="flex-grow xl:w-2/3">
              <Section 
                title="03 知识与数据底座" 
                subtitle="Knowledge & Data Foundation"
                delay={0.4}
                className="h-full"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full h-full">
                  <BaseItem icon={Database} title="ModelCard 库" desc="60个业务模型" />
                  <BaseItem icon={Layers} title="Taxonomy 体系" desc="领域/客群/产品/能力" />
                  <BaseItem icon={Network} title="证据图谱" desc="候选关系与证据" />
                  <BaseItem icon={Search} title="检索索引" desc="向量/关键词索引" />
                  <BaseItem icon={Box} title="模型市场" desc="API 接入与服务编排" />
                </div>
              </Section>
            </div>

            {/* Infrastructure */}
            <div className="xl:w-1/3">
               <Section 
                title="" 
                subtitle="Infrastructure Layer"
                headerTitle="基础设施层"
                delay={0.5}
                className="h-full"
              >
                <div className="grid grid-cols-2 gap-4">
                  <InfraItem icon={Cloud} text="私有云部署" />
                  <InfraItem icon={Box} text="容器化服务" />
                  <InfraItem icon={Zap} text="API Gateway" />
                  <InfraItem icon={ShieldCheck} text="安全防护" />
                </div>
              </Section>
            </div>
          </div>

          {/* 离线治理平面 */}
           <Section 
            title="离线治理平面" 
            subtitle="Offline Governance Plane"
            delay={0.6}
            isGray
          >
             <div className="flex flex-col lg:flex-row items-stretch gap-6 w-full justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-4 lg:pb-0 flex-1 hide-scrollbar">
                  <GovernanceStep icon={Database} title="数据治理" desc="数据清洗与标准化" />
                  <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0 mx-1" />
                  <GovernanceStep icon={User} title="AI/人工复核" desc="质量审核与校验" />
                  <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0 mx-1" />
                  <GovernanceStep icon={Activity} title="评测体系" desc="EvalCase & 指标评估" />
                  <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0 mx-1" />
                  <GovernanceStep icon={Settings} title="校准优化" desc="阈值与权重校准" />
                  <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0 mx-1" />
                  <GovernanceStep icon={Activity} title="漂移监控" desc="模型表现监控" />
                  <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0 mx-1" />
                  <GovernanceStep icon={GitCommit} title="版本发布" desc="Version Bundle" />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 min-w-[280px] shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                       <h4 className="text-sm font-semibold text-slate-900">版本管理</h4>
                       <p className="text-xs text-slate-500">Version Bundle</p>
                     </div>
                     <Layers className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Dataset</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Ranker</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-400" /> ModelCard</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Prompt</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Graph</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-400" /> LLM</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Index</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Config</div>
                  </div>
                </div>
             </div>
          </Section>
          
          <div className="mt-8 text-center text-sm text-slate-400">
             © 2024 江苏农商联合银行 - 大模型驱动的模型市场智能推荐助手
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const Section = ({ title, subtitle, headerTitle, children, delay = 0, className, isGray = false }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "rounded-3xl border border-slate-200/60 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden",
        isGray ? "bg-slate-100/50" : "bg-white",
        className
      )}
      style={{
        boxShadow: "0 4px 24px -8px rgba(0, 0, 0, 0.02)"
      }}
    >
      <div className="mb-6 flex flex-col">
        {title && (
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-blue-600 font-bold">{title.split(' ')[0]}</span>
            {title.split(' ').slice(1).join(' ')}
          </h2>
        )}
        {headerTitle && !title && (
           <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            {headerTitle}
          </h2>
        )}
        <p className="text-xs text-slate-500 tracking-wider uppercase mt-1">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
};

const ProcessStep = ({ icon: Icon, title, desc, color }: any) => {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    violet: "text-violet-600 bg-violet-50 border-violet-100",
  };
  return (
    <div className="flex flex-col items-center text-center max-w-[120px]">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border mb-3", colorMap[color] || colorMap.blue)}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-semibold text-slate-800 leading-tight mb-1">{title}</span>
      <span className="text-[11px] text-slate-500 leading-tight">{desc}</span>
    </div>
  );
};

const Tag = ({ text, color }: any) => {
  const colorMap: any = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium border", colorMap[color] || colorMap.blue)}>
      {text}
    </span>
  );
};

const CardItem = ({ icon: Icon, text }: any) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
    <Icon className="h-4 w-4 text-blue-500 shrink-0" />
    <span className="text-xs font-medium text-slate-700">{text}</span>
  </div>
);

const CheckListItem = ({ text }: any) => (
  <div className="flex items-center gap-2">
    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
    <span className="text-xs font-medium text-slate-700">{text}</span>
  </div>
);

const ArrowConnector = () => (
  <div className="hidden lg:flex items-center justify-center text-slate-300">
    <ArrowRight className="h-5 w-5" />
  </div>
);

const BaseItem = ({ icon: Icon, title, desc }: any) => (
  <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
    <Icon className="h-8 w-8 text-slate-400 mb-3" strokeWidth={1.5} />
    <span className="text-sm font-semibold text-slate-800 mb-1 leading-tight">{title}</span>
    <span className="text-[11px] text-slate-500 leading-tight">{desc}</span>
  </div>
);

const InfraItem = ({ icon: Icon, text }: any) => (
  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
      <Icon className="h-4 w-4" />
    </div>
    <span className="text-xs font-medium text-slate-700">{text}</span>
  </div>
);

const GovernanceStep = ({ icon: Icon, title, desc }: any) => (
  <div className="flex flex-col items-center min-w-[100px]">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm mb-2">
      <Icon className="h-4 w-4" />
    </div>
    <span className="text-xs font-semibold text-slate-800 mb-1">{title}</span>
    <span className="text-[10px] text-slate-500 text-center leading-tight whitespace-nowrap">{desc}</span>
  </div>
);
