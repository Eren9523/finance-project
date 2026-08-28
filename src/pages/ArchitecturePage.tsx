import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  User,
  MessageSquare,
  BrainCircuit,
  ListTree,
  CheckCircle2,
  Search,
  Database,
  Network,
  ShieldCheck,
  Zap,
  Cloud,
  Lock,
  FileText,
  Settings,
  ArrowRight,
  Layers,
  ChevronRight,
  Sparkles,
  Box,
  Activity,
  GitCommit,
  Check,
  Cpu,
  RotateCw,
  Share2,
  Rocket,
} from "lucide-react";
import { cn } from "../lib/utils";

const OrbitingSatellite = ({
  phase,
  size,
  colorClass,
  shadowClass,
}: {
  phase: number;
  size: number;
  colorClass: string;
  shadowClass: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    const start = performance.now();
    // Container is 192px (w-48), viewBox is 180x180.
    // Ellipse in SVG: rx=78, ry=42. Scale factor = 192 / 180 = 1.066667
    // Precise physical pixel radii:
    const rx = 78 * (192 / 180); // 83.2px
    const ry = 42 * (192 / 180); // 44.8px
    const angleZ = -28 * (Math.PI / 180);
    const cosZ = Math.cos(angleZ);
    const sinZ = Math.sin(angleZ);

    const animate = (time: number) => {
      const elapsed = time - start;
      const angle = (elapsed / 12000) * Math.PI * 2 + phase;

      const origX = Math.cos(angle) * rx;
      const origY = Math.sin(angle) * ry;

      const rotX = origX * cosZ - origY * sinZ;
      const rotY = origX * sinZ + origY * cosZ;

      const scale = 0.95 + Math.sin(angle) * 0.15;
      const zIndex = origY > 0 ? 30 : 0;

      if (ref.current) {
        ref.current.style.transform = `translate(${rotX}px, ${rotY}px) scale(${scale})`;
        ref.current.style.zIndex = zIndex.toString();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [phase]);

  return (
    <div
      className="absolute top-1/2 left-1/2 pointer-events-none"
      ref={ref}
      style={{ width: 0, height: 0 }}
    >
      <div
        className={`absolute rounded-full ${colorClass}`}
        style={{
          width: size,
          height: size,
          transform: "translate(-50%, -50%)",
          boxShadow: shadowClass,
        }}
      />
    </div>
  );
};

const DeckCard = ({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: (2 - index) * 80,
        y: 100,
        scale: 0.9,
        rotate: (index - 2) * 6,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: 0.3 + index * 0.1,
        type: "spring",
        bounce: 0.4,
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};

const SequenceSection = ({
  unlock,
  children,
  className,
  delay = 0,
}: {
  unlock: boolean;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={unlock && isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            delay: delay,
            ease: "easeOut",
            staggerChildren: 0.15,
            delayChildren: delay + 0.2,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const PipelineCard = ({ icon: Icon, title, desc, tag, delay }: any) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-900/50 p-4 sm:p-5 shadow-xs flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            {title}
          </span>
        </div>
        {tag && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {tag}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed z-10">
        {desc}
      </p>

      {/* Progress bar animation */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-200 dark:bg-slate-800 w-full">
        <motion.div
          variants={{
            hidden: { width: "0%" },
            visible: {
              width: "100%",
              transition: { duration: 2, delay: delay, ease: "circOut" },
            },
          }}
          className="h-full bg-blue-500 dark:bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
        />
      </div>
    </motion.div>
  );
};

export const ArchitecturePage = () => {
  // Stepwise reveal state for Layer 01 (Simulate real user chat -> intent -> dialogue -> structured -> profile)
  const [chatStep, setChatStep] = useState<number>(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [stageUnlocks, setStageUnlocks] = useState({
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const runChatFlow = () => {
    setIsReplaying(true);
    setChatStep(0);
    setStageUnlocks({ 2: false, 3: false, 4: false, 5: false });

    const t1 = setTimeout(() => setChatStep(1), 600);
    const t2 = setTimeout(() => setChatStep(2), 1100);
    const t3 = setTimeout(() => setChatStep(3), 1500);
    const t4 = setTimeout(() => setChatStep(4), 1900);
    const t5 = setTimeout(() => {
      setChatStep(5);
      setIsReplaying(false);
      setStageUnlocks((prev) => ({ ...prev, 2: true }));
    }, 2300);

    const t6 = setTimeout(
      () => setStageUnlocks((prev) => ({ ...prev, 3: true })),
      3500,
    );
    const t7 = setTimeout(
      () => setStageUnlocks((prev) => ({ ...prev, 4: true })),
      4500,
    );
    const t8 = setTimeout(
      () => setStageUnlocks((prev) => ({ ...prev, 5: true })),
      5500,
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
    };
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  };

  useEffect(() => {
    const cleanup = runChatFlow();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 pb-24 pt-10 transition-colors duration-200">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* Page Header (Stagger 1: 0.05s) */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-10 text-center relative"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>江苏农商联合银行 · 金融大模型全链路架构</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            系统架构与核心技术全景
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            基于大模型的意图解析、知识图谱与多路混合推荐引擎，驱动全行模型资产精准匹配与流转
          </p>
        </motion.div>

        {/* Main Architecture Stack */}
        <div className="flex flex-col gap-8">
          {/* ========================================================================= */}
          {/* 01 业务交互层 */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs relative"
          >
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-black shadow-xs shadow-blue-600/20">
                    01
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    业务交互层
                  </h2>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1 pl-8">
                  BUSINESS INTERACTION LAYER
                </p>
              </div>

              <button
                type="button"
                onClick={runChatFlow}
                disabled={isReplaying}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
              >
                <RotateCw
                  className={cn(
                    "w-3.5 h-3.5",
                    isReplaying && "animate-spin text-blue-600",
                  )}
                />
                <span>
                  {isReplaying ? "交互演示中..." : "重新播放交互演示"}
                </span>
              </button>
            </div>

            {/* Original Clean Horizontal Flow */}
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 sm:gap-4 w-full">
              {/* 1. 业务人员 */}
              <div className="flex flex-col items-center text-center shrink-0 w-24">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-2 shadow-2xs">
                  <User className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  业务人员
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  自然语言需求
                </span>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center text-slate-300 dark:text-slate-700 shrink-0">
                <ChevronRight className="h-4 w-4" />
              </div>

              {/* 2. Chat Bubble (Starts with '...' typing, then transforms into real request) */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 shrink-0 w-full sm:w-[280px] lg:w-[290px] min-h-[90px] flex items-center justify-center shadow-2xs">
                {chatStep === 0 ? (
                  <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                    <span className="text-[11px] text-slate-500">
                      正在组织业务诉求
                    </span>
                    <span className="flex gap-1">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                  </div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed"
                  >
                    "我要筛选县域新客中适合经营贷营销，同时排除近期高风险客户..."
                  </motion.p>
                )}
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center text-slate-300 dark:text-slate-700 shrink-0">
                <ChevronRight className="h-4 w-4" />
              </div>

              {/* 3. 意图识别 */}
              <AnimatePresence>
                {chatStep >= 2 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/40 w-[110px] h-[95px] shrink-0 shadow-2xs"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 mb-1.5">
                      <BrainCircuit className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      意图识别
                    </span>
                    <span className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                      提取业务意图
                    </span>
                  </motion.div>
                ) : (
                  <div className="w-[110px] h-[95px] shrink-0 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center opacity-30">
                    <span className="text-[10px] text-slate-400">...</span>
                  </div>
                )}
              </AnimatePresence>

              {/* Arrow */}
              <div className="hidden lg:flex items-center text-slate-300 dark:text-slate-700 shrink-0">
                <ChevronRight className="h-4 w-4" />
              </div>

              {/* 4. 多轮对话 */}
              <AnimatePresence>
                {chatStep >= 3 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 w-[110px] h-[95px] shrink-0 shadow-2xs"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 mb-1.5">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      多轮对话
                    </span>
                    <span className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                      槽位填充与追问
                    </span>
                  </motion.div>
                ) : (
                  <div className="w-[110px] h-[95px] shrink-0 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center opacity-30">
                    <span className="text-[10px] text-slate-400">...</span>
                  </div>
                )}
              </AnimatePresence>

              {/* Arrow */}
              <div className="hidden lg:flex items-center text-slate-300 dark:text-slate-700 shrink-0">
                <ChevronRight className="h-4 w-4" />
              </div>

              {/* 5. 结构化输出 */}
              <AnimatePresence>
                {chatStep >= 4 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl border border-violet-200 dark:border-violet-800/80 bg-violet-50/50 dark:bg-violet-950/40 w-[110px] h-[95px] shrink-0 shadow-2xs"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/60 text-violet-600 dark:text-violet-400 mb-1.5">
                      <ListTree className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      结构化输出
                    </span>
                    <span className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                      标准化参数格式
                    </span>
                  </motion.div>
                ) : (
                  <div className="w-[110px] h-[95px] shrink-0 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center opacity-30">
                    <span className="text-[10px] text-slate-400">...</span>
                  </div>
                )}
              </AnimatePresence>

              {/* Arrow */}
              <div className="hidden lg:flex items-center text-slate-300 dark:text-slate-700 shrink-0">
                <ChevronRight className="h-4 w-4" />
              </div>

              {/* 6. 需求特征画像 */}
              <AnimatePresence>
                {chatStep >= 5 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, x: 8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 shrink-0 flex-1 min-w-[200px] shadow-2xs"
                  >
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                      <span>需求特征画像</span>
                      <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        JSON
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        信贷风控
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        县域新客
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        贷前阶段
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        经营贷
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        逾期过滤
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 min-w-[200px] h-[95px] shrink-0 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center opacity-30">
                    <span className="text-[10px] text-slate-400">
                      生成中...
                    </span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* 02 智能推荐引擎 */}
          {/* ========================================================================= */}
          <motion.div
            initial="hidden"
            animate={stageUnlocks[2] ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: "easeOut",
                  staggerChildren: 0.2,
                  delayChildren: 0.2,
                },
              },
            }}
            className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs relative overflow-hidden"
          >
            {/* Section Header - Retained Exact Image 2 Style */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white text-xs font-black shadow-xs shadow-blue-600/20">
                    02
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    混合智能推荐引擎
                  </h2>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1.5 pl-9">
                  HYBRID RECOMMENDATION & RE-RANKING ENGINE
                </p>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 font-medium pl-9 sm:pl-0">
                多源异构召回 ➔ 规则熔断 ➔ 交叉精排全链路
              </div>
            </div>

            {/* 5-Stage Pipeline Container Matching Image 1 with Perfect Horizontal Title & Bottom Alignment */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_auto_1fr_auto_1.1fr_auto_1.15fr_auto_1.15fr] items-stretch gap-2.5 xl:gap-3.5 w-full">
              {/* ================= STAGE 1: 多路候选召回 ================= */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="flex flex-col h-full"
              >
                {/* Step Header */}
                <div className="h-11 flex flex-col items-center justify-start mb-3 text-center">
                  <div className="inline-flex items-center justify-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100/90 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-xs font-bold font-mono">
                      01
                    </span>
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      多路候选召回
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                    Multi-Channel Recall
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 flex-1 justify-between">
                  {/* Row 1: 关键词检索 */}
                  <div className="flex items-center justify-between p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-200 group min-h-[58px]">
                    <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
                      <div className="w-8.5 h-8.5 xl:w-9 xl:h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Search className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          关键词检索
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          BM25 词频匹配
                        </div>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-800 shrink-0 ml-1 whitespace-nowrap">
                      Top 20
                    </span>
                  </div>

                  {/* Row 2: 语义向量 */}
                  <div className="flex items-center justify-between p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-700 transition-all duration-200 group min-h-[58px]">
                    <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
                      <div className="w-8.5 h-8.5 xl:w-9 xl:h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Network className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          语义向量
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          BGE Embedding
                        </div>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-800 shrink-0 ml-1 whitespace-nowrap">
                      Top 20
                    </span>
                  </div>

                  {/* Row 3: 图谱关系 */}
                  <div className="flex items-center justify-between p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-700 transition-all duration-200 group min-h-[58px]">
                    <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
                      <div className="w-8.5 h-8.5 xl:w-9 xl:h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Share2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          图谱关系
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          Graph 拓扑推导
                        </div>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-800 shrink-0 ml-1 whitespace-nowrap">
                      Top 15
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Connecting Arrow 1 -> 2 */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.3 } },
                }}
                className="hidden lg:flex items-center justify-center pt-11"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-500 shadow-2xs">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>

              {/* ================= STAGE 2: 候选融合 (Exact Style from Reference Image) ================= */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="flex flex-col h-full items-center justify-between"
              >
                {/* Step Header */}
                <div className="h-11 flex flex-col items-center justify-start mb-2 text-center">
                  <div className="inline-flex items-center justify-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100/90 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-xs font-bold font-mono">
                      02
                    </span>
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      最优融合
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                    互惠等级融合
                  </p>
                </div>

                {/* Main Interactive Celestial Orb Container matching Reference Image */}
                <div className="flex flex-col items-center justify-center flex-1 w-full my-auto py-1">
                  <div className="relative flex items-center justify-center w-48 h-48 select-none">
                    {/* Background Soft Radial Glow */}
                    <div
                      className="absolute inset-0 rounded-full blur-2xl pointer-events-none opacity-75 dark:opacity-60"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 75%)",
                      }}
                    />

                    {/* Subtle Elegant PCB Circuit Board Trace Layer */}
                    <svg
                      viewBox="0 0 200 200"
                      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0 opacity-40 dark:opacity-60"
                    >
                      <defs>
                        <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.7" />
                        </linearGradient>
                      </defs>

                      {/* Top-Left Circuit Bus */}
                      <path
                        d="M 15 35 L 55 35 L 75 55 L 75 75"
                        fill="none"
                        stroke="url(#circuitGrad)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <circle cx="15" cy="35" r="2.5" fill="#38bdf8" />
                      <circle cx="75" cy="75" r="1.8" fill="#93c5fd" />

                      {/* Top-Right Circuit Bus */}
                      <path
                        d="M 185 35 L 145 35 L 125 55 L 125 75"
                        fill="none"
                        stroke="url(#circuitGrad)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <circle cx="185" cy="35" r="2.5" fill="#38bdf8" />
                      <circle cx="125" cy="75" r="1.8" fill="#93c5fd" />

                      {/* Bottom-Left Circuit Bus with subtle flowing pulse */}
                      <path
                        d="M 20 165 L 60 165 L 80 145 L 80 125"
                        fill="none"
                        stroke="url(#circuitGrad)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <circle cx="20" cy="165" r="2.5" fill="#38bdf8" />
                      <circle cx="80" cy="125" r="1.8" fill="#93c5fd" />
                      {/* Pulse on bottom-left trace */}
                      <motion.path
                        d="M 20 165 L 60 165 L 80 145 L 80 125"
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeDasharray="8 60"
                        animate={{ strokeDashoffset: [0, -68] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />

                      {/* Bottom-Right Circuit Bus with subtle flowing pulse */}
                      <path
                        d="M 180 165 L 140 165 L 120 145 L 120 125"
                        fill="none"
                        stroke="url(#circuitGrad)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <circle cx="180" cy="165" r="2.5" fill="#38bdf8" />
                      <circle cx="120" cy="125" r="1.8" fill="#93c5fd" />
                      {/* Pulse on bottom-right trace */}
                      <motion.path
                        d="M 180 165 L 140 165 L 120 145 L 120 125"
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeDasharray="8 60"
                        animate={{ strokeDashoffset: [0, -68] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                      />

                      {/* Geometric Micro Chip Pad Markers */}
                      <rect x="97" y="16" width="6" height="6" rx="1.5" fill="#38bdf8" opacity="0.6" />
                      <line x1="100" y1="22" x2="100" y2="40" stroke="url(#circuitGrad)" strokeWidth="1" strokeDasharray="2 3" />
                      <rect x="97" y="178" width="6" height="6" rx="1.5" fill="#38bdf8" opacity="0.6" />
                      <line x1="100" y1="178" x2="100" y2="160" stroke="url(#circuitGrad)" strokeWidth="1" strokeDasharray="2 3" />
                    </svg>

                    {/* Orbit Ellipse Ring (Tilted SVG) - Back Half (Z-0): Clean Single Stroke */}
                    <svg
                      viewBox="0 0 180 180"
                      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
                      style={{
                        transform: "rotate(-28deg)",
                        clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
                      }}
                    >
                      <ellipse
                        cx="90"
                        cy="90"
                        rx="78"
                        ry="42"
                        fill="none"
                        stroke="#60a5fa"
                        strokeOpacity="0.85"
                        strokeWidth="1.5"
                      />
                    </svg>

                    {/* Orbit Ellipse Ring (Tilted SVG) - Front Half (Z-20): Clean Single Stroke */}
                    <svg
                      viewBox="0 0 180 180"
                      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
                      style={{
                        transform: "rotate(-28deg)",
                        clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
                      }}
                    >
                      <ellipse
                        cx="90"
                        cy="90"
                        rx="78"
                        ry="42"
                        fill="none"
                        stroke="#60a5fa"
                        strokeOpacity="0.85"
                        strokeWidth="1.5"
                      />
                    </svg>

                    {/* Orbiting Satellite System: Blue Planetary Spheres matching reference */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      {/* Satellite 1: Phase 0 */}
                      <OrbitingSatellite
                        phase={0}
                        size={14}
                        colorClass="bg-gradient-to-br from-blue-200 via-blue-400 to-blue-700"
                        shadowClass="0 2px 8px rgba(37,99,235,0.5)"
                      />

                      {/* Satellite 2: Phase 120 */}
                      <OrbitingSatellite
                        phase={(Math.PI * 2) / 3}
                        size={12}
                        colorClass="bg-gradient-to-br from-blue-200 via-blue-400 to-blue-700"
                        shadowClass="0 2px 6px rgba(37,99,235,0.45)"
                      />

                      {/* Satellite 3: Phase 240 */}
                      <OrbitingSatellite
                        phase={(Math.PI * 4) / 3}
                        size={16}
                        colorClass="bg-gradient-to-br from-blue-200 via-blue-400 to-blue-700"
                        shadowClass="0 3px 10px rgba(37,99,235,0.55)"
                      />
                    </div>

                    {/* Multi-layered Translucent Fusion Sphere */}
                    <div className="relative flex items-center justify-center w-28 h-28 z-10">
                      {/* Organic Petal Layer 1 */}
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-[-6px] rounded-[42%_58%_70%_30%/45%_45%_55%_55%] bg-gradient-to-tr from-sky-400/40 via-blue-500/30 to-indigo-500/40 blur-[1px]"
                      />

                      {/* Organic Petal Layer 2 */}
                      <motion.div
                        animate={{ rotate: [360, 0] }}
                        transition={{
                          duration: 24,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-[-4px] rounded-[58%_42%_30%_70%/55%_55%_45%_45%] bg-gradient-to-bl from-blue-400/40 via-cyan-400/30 to-purple-500/30 blur-[1px]"
                      />

                      {/* Organic Petal Layer 3 - Glow */}
                      <div className="absolute inset-[-2px] rounded-full bg-gradient-to-tr from-blue-400/60 via-sky-300/60 to-indigo-400/60 blur-[3px]" />

                      {/* Core Glowing Ball with RRF Typography */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="relative z-10 flex flex-col items-center justify-center w-24 h-24 rounded-full text-white cursor-pointer shadow-lg overflow-hidden"
                        style={{
                          background:
                            "radial-gradient(circle at 38% 32%, #38bdf8 0%, #2563eb 45%, #1d4ed8 75%, #1e40af 100%)",
                          boxShadow:
                            "0 8px 24px rgba(37,99,235,0.45), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(30,58,138,0.5)",
                        }}
                      >
                        <span className="text-[20px] font-black tracking-wider leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                          RRF
                        </span>
                        <span className="text-[11px] font-bold tracking-widest mt-1 text-blue-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                          融合算法
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Subtitle Under Sphere: k = 60 · 平滑 */}
                  <div className="text-center mt-1">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-400 font-mono tracking-wider">
                      k = 60 · 平滑
                    </span>
                  </div>

                  {/* Bottom Feature Tag: 3-Bar Chart Icon + 多路权重天线 */}
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <div className="flex items-end gap-[2px] h-3.5 pb-0.5">
                      <span className="w-1 h-2 bg-blue-600 dark:bg-blue-400 rounded-xs" />
                      <span className="w-1 h-2.5 bg-blue-500 dark:bg-blue-300 rounded-xs" />
                      <span className="w-1 h-3.5 bg-sky-400 dark:bg-sky-300 rounded-xs" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      多路权重天线
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Connecting Arrow 2 -> 3 */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.3 } },
                }}
                className="hidden lg:flex items-center justify-center pt-11"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-500 shadow-2xs">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>

              {/* ================= STAGE 3: 硬约束过滤 (Centered Text Inside Box) ================= */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="flex flex-col h-full"
              >
                {/* Step Header */}
                <div className="h-11 flex flex-col items-center justify-start mb-3 text-center">
                  <div className="inline-flex items-center justify-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100/90 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-xs font-bold font-mono">
                      03
                    </span>
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      硬约束过滤
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                    Hard Constraints Gate
                  </p>
                </div>

                {/* Centered Checklist Card Container */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 xl:p-4 shadow-xs flex flex-col justify-center items-center flex-1">
                  <div className="w-fit mx-auto flex flex-col gap-2.5 justify-center h-full">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        模型上线状态
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        权限与隔离控制
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        客群适用范围
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        业务适用阶段
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        必要数据依赖
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        合规审计标准
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Connecting Arrow 3 -> 4 */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.3 } },
                }}
                className="hidden lg:flex items-center justify-center pt-11"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-500 shadow-2xs">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>

              {/* ================= STAGE 4: 精排与打分 ================= */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="flex flex-col h-full"
              >
                {/* Step Header */}
                <div className="h-11 flex flex-col items-center justify-start mb-3 text-center">
                  <div className="inline-flex items-center justify-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100/90 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-xs font-bold font-mono">
                      04
                    </span>
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      精排与打分
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                    Fine-grained Scoring
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 flex-1 justify-between">
                  {/* Row 1: BGE Reranker */}
                  <div className="flex items-center justify-between p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-700 transition-all duration-200 group min-h-[58px]">
                    <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
                      <div className="w-8.5 h-8.5 xl:w-9 xl:h-9 rounded-full bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          BGE Reranker
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          深度交叉注意力重排
                        </div>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded-md border border-purple-200/80 dark:border-purple-800 shrink-0 ml-1 whitespace-nowrap">
                      Score
                    </span>
                  </div>

                  {/* Row 2: 图谱软约束融合 */}
                  <div className="flex items-center justify-between p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-200 group min-h-[58px]">
                    <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
                      <div className="w-8.5 h-8.5 xl:w-9 xl:h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Network className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          图谱软约束融合
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          置信度相关性校准
                        </div>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-800 shrink-0 ml-1 whitespace-nowrap">
                      Weight
                    </span>
                  </div>

                  {/* Row 3: 多目标效用优化 */}
                  <div className="flex items-center justify-between p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-amber-400 dark:hover:border-amber-700 transition-all duration-200 group min-h-[58px]">
                    <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
                      <div className="w-8.5 h-8.5 xl:w-9 xl:h-9 rounded-full bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          多目标效用优化
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          延迟业务收益平衡
                        </div>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-800 shrink-0 ml-1 whitespace-nowrap">
                      Utility
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Connecting Arrow 4 -> 5 */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.3 } },
                }}
                className="hidden lg:flex items-center justify-center pt-11"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-500 shadow-2xs">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>

              {/* ================= STAGE 5: 最终推荐 ================= */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="flex flex-col h-full"
              >
                {/* Step Header */}
                <div className="h-11 flex flex-col items-center justify-start mb-3 text-center">
                  <div className="inline-flex items-center justify-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100/90 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-xs font-bold font-mono">
                      05
                    </span>
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      最终推荐
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                    Ranked Results
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 flex-1 justify-between">
                  {/* Row 1: 单模型 Top3 */}
                  <div className="flex items-center justify-between p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-200 group min-h-[58px]">
                    <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
                      <div className="w-8.5 h-8.5 xl:w-9 xl:h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          单模型 Top3
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          高适配模型直接调用
                        </div>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-800 shrink-0 ml-1 whitespace-nowrap">
                      高置信
                    </span>
                  </div>

                  {/* Row 2: 组合工作流 */}
                  <div className="flex items-center justify-between p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-700 transition-all duration-200 group min-h-[58px]">
                    <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
                      <div className="w-8.5 h-8.5 xl:w-9 xl:h-9 rounded-full bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Rocket className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          组合工作流
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          多模型协同拓扑编排
                        </div>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-800 shrink-0 ml-1 whitespace-nowrap">
                      Pipeline
                    </span>
                  </div>

                  {/* Row 3: 规则降级兜底 */}
                  <div className="flex items-center justify-between p-2.5 xl:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-700 transition-all duration-200 group min-h-[58px]">
                    <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
                      <div className="w-8.5 h-8.5 xl:w-9 xl:h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          规则降级兜底
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          熔断保护与安全策略
                        </div>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800 shrink-0 ml-1 whitespace-nowrap">
                      Fallback
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* 03 知识与数据底座 & 基础设施层 */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 w-full items-stretch">
            {/* 03 知识与数据底座 (Ultra-Responsive Hardware-Accelerated 120fps Hover Cards) */}
            <SequenceSection
              unlock={stageUnlocks[3]}
              delay={0}
              className="xl:col-span-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full"
            >
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-black shadow-xs shadow-blue-600/20">
                      03
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      知识与数据底座
                    </h2>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1 pl-8">
                    KNOWLEDGE & DATA FOUNDATION · 核心资产库
                  </p>
                </div>

                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 self-start sm:self-auto ml-8 sm:ml-0 whitespace-nowrap">
                  全行标准化资产库 (60+ 核心模型)
                </span>
              </div>

              {/* 5 Ultra-Fast Responsive Cards (Native CSS Hardware-Accelerated Transforms, Zero Delay) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full flex-1 items-stretch">
                <DeckCard index={0}>
                  <FastCard
                    icon={Database}
                    title="ModelCard 库"
                    subtitle="标准元数据定义"
                    tag="60 个核心模型"
                    items={["输入输出定义", "性能指标基准", "合规审查档案"]}
                    color="blue"
                  />
                </DeckCard>

                <DeckCard index={1}>
                  <FastCard
                    icon={Layers}
                    title="Taxonomy 体系"
                    subtitle="四维分类体系"
                    tag="层级化知识树"
                    items={["业务领域与场景", "产品类型映射", "能力粒度细分"]}
                    color="indigo"
                  />
                </DeckCard>

                <DeckCard index={2}>
                  <FastCard
                    icon={Network}
                    title="证据图谱"
                    subtitle="实体与关系拓扑"
                    tag="多跳推理引擎"
                    items={["模型协同关系", "上下游数据依赖", "业务可解释因果"]}
                    color="purple"
                  />
                </DeckCard>

                <DeckCard index={3}>
                  <FastCard
                    icon={Search}
                    title="检索索引"
                    subtitle="混合检索引擎"
                    tag="毫秒级响应"
                    items={[
                      "BGE-Large 向量",
                      "BM25 倒排索引",
                      "动态 HNSW 索引",
                    ]}
                    color="sky"
                  />
                </DeckCard>

                <DeckCard index={4}>
                  <FastCard
                    icon={Box}
                    title="模型市场"
                    subtitle="资产发布与编排"
                    tag="标准化 API"
                    items={["REST/gRPC 接入", "工作流在线编排", "版本灰度发布"]}
                    color="emerald"
                  />
                </DeckCard>
              </div>
            </SequenceSection>

            {/* 04 基础设施与算力保障 (Clean Contained Layout - No Overflow) */}
            <SequenceSection
              unlock={stageUnlocks[4]}
              delay={0.2}
              className="xl:col-span-4 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full"
            >
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-black shadow-xs shadow-blue-600/20">
                      04
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      基础设施与算力保障
                    </h2>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1 pl-8">
                    INFRASTRUCTURE & SECURITY
                  </p>
                </div>

                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto ml-8 sm:ml-0 whitespace-nowrap">
                  金融信创高可用 (99.99%)
                </span>
              </div>

              {/* 2x2 Clean Auto-fit Grid matching Section 03 height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1 items-stretch">
                <InfraCard
                  icon={Cloud}
                  title="金融私有云"
                  desc="信创私有容器云，实现物理高可用隔离"
                  status="正常运行"
                />
                <InfraCard
                  icon={Cpu}
                  title="GPU/NPU 算力"
                  desc="异构算力集群加速，动态批量调度优化"
                  status="低延迟"
                />
                <InfraCard
                  icon={Zap}
                  title="API Gateway"
                  desc="微秒级路由分发，令牌桶流控安全鉴权"
                  status="高并发"
                />
                <InfraCard
                  icon={ShieldCheck}
                  title="全链路风控合规"
                  desc="数据脱敏传输，端到端审计与合规追踪"
                  status="安全合规"
                />
              </div>
            </SequenceSection>
          </div>

          {/* ========================================================================= */}
          {/* 离线治理平面 (Stagger 5: 0.85s, Unified Slate/Blue Theme, Fixed Border Clipping) */}
          {/* ========================================================================= */}
          <SequenceSection
            unlock={stageUnlocks[5]}
            delay={0.1}
            className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs relative"
          >
            {/* Header */}
            <div className="mb-6 flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-black shadow-xs shadow-blue-600/20">
                  05
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  离线治理与闭环演进平面
                </h2>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1 pl-8">
                OFFLINE GOVERNANCE & CONTINUOUS EVALUATION PLANE
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-5 items-stretch w-full">
              {/* Stepper Pipeline - with seamless stretch and alignment */}
              <div className="lg:col-span-8 flex items-center justify-between gap-1.5 xl:gap-2.5 w-full">
                <GovernanceStepNode
                  num="01"
                  icon={Database}
                  title="数据治理"
                  desc="特征清洗标准化"
                  color="blue"
                  delay={0.2}
                />
                <GovernanceStepDivider />

                <GovernanceStepNode
                  num="02"
                  icon={User}
                  title="AI/人工复核"
                  desc="双重合规校验"
                  color="indigo"
                  delay={0.5}
                />
                <GovernanceStepDivider />

                <GovernanceStepNode
                  num="03"
                  icon={Activity}
                  title="评测体系"
                  desc="基准指标评估"
                  color="violet"
                  delay={0.8}
                />
                <GovernanceStepDivider />

                <GovernanceStepNode
                  num="04"
                  icon={Settings}
                  title="校准优化"
                  desc="置信阈值调优"
                  color="purple"
                  delay={1.1}
                />
                <GovernanceStepDivider />

                <GovernanceStepNode
                  num="05"
                  icon={Activity}
                  title="漂移监控"
                  desc="推荐衰减报警"
                  color="amber"
                  delay={1.4}
                />
                <GovernanceStepDivider />

                <GovernanceStepNode
                  num="06"
                  icon={GitCommit}
                  title="版本发布"
                  desc="Bundle交付上线"
                  color="emerald"
                  delay={1.7}
                />

                {/* Transition Arrow leading into Version Bundle */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.5 },
                    visible: { opacity: 1, scale: 1, transition: { delay: 1.8, duration: 0.4 } },
                  }}
                  className="hidden xl:flex items-center justify-center shrink-0 pl-1"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-500 shadow-2xs">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>
              </div>

              {/* Version Bundle Info Box */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0, transition: { delay: 2.0, duration: 0.5, ease: "easeOut" } },
                }}
                className="lg:col-span-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20 p-4 xl:p-4.5 shadow-2xs flex flex-col justify-between h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        统一版本管理包
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        v2.4.0 稳定版
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      版本Bundle一体化优先与灰度上线
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Layers className="h-4 w-4" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">数据集 (体育集)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">精排权重</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">ModelCard (资产库)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">提示 (提示词)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Graph (图谱元数据)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">LLM配置 (模型配置)</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </SequenceSection>

          {/* Footer Note */}
          <div className="text-center pt-4 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>
              江苏农商联合银行 · 大模型驱动的模型市场智能推荐助手 ·
              企业级信创架构设计
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// High-framerate, ultra-responsive ("极其跟手") CSS GPU-accelerated card
const FastCard = ({
  icon: Icon,
  title,
  subtitle,
  tag,
  items,
  color,
}: {
  icon: any;
  title: string;
  subtitle: string;
  tag: string;
  items: string[];
  color: "blue" | "indigo" | "purple" | "sky" | "emerald";
}) => {
  const colorTheme = {
    blue: {
      border: "hover:border-blue-500 dark:hover:border-blue-400",
      glow: "hover:shadow-[0_16px_30px_-6px_rgba(59,130,246,0.22)]",
      iconBg:
        "bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      tag: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      accent: "bg-blue-500",
    },
    indigo: {
      border: "hover:border-indigo-500 dark:hover:border-indigo-400",
      glow: "hover:shadow-[0_16px_30px_-6px_rgba(99,102,241,0.22)]",
      iconBg:
        "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      tag: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      accent: "bg-indigo-500",
    },
    purple: {
      border: "hover:border-purple-500 dark:hover:border-purple-400",
      glow: "hover:shadow-[0_16px_30px_-6px_rgba(168,85,247,0.22)]",
      iconBg:
        "bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      tag: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      accent: "bg-purple-500",
    },
    sky: {
      border: "hover:border-sky-500 dark:hover:border-sky-400",
      glow: "hover:shadow-[0_16px_30px_-6px_rgba(14,165,233,0.22)]",
      iconBg:
        "bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800",
      tag: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      accent: "bg-sky-500",
    },
    emerald: {
      border: "hover:border-emerald-500 dark:hover:border-emerald-400",
      glow: "hover:shadow-[0_16px_30px_-6px_rgba(16,185,129,0.22)]",
      iconBg:
        "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      tag: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      accent: "bg-emerald-500",
    },
  }[color];

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 xl:p-4 cursor-pointer relative overflow-hidden flex flex-col justify-between h-full group",
        "transition-all duration-150 ease-out will-change-transform",
        "hover:-translate-y-1.5 hover:shadow-md hover:z-20",
        colorTheme.border,
        colorTheme.glow,
      )}
      style={{ minHeight: "220px", transform: "translate3d(0,0,0)" }}
    >
      {/* Top Card Highlight Line on Hover */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          colorTheme.accent,
        )}
      />

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl border transition-transform duration-150 group-hover:scale-105 shadow-xs shrink-0",
              colorTheme.iconBg,
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <span
            className={cn(
              "text-[9.5px] font-bold px-2 py-0.5 rounded-full border shadow-2xs whitespace-nowrap",
              colorTheme.tag,
            )}
          >
            {tag}
          </span>
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150 whitespace-nowrap">
          {title}
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight whitespace-nowrap">
          {subtitle}
        </p>
      </div>

      {/* Card Items List */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
        {items.map((item: string, i: number) => (
          <div
            key={i}
            className="flex items-center gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-400"
          >
            <span className="h-1 w-1 rounded-full bg-slate-400 group-hover:bg-blue-500 transition-colors duration-150 shrink-0" />
            <span className="truncate">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Infrastructure Card (Compact and cleanly contained)
const InfraCard = ({ icon: Icon, title, desc, status }: any) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, scale: 0.95, y: 15 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", bounce: 0.3 },
      },
    }}
    className="flex flex-col justify-between p-3.5 xl:p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-150 h-full min-h-[105px] group relative overflow-hidden"
  >
    <div className="flex items-start justify-between mb-2 relative z-10">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200/80 dark:border-slate-700 shadow-xs shrink-0 group-hover:scale-110 transition-transform">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 shrink-0 whitespace-nowrap">
        {status}
      </span>
    </div>
    <div className="relative z-10">
      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">
        {title}
      </h4>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
        {desc}
      </p>
    </div>

    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
  </motion.div>
);

