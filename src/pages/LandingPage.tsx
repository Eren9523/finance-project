import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Bot, Target, Network, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bigLogo } from '../data/logos';
import { useSettings } from '../contexts/SettingsContext';

export const LandingPage = () => {
  const { t } = useSettings();
  const [chatState, setChatState] = useState<'hidden' | 'user' | 'thinking' | 'response'>('hidden');

  const stats = [
    { label: t('意图识别准确率'), value: '93%' },
    { label: t('标签转换准确率'), value: '90%' },
    { label: t('Top3 命中率'), value: '85%' },
    { label: t('覆盖模型场景'), value: '100+' },
  ];

  const features = [
    {
      icon: Bot,
      title: t('听懂业务语言'),
      description: t('无需算法背景，直接用自然语言描述业务场景与痛点，AI自动解析结构化需求。'),
    },
    {
      icon: Target,
      title: t('智能匹配单模型'),
      description: t('多维适配度评分，从海量模型资产库中精准召回并推荐最契合的业务模型。'),
    },
    {
      icon: Network,
      title: t('多模型组合编排'),
      description: t('针对复杂业务场景，自动串联多个模型，形成完整的防线与价值闭环。'),
    },
    {
      icon: ShieldCheck,
      title: t('可解释性推荐'),
      description: t('详细展示推荐理由、合规边界、性能指标与历史落地案例，保障安全可信。'),
    },
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setChatState('user'), 600);
    const t2 = setTimeout(() => setChatState('thinking'), 1200);
    const t3 = setTimeout(() => setChatState('response'), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-24 pb-32">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white dark:from-blue-950/20 dark:via-slate-950 dark:to-slate-950" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-left lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <img src={bigLogo} alt="江苏农商联合银行" className="h-16 w-auto object-contain dark:brightness-110" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-6"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                {t('第五届中国研究生金融科技创新大赛')}
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl mb-6"
              >
                <span className="inline-block whitespace-nowrap">{t('大模型驱动的模型市场')}</span>
                <br />
                <span className="text-blue-600 dark:text-blue-400 mt-2 block whitespace-nowrap">
                  {t('智能推荐助手')}
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300"
              >
                {t('让业务人员通过自然语言快速完成模型选型、组合推荐与结果获取。打破技术壁垒，赋能一线业务，实现金融资产价值最大化。')}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-10 flex items-center gap-4"
              >
                <Link
                  to="/workbench"
                  className="group flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 dark:bg-blue-500 px-8 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5"
                >
                  {t('开始智能推荐')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/architecture"
                  className="flex h-12 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  {t('查看系统架构')}
                </Link>
              </motion.div>
            </div>

            {/* Right Mock Chat Window */}
            <div className="relative mt-12 lg:mt-0 w-full max-w-[520px] mx-auto lg:ml-auto lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                {/* Solid shadow behind the window */}
                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/60 rounded-2xl translate-x-4 translate-y-4 shadow-sm" />
                
                {/* Main Window */}
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[420px]">
                  {/* Browser Header */}
                  <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                    <div className="flex gap-1.5 w-16">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 text-xs px-6 py-1.5 rounded-md flex items-center justify-center font-mono">
                        ai-studio.jsrcb.com
                      </div>
                    </div>
                    <div className="w-16" />
                  </div>
                  
                  {/* Chat Area */}
                  <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-6 relative bg-slate-50/30 dark:bg-slate-950/30 flex flex-col justify-end pb-16">
                    <AnimatePresence>
                      {chatState !== 'hidden' && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="self-end bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm"
                        >
                          <p className="text-sm leading-relaxed">
                            {t('我需要给县域的新市民做首贷营销，有什么好的模型推荐吗？要求能直接输出触达名单。')}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="min-h-[160px] flex flex-col justify-start relative w-full">
                      <AnimatePresence mode="wait">
                        {chatState === 'thinking' && (
                          <motion.div
                            key="thinking"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, display: 'none' }}
                            className="self-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm absolute top-0 left-0 w-[90%]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Bot className="w-4 h-4" />
                              </div>
                              <div className="flex space-x-1 items-center h-4">
                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{t('正在分析意图并匹配模型...')}</span>
                            </div>
                          </motion.div>
                        )}

                        {chatState === 'response' && (
                          <motion.div
                            key="response"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="self-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm absolute top-0 left-0"
                          >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mt-0.5">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div className="flex-1 space-y-3">
                              <p className="text-sm text-slate-700 dark:text-slate-200">
                                {t('已为您解析需求，并匹配到最适合的模型组合：')}
                              </p>
                              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 space-y-2.5 border border-slate-100 dark:border-slate-700/60">
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                  <span>{t('领域')}: {t('客户营销')}</span>
                                  <span className="text-slate-300 dark:text-slate-600">|</span>
                                  <span>{t('客群')}: {t('新市民')}</span>
                                  <span className="text-slate-300 dark:text-slate-600">|</span>
                                  <span>{t('输出')}: {t('名单')}</span>
                                </div>
                                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                  {t('推荐')}: {t('县域新市民首贷客群精准营销模型')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    </div>
                  </div>

                  {/* Bottom fade mask */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-slate-900 py-16 border-y border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <dt className="text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{stat.label}</dt>
                <dd className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              {t('核心业务价值')}
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              {t('针对行业痛点，我们打造了闭环的智能模型推荐体系，降低使用门槛，提升科技赋能业务效率。')}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 transition-all hover:shadow-lg hover:ring-blue-200 dark:hover:ring-blue-800"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);