// Offline Governance Step Node
const GovernanceStepNode = ({
  num,
  icon: Icon,
  title,
  desc,
  color,
  delay = 0,
}: any) => {
  const colorStyles: any = {
    blue: "bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-800",
    indigo:
      "bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-800",
    violet:
      "bg-violet-50/70 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200/80 dark:border-violet-800",
    purple:
      "bg-purple-50/70 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/80 dark:border-purple-800",
    amber:
      "bg-amber-50/70 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800",
    emerald:
      "bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800",
  };

  const barColors: any = {
    blue: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    indigo: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]",
    violet: "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]",
    purple: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]",
    amber: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    emerald: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.9, y: 15 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: "spring", bounce: 0.4, duration: 0.6 },
        },
      }}
      className="flex-1 min-w-[95px] max-w-[130px] h-full flex flex-col justify-between items-center text-center p-3 xl:p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-xs transition-colors duration-200 group relative overflow-hidden"
    >
      <div className="flex flex-col items-center z-10 w-full">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border mb-2 relative group-hover:scale-105 transition-transform",
            colorStyles[color],
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-slate-800 dark:bg-slate-700 text-white text-[8.5px] font-bold font-mono rounded-full shadow-2xs">
            {num}
          </span>
        </div>
        <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1 whitespace-nowrap">
          {title}
        </span>
      </div>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight whitespace-nowrap mt-1 z-10">
        {desc}
      </span>

      {/* Pipeline Scanning Bar */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-slate-100 dark:bg-slate-800 w-full">
        <motion.div
          variants={{
            hidden: { width: "0%" },
            visible: {
              width: "100%",
              transition: { duration: 1.5, delay: delay, ease: "linear" },
            },
          }}
          className={cn("h-full", barColors[color])}
        />
      </div>
    </motion.div>
  );
};

// Divider arrow for offline governance
const GovernanceStepDivider = () => (
  <motion.div
    variants={{
      hidden: { opacity: 0, scale: 0.5 },
      visible: { opacity: 1, scale: 1 },
    }}
    className="hidden lg:flex items-center justify-center shrink-0"
  >
    <div className="w-5 h-5 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 flex items-center justify-center text-blue-500 shadow-2xs">
      <ArrowRight className="h-2.5 w-2.5" />
    </div>
  </motion.div>
);
