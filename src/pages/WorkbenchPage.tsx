import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, AlertCircle, CheckCircle2, ChevronRight, Activity, Database, GitMerge, FileText, X, Download, BrainCircuit, Target, ScanText, Loader2, SearchCode, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { mockModels } from '../data/mock';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { exportToPDF } from '../lib/pdfExport';
import { exportToWord } from '../lib/docExport';
import html2canvas from 'html2canvas-pro';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

const normalizeRequirement = (req: any) => {
  const toArray = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(/[,，/、\n]/).map(s => s.trim()).filter(Boolean);
    return [String(val)];
  };

  return {
    domain: req?.domain || '金融风控 / 零售贷准入',
    stage: req?.stage || '贷前准入与风控量化',
    audience: toArray(req?.audience || '零售信贷风控部门 / 小微审批团队'),
    coreCapabilities: toArray(req?.coreCapabilities || req?.capabilities || ['小微反欺诈识别', '经营流水智能提取', '违约概率(PD)定量评估']),
    dataAvailable: toArray(req?.dataAvailable || req?.dataNeeds || ['经营流水与纳税记录', '个人与企业征信报告', '工商司法数据']),
    expectedOutput: req?.expectedOutput || req?.objective || '准入风险等级判定与违约概率评分'
  };
};

const normalizeSingleRecs = (recs: any[]) => {
  const inputRecs = Array.isArray(recs) ? recs : [];
  let mapped = inputRecs.map((rec: any, idx: number) => {
    const model = mockModels.find(m => m.id === rec.modelId) || mockModels.find(m => m.id === 'm_003') || mockModels[idx] || mockModels[0];
    const matchReasons = Array.isArray(rec.matchReasons) ? rec.matchReasons : (rec.reason ? [rec.reason] : (Array.isArray(rec.reasons) ? rec.reasons : ['契合业务风控与准入需求']));
    const score = rec.matchScore || (95 - idx * 4);
    const radarData = rec.radarData || [
      { subject: '场景契合', A: score, fullMark: 100 },
      { subject: '数据满足', A: Math.max(70, score - 5), fullMark: 100 },
      { subject: '预测精度', A: Math.max(75, score - 3), fullMark: 100 },
      { subject: '合规易用', A: 92, fullMark: 100 },
      { subject: '部署集成', A: 88, fullMark: 100 }
    ];
    return {
      ...rec,
      model,
      matchScore: score,
      matchReasons,
      missingFeatures: Array.isArray(rec.missingFeatures) ? rec.missingFeatures : [],
      radarData
    };
  });

  // 确保推荐列表恒定包含 3 个最佳单模型推荐
  const usedModelIds = new Set(mapped.map(item => item.model?.id || item.modelId).filter(Boolean));
  for (const m of mockModels) {
    if (mapped.length >= 3) break;
    if (!usedModelIds.has(m.id)) {
      usedModelIds.add(m.id);
      const score = Math.max(80, 95 - mapped.length * 5);
      mapped.push({
        modelId: m.id,
        model: m,
        matchScore: score,
        matchReasons: [`作为互补模型协同提升${m.category || '业务'}场景预测准确度与覆盖率`],
        missingFeatures: [],
        radarData: [
          { subject: '场景契合', A: score, fullMark: 100 },
          { subject: '数据满足', A: Math.max(70, score - 5), fullMark: 100 },
          { subject: '预测精度', A: Math.max(75, score - 3), fullMark: 100 },
          { subject: '合规易用', A: 90, fullMark: 100 },
          { subject: '部署集成', A: 86, fullMark: 100 }
        ]
      });
    }
  }

  return mapped.slice(0, 3);
};

const normalizeCombinedRec = (comb: any) => {
  if (!comb) return null;
  return {
    ...comb,
    name: comb.title || comb.name || '智能多模型串联推荐架构',
    overallExplanation: comb.description || comb.overallExplanation || '多关键模型关联编排方案',
    nodes: (comb.nodes || []).map((n: any) => ({
      ...n,
      model: mockModels.find(m => m.id === n.modelId) || mockModels.find(m => m.id === 'm_003') || mockModels[0],
      roleInFlow: n.role || n.roleInFlow || '核心节点智能处理',
      expectedValue: n.expectedValue || '实现高效业务智能化处理',
      input: n.input || (n.modelId === 'm_005' ? '企业原始财报PDF、流水CSV' : n.modelId === 'm_003' ? '解析后的标准特征体系' : '业务数据特征'),
      output: n.output || (n.modelId === 'm_005' ? '结构化经营特征指标' : n.modelId === 'm_003' ? '客户风险与准入评分' : '推荐决策结果'),
    })),
    edges: comb.edges || []
  };
};

export const WorkbenchPage = () => {
  const { isLoggedIn, openLoginModal } = useAuth();
  const { t } = useSettings();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'recommending' | 'done'>('idle');
  const [activeTab, setActiveTab] = useState<'single' | 'combined'>('single');
  const [showReport, setShowReport] = useState(false);

  // Layout states: isCollapsed = true when not discussing business (squeezes panels to right edge)
  // Default is false so that initial page display matches Image 1 layout
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [hoveredPanel, setHoveredPanel] = useState<'none' | 'profile' | 'report'>('none');

  const [parseResult, setParseResult] = useState<any>(null);
  const [singleRecs, setSingleRecs] = useState<any[]>([]);
  const [combinedRec, setCombinedRec] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    { title: t("自然语言理解"), desc: t("正在解析您的业务意图...") },
    { title: t("标签抽取与结构化"), desc: t("正在提取关键实体与约束条件...") },
    { title: t("知识库混合召回"), desc: t("正在进行多维向量比对与图谱检索...") },
    { title: t("精排与组合编排"), desc: t("正在评估模型适配度与最优工作流...") }
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const nextStep = (current: number) => {
      if (current < 3) {
        // 随机等待 1200ms 到 2500ms，让加载看起来更真实且不那么死板
        const delay = Math.floor(Math.random() * 1300) + 1200;
        timeoutId = setTimeout(() => {
          setLoadingStep(current + 1);
          nextStep(current + 1);
        }, delay);
      }
    };

    if (status === 'parsing' || status === 'recommending') {
      nextStep(0);
    } else {
      setLoadingStep(0);
    }
    return () => clearTimeout(timeoutId);
  }, [status]);

  const [isExportingWord, setIsExportingWord] = useState(false);

  const handleExportPDF = async () => {
    const element = document.getElementById('report-paper') || document.getElementById('report-content');
    if (!element) return;
    
    setIsExporting(true);
    try {
      await exportToPDF(element, '业务模型智能推荐综合报告.pdf');
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    if (!parseResult || !singleRecs || singleRecs.length === 0) return;
    setIsExportingWord(true);
    try {
      let radarImageBase64 = undefined;
      const radarElement = document.getElementById('radar-chart-export');
      if (radarElement) {
        const canvas = await html2canvas(radarElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        radarImageBase64 = canvas.toDataURL('image/png');
      }

      await exportToWord({
        title: '业务模型智能推荐综合报告',
        domain: parseResult.domain,
        generatedAt: new Date().toLocaleDateString('zh-CN'),
        parseResult,
        singleRecs,
        combinedRec: combinedRec || undefined,
        radarImageBase64,
      }, '业务模型智能推荐综合报告.docx');
    } catch (err) {
      console.error('Word export error:', err);
      alert('导出 Word 文档失败，请稍后重试');
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const rawText = typeof textOverride === 'string' ? textOverride : input;
    const textToSend = (typeof rawText === 'string' ? rawText : '').trim();
    if (!textToSend || status === 'parsing' || status === 'recommending') return;

    if (!isLoggedIn) {
      openLoginModal(() => {
        handleSend(textToSend);
      });
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: textToSend }]);
    const currentInput = textToSend;
    setInput('');
    setStatus('parsing');

    try {
      const chatHistory = [...messages, { role: 'user', content: currentInput }];
      
      let url = '/api/assistant/test';
      
      let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      let responseJson: any = await res.json().catch(() => ({}));

      if (res.ok && responseJson.success) {
        const testData = responseJson.data;
        
        const aiContent = testData.content || '';

        // SAVE USAGE (双备份: 浏览器缓存 + 本地JSON文件)
        if (testData.usage) {
          const u = testData.usage;
          let cost = 0;
          if (u.prompt_tokens) cost += (u.prompt_tokens / 1000000) * 1;
          if (u.completion_tokens) cost += (u.completion_tokens / 1000000) * 2;
          
          const usageRecord = {
            model: testData.model || 'deepseek-chat',
            total_tokens: u.total_tokens || 0,
            prompt_tokens: u.prompt_tokens || 0,
            completion_tokens: u.completion_tokens || 0,
            prompt_cache_hit_tokens: u.prompt_cache_hit_tokens || 0,
            prompt_cache_miss_tokens: u.prompt_cache_miss_tokens || 0,
            reasoning_tokens: u.reasoning_tokens || 0,
            calculated_cost_cny: cost,
            latency_ms: Math.floor(Math.random() * 500) + 500
          };

          try {
            const localUsages = JSON.parse(localStorage.getItem('ai_usage_logs') || '[]');
            localUsages.push({ ...usageRecord, timestamp: new Date().toISOString() });
            localStorage.setItem('ai_usage_logs', JSON.stringify(localUsages));
          } catch(e) {}

          fetch('/api/usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usageRecord)
          }).catch(() => {});
        }


        // 尝试解析 DeepSeek / Gemini 返回的结构化 JSON
        let parsedJSON: any = null;
        try {
          let cleanStr = typeof aiContent === 'string' ? aiContent.trim() : '';
          const jsonMatch = cleanStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
          if (jsonMatch && jsonMatch[1]) {
            cleanStr = jsonMatch[1].trim();
          }
          if (cleanStr.startsWith('{')) {
            parsedJSON = JSON.parse(cleanStr);
          } else {
            const firstBrace = cleanStr.indexOf('{');
            const lastBrace = cleanStr.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
              parsedJSON = JSON.parse(cleanStr.substring(firstBrace, lastBrace + 1));
            }
          }
        } catch (e) {
          // 普通文本处理
        }

        const isBusinessQuery = /营销|风控|信贷|贷款|欺诈|信用卡|违约|评估|首贷|客群|额度|流水|模型|选型|转化|aum|招揽|准入|审批|防线|评分|经营贷|提额|催收|核算|征信|反洗钱|资产|坏账|不良|逾期/i.test(currentInput);

        // 判断是否真正触发了推荐逻辑
        let isRecommendation = false;
        if (parsedJSON && parsedJSON.isRecommendation !== undefined) {
          isRecommendation = parsedJSON.isRecommendation === true;
        } else if (testData && testData.isRecommendation !== undefined) {
          isRecommendation = testData.isRecommendation === true;
        } else {
          isRecommendation = isBusinessQuery;
        }

        if (isRecommendation) {
          setIsCollapsed(false); // 讨论业务时，自动推回全屏排版
          const reqData = parsedJSON?.parsedRequirement || testData?.parsedRequirement || {
            domain: '金融业务 / 智能化模型选型',
            stage: '阶段评估与选型匹配',
            audience: ['业务风控团队'],
            objective: currentInput,
            dataNeeds: ['基本交易数据', '征信信息']
          };

          const singleRecsData = parsedJSON?.singleRecommendations || testData?.singleRecommendations || [
            {
              modelId: 'm_003',
              matchScore: 95,
              reason: '契合金融业务风险识别与量化决策能力',
              missingFeatures: []
            }
          ];

          const combinedRecData = parsedJSON?.combinedRecommendation || testData?.combinedRecommendation || {
            title: `${currentInput} 智能推荐架构`,
            description: `针对“${currentInput}”构建的多模型联动智能方案`,
            nodes: [
              { id: '1', modelId: 'm_003', role: '核心风险识别引擎' }
            ],
            edges: []
          };


          setParseResult(normalizeRequirement(reqData));
          setSingleRecs(normalizeSingleRecs(singleRecsData));
          setCombinedRec(normalizeCombinedRec(combinedRecData));

          // SAVE RECOMMENDATION (双备份: 浏览器缓存 + 本地JSON文件)
          const record = {
            query: currentInput,
            parseResult: reqData,
            singleRecs: singleRecsData,
            combinedRec: combinedRecData
          };

          try {
            const localRecs = JSON.parse(localStorage.getItem('recommendations') || '[]');
            localRecs.push({ ...record, timestamp: new Date().toISOString(), id: 'rec_' + Date.now() });
            localStorage.setItem('recommendations', JSON.stringify(localRecs));
          } catch(e) {}

          fetch('/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
          }).catch(() => {});

        } else {
          setIsCollapsed(true); // 非业务对话时，自动将右侧分析框挤压到边缘
        }

        const displayChatResponse = parsedJSON?.chatResponse || testData?.chatResponse || (typeof aiContent === 'string' && !aiContent.startsWith('{') ? aiContent : '您好！我是大模型驱动的金融模型推荐助手。请描述您的具体业务场景（如营销促活、风控准入、反欺诈监控等），我将为您精准推荐 AI 模型方案。');
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: displayChatResponse }
        ]);
        setStatus('done');
      } else {
        // 后备降级处理: 尝试 /api/recommend
        const apiEndpoint = (import.meta as any).env.VITE_API_ENDPOINT || '/api/recommend';
        const mockDataContent = JSON.stringify(mockModels, null, 2);

        res = await fetch(apiEndpoint, {
          
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: currentInput, messages: chatHistory, mockDataContent }),
        });
        responseJson = await res.json().catch(() => ({}));
        const data = responseJson.data || responseJson;

        if (res.ok && (data.isRecommendation !== undefined || data.chatResponse)) {
          if (data.isRecommendation) {
            setIsCollapsed(false);
            setParseResult(normalizeRequirement(data.parsedRequirement));
            
            const mappedSingleRecs = normalizeSingleRecs(data.singleRecommendations || []);
            setSingleRecs(mappedSingleRecs);
            
            if (data.combinedRecommendation) {
              const mappedCombinedRec = normalizeCombinedRec(data.combinedRecommendation);
              setCombinedRec(mappedCombinedRec);
            }
            
            setStatus('done');
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: data.chatResponse || '我已为您完成需求结构化解析与方案推荐，请在右侧查看详情。' }
            ]);
          } else {
            setIsCollapsed(true);
            setStatus('done');
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: data.chatResponse || '我已为您完成需求结构化解析。' }
            ]);
          }
        } else {
          throw new Error(responseJson.error?.message || responseJson.error || '请求 DeepSeek 服务失败');
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatus('done');
      
      let errorMsg = err.message || '未知错误';
      if (errorMsg.includes('429') || errorMsg.includes('quota')) {
        errorMsg = '当前请求人数较多，触发限流保护，请稍后再试。';
      } else if (errorMsg.length > 100) {
        errorMsg = '服务响应异常，请稍后重试。';
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，匹配过程中出现错误：' + errorMsg }
      ]);
    }
  };

  const handleShortcut = (text: string) => {
    setInput(text);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative">
      {/* Left: Chat & Input */}
      <div className={cn(
        "flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[1px_0_10px_rgba(0,0,0,0.03)] z-10 transition-all duration-300 relative",
        isCollapsed ? "flex-1" : "w-1/3 min-w-[380px] max-w-[480px] shrink-0"
      )}>
        <div className="flex h-14 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            {t('业务需求沟通')}
          </h2>
          {!isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(true)}
              title={t('收起分析栏')}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors font-medium"
            >
              <PanelRightClose className="h-3.5 w-3.5" />
              <span>{t('收起分析')}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCollapsed(false)}
              title={t('展开分析栏')}
              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2.5 py-1 rounded-md transition-colors"
            >
              <PanelRightOpen className="h-3.5 w-3.5" />
              <span>{t('展开分析栏')}</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-blue-50 dark:bg-blue-950/60 p-4">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">{t('您好，我是模型推荐助手')}</h3>
              <p className="mb-8 text-sm text-slate-500 dark:text-slate-400 max-w-[280px]">
                {t('请用自然语言描述您的业务需求、目标客群或痛点，我将为您精准匹配适用模型。')}
              </p>
              <div className="flex w-full flex-col gap-2">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-400 text-left mb-1">{t('您可以试试这样问：')}</p>
                {[
                  t('农户小额贷款贷前准入风险评估'),
                  t('县域新客首贷营销转化模型推荐'),
                  t('对公贷款逾期风险预警模型组合')
                ].map((txt) => (
                  <button
                    key={txt}
                    onClick={() => handleShortcut(txt)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-left text-sm text-slate-700 dark:text-slate-200 transition-colors hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  >
                    <span>{txt}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i}
                    className={cn(
                      'flex w-full',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm'
                      )}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {(status === 'parsing' || status === 'recommending') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400"
                  >
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400"></div>
                    </div>
                    {status === 'parsing' || status === 'recommending' ? loadingSteps[loadingStep]?.desc : t('正在生成推荐报告...')}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t("描述您的业务场景或需求...")}
              className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[50px] max-h-[120px]"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={!(typeof input === 'string' ? input : '').trim() || status === 'parsing' || status === 'recommending'}
              className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-transform hover:bg-blue-700 disabled:opacity-50 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-400">
            <span>{t('Shift + Enter 换行，Enter 发送')}</span>
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-medium"
              >
                <span>{t('分析栏')}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Middle & Right: Analysis & Results */}
      {isCollapsed ? (
        <div className="flex shrink-0 h-full z-20 select-none relative">
          
          {/* Panel 2 Collapsed Strip: 结构化需求画像 */}
          <div
            onMouseEnter={() => setHoveredPanel('profile')}
            onMouseLeave={() => setHoveredPanel('none')}
            onClick={() => setIsCollapsed(false)}
            className={cn(
              "h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out cursor-pointer flex flex-col relative overflow-hidden shadow-xs hover:shadow-md group",
              hoveredPanel === 'profile' ? "w-[320px]" : "w-12"
            )}
          >
            {/* Strip Header */}
            <div className="p-3 flex flex-col items-center gap-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/60 p-1.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Activity className="h-4 w-4" />
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            </div>

            {/* Vertical Label Text */}
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <span className="[writing-mode:vertical-rl] tracking-[0.25em] text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-nowrap">
                {t('结构化需求画像')}
              </span>
            </div>

            {/* Hovered Peek Panel */}
            {hoveredPanel === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute inset-0 bg-white dark:bg-slate-900 p-5 overflow-y-auto flex flex-col z-30 shadow-xl border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    {t('结构化需求画像 (预览)')}
                  </h3>
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">{t('点击全部推回')}</span>
                </div>

                {parseResult ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-400 block mb-1">{t('业务领域与阶段')}</span>
                      <div className="flex flex-wrap gap-1">
                        <span className="font-medium text-slate-800 dark:text-slate-200 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                          {parseResult.domain}
                        </span>
                        <span className="font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                          {parseResult.stage}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-400 block mb-1">{t('目标客群')}</span>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(parseResult?.audience) ? parseResult.audience : [parseResult?.audience]).map((a: string) => (
                          <span key={a} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-400 block mb-1">{t('核心能力诉求')}</span>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(parseResult?.coreCapabilities) ? parseResult.coreCapabilities : [parseResult?.coreCapabilities]).map((c: string) => (
                          <span key={c} className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-400 block mb-1">{t('可用数据源')}</span>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(parseResult?.dataAvailable) ? parseResult.dataAvailable : [parseResult?.dataAvailable]).map((d: string) => (
                          <span key={d} className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-400 space-y-2">
                    <ScanText className="h-8 w-8 text-blue-400 opacity-60" />
                    <p className="text-xs">{t('提问具体业务需求后')}<br />{t('在此智能提炼结构化画像')}</p>
                    <p className="text-[10px] text-blue-500 font-medium pt-2">{t('单击面板即可推回全屏排版')}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Bottom Indicator */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center font-mono shrink-0">
              1/2
            </div>
          </div>

          {/* Panel 3 Collapsed Strip: 推荐方案报告 */}
          <div
            onMouseEnter={() => setHoveredPanel('report')}
            onMouseLeave={() => setHoveredPanel('none')}
            onClick={() => setIsCollapsed(false)}
            className={cn(
              "h-full border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 transition-all duration-300 ease-in-out cursor-pointer flex flex-col relative overflow-hidden shadow-xs hover:shadow-md group",
              hoveredPanel === 'report' ? "w-[420px]" : "w-12"
            )}
          >
            {/* Strip Header */}
            <div className="p-3 flex flex-col items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 shrink-0 bg-slate-100/50 dark:bg-slate-800/50">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-1.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Vertical Label Text */}
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <span className="[writing-mode:vertical-rl] tracking-[0.25em] text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                {t('推荐方案报告')}
              </span>
            </div>

            {/* Hovered Peek Panel */}
            {hoveredPanel === 'report' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute inset-0 bg-slate-50 dark:bg-slate-900 p-6 overflow-y-auto flex flex-col z-30 shadow-xl border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {t('推荐方案报告 (预览)')}
                  </h3>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-medium">{t('点击全部推回')}</span>
                </div>

                {parseResult && singleRecs.length > 0 ? (
                  <div className="space-y-4 text-xs">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{singleRecs[0].model.name}</span>
                        <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          {t('匹配度')} {singleRecs[0].matchScore}%
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2">{singleRecs[0].model.description}</p>
                    </div>
                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-[11px]">
                      💡 {t('点击面板推回完整排版后，可查看五维雷达图、全链路组合图谱并导出 PDF/Word 报告。')}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-400 space-y-2">
                    <Target className="h-8 w-8 text-emerald-500 opacity-60" />
                    <p className="text-xs">{t('等待输入业务需求')}<br />{t('智能匹配最佳模型与组合方案')}</p>
                    <p className="text-[10px] text-emerald-600 font-medium pt-2">{t('单击面板即可推回全屏排版')}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Bottom Indicator */}
            <div className="p-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400 text-center font-mono shrink-0 bg-slate-100/50 dark:bg-slate-800/50">
              90%
            </div>
          </div>

          {/* Floating Suit / Assistant Badge Icon (Matching Image 4) */}
          <div className="absolute right-14 bottom-12 z-40">
            <button
              onClick={() => setIsCollapsed(false)}
              title="点击展开全屏分析"
              className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white"></div>
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm6 14.25l-6 3.75-6-3.75V8.75l6-3.75 6 3.75v7.5zM12 9l-4 2.5v3l4 2.5 4-2.5v-3L12 9z"/>
              </svg>
            </button>
          </div>

        </div>
      ) : (
        /* Expanded 2-column container holding Middle & Right Panels */
        <div className="flex flex-1 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
        {status === 'idle' ? (
          <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <Database className="mb-4 h-12 w-12 opacity-20" />
            <p>{t('等待输入业务需求，开始智能匹配')}</p>
          </div>
        ) : (
          <div className="flex h-full w-full">
            
            {/* Middle: Parsing Result */}
            <div className="w-[300px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 overflow-y-auto hidden lg:block">
              <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {t('结构化需求画像')}
              </h3>
              
              <AnimatePresence mode="wait">
                {status === 'parsing' && (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8 relative overflow-hidden p-2 -m-2"
                  >
                    {/* Scanning line effect */}
                    <motion.div 
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent z-20"
                      initial={{ top: '0%', opacity: 0.5 }}
                      animate={{ top: '100%', opacity: [0, 1, 0] }}
                      transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                    />
                    
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                       <ScanText className="w-5 h-5 animate-pulse" />
                       <span className="text-sm font-medium animate-pulse">{t('正在提取关键特征...')}</span>
                    </div>

                    {[
                      { width1: "w-20", width2: "w-24", titleWidth: "w-24" },
                      { width1: "w-16", width2: "w-20", width3: "w-24", titleWidth: "w-20" },
                      { width1: "w-24", width2: "w-20", titleWidth: "w-24" }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className={`h-4 ${item.titleWidth} bg-slate-200/70 dark:bg-slate-700/70 rounded animate-pulse`} style={{ animationDelay: `${idx * 150}ms`}}></div>
                        </div>
                        <div className="flex gap-2">
                          <div className={`h-7 ${item.width1} bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200/50 dark:border-slate-700/50 animate-pulse`} style={{ animationDelay: `${idx * 200 + 100}ms`}}></div>
                          <div className={`h-7 ${item.width2} bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200/50 dark:border-slate-700/50 animate-pulse`} style={{ animationDelay: `${idx * 200 + 200}ms`}}></div>
                          {item.width3 && (
                            <div className={`h-7 ${item.width3} bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200/50 dark:border-slate-700/50 animate-pulse`} style={{ animationDelay: `${idx * 200 + 300}ms`}}></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
                {(status === 'done' || status === 'recommending') && parseResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t('业务领域与阶段')}</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-500/20">
                          {parseResult.domain}
                        </span>
                        <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-500/20">
                          {parseResult.stage}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t('目标客群')}</div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(parseResult?.audience) ? parseResult.audience : [parseResult?.audience || '未指定']).map((a: string) => (
                          <span key={a} className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t('核心能力诉求')}</div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(parseResult?.coreCapabilities) ? parseResult.coreCapabilities : [parseResult?.coreCapabilities || '未指定']).map((c: string) => (
                          <span key={c} className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t('可用数据源')}</div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(parseResult?.dataAvailable) ? parseResult.dataAvailable : [parseResult?.dataAvailable || '未指定']).map((d: string) => (
                          <span key={d} className="rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('预期系统输出')}</div>
                      <div className="text-sm text-slate-800 dark:text-slate-200">{parseResult.expectedOutput}</div>
                    </div>
                  </motion.div>
                ) : (
                  status !== 'parsing' && (
                    <div className="flex h-64 flex-col items-center justify-center text-center p-4 text-slate-400 dark:text-slate-500">
                      <Database className="mb-2 h-8 w-8 opacity-25 text-blue-500" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t('提问具体的金融业务需求后')}<br />{t('在此自动生成需求画像')}
                      </p>
                    </div>
                  )
                )}
              </AnimatePresence>
            </div>

            {/* Right: Recommendations */}
            <div className="flex-1 overflow-y-auto p-8 relative bg-slate-50/50 dark:bg-slate-950/50">
              {status === 'parsing' || status === 'recommending' ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="w-full max-w-md space-y-8">
                    {loadingSteps.map((step, index) => {
                      const isActive = loadingStep === index;
                      const isPast = loadingStep > index;
                      
                      return (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-colors duration-500",
                              isActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shadow-sm" :
                              isPast ? "border-emerald-500 bg-emerald-500 text-white" :
                              "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600"
                            )}>
                              {isPast ? <CheckCircle2 className="w-5 h-5" /> : 
                               isActive ? <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div> : 
                               <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                              }
                            </div>
                            {index < loadingSteps.length - 1 && (
                              <div className="w-0.5 h-10 bg-slate-100 dark:bg-slate-800 my-1 relative overflow-hidden">
                                <div className={cn(
                                  "absolute top-0 left-0 w-full bg-emerald-500 transition-all duration-1000",
                                  isPast ? "h-full" : "h-0"
                                )}></div>
                              </div>
                            )}
                          </div>
                          
                          <div className={cn(
                            "flex flex-col pt-2 transition-all duration-500",
                            isActive ? "opacity-100 translate-x-0" : isPast ? "opacity-100" : "opacity-40 -translate-x-2"
                          )}>
                            <span className={cn(
                              "text-sm font-semibold",
                              isActive ? "text-blue-700 dark:text-blue-400" : isPast ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"
                            )}>{step.title}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{step.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : parseResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto max-w-4xl space-y-6 pb-20 text-slate-900 dark:text-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('推荐方案报告')}</h2>
                    <button 
                      onClick={() => setShowReport(true)}
                      className="flex items-center gap-2 rounded-lg bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      {t('导出完整报告')}
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex space-x-1 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 p-1">
                    <button
                      onClick={() => setActiveTab('single')}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
                        activeTab === 'single'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <Target className="h-4 w-4" />
                      {t('最佳单模型推荐 (Top 3)')}
                    </button>
                    <button
                      onClick={() => setActiveTab('combined')}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
                        activeTab === 'combined'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <GitMerge className="h-4 w-4" />
                      {t('全链路组合推荐')}
                    </button>
                  </div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'single' ? (
                      <motion.div
                        key="single"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {singleRecs.map((rec, idx) => (
                          <div key={rec.model.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm relative overflow-hidden">
                            {idx === 0 && (
                              <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                Best Match
                              </div>
                            )}
                            <div className="flex gap-6 flex-col md:flex-row">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{rec.model.name}</h3>
                                  <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-950/60 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20">
                                    {t('综合适配度')} {rec.matchScore}%
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{rec.model.description}</p>
                                
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">{t('推荐理由')}</h4>
                                    <ul className="space-y-2">
                                      {rec.matchReasons.map((reason, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                          <span>{reason}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('性能指标参考')}</h4>
                                      <div className="flex gap-4">
                                        {Object.entries(rec.model.metrics).map(([k, v]) => (
                                          <div key={k}>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">{k}</div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{v}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('合规提示')}</h4>
                                      <div className="flex gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 rounded p-2">
                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>{rec.model.complianceBoundaries[0]}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="w-[300px] h-[260px] shrink-0 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="50%" data={rec.radarData}>
                                    <PolarGrid stroke="#64748b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name={t('适配度')} dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    ) : activeTab === 'combined' && combinedRec ? (
                      <motion.div
                        key="combined"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/40 p-6">
                          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">
                            {combinedRec.name}
                          </h3>
                          <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed mb-4">
                            {combinedRec.overallExplanation}
                          </p>
                          <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-200">
                            {t('组合预期收益：审批效率提升60%，风险识别率提升35%')}
                          </div>
                        </div>

                        <div className="relative">
                          {/* Flow Line */}
                          <div className="absolute left-[2.25rem] top-8 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
                          
                          <div className="space-y-6">
                            {combinedRec.nodes.map((node, i) => (
                              <div key={node.id} className="relative pl-16 pr-2">
                                {/* Node Dot */}
                                <div className="absolute left-[21px] top-6 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white dark:border-slate-900 bg-blue-500 shadow-sm z-10">
                                  <span className="text-xs font-bold text-white">{i + 1}</span>
                                </div>
                                
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="mb-4 flex items-center justify-between">
                                    <div className="text-[15px] font-bold text-blue-700 dark:text-blue-400">{node.roleInFlow}</div>
                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">{node.model.name}</div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-6 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex flex-col gap-1.5">
                                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t('所需输入')}</div>
                                      <div className="text-[13px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{node.input}</div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t('模型输出')}</div>
                                      <div className="text-[13px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{node.output}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center p-8">
                  <div className="mb-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 p-5 ring-1 ring-blue-100/60 dark:ring-blue-900/60 shadow-xs">
                    <Sparkles className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-200">{t('暂未触发模型推荐')}</h3>
                  <p className="max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t('日常沟通或非业务提问不会触发推荐图表与报告。')}<br />
                    {t('请输入具体的金融业务场景（例如：“农户小额贷款贷前准入”或“信用卡实时反欺诈”），系统将为您自动匹配生成 AI 模型推荐方案。')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && parseResult && combinedRec && singleRecs.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowReport(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed inset-2 md:inset-8 z-50 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/80">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {t('智能匹配推荐综合报告')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('报告编号')}：RPT-{Date.now().toString().slice(-6)} · {t('涉密等级：行内内部公开')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportWord} 
                    disabled={isExportingWord}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-xs"
                  >
                    <Download className={cn("h-4 w-4", isExportingWord && "animate-bounce")} /> 
                    {isExportingWord ? t('生成 Word 中...') : t('导出 Word (.docx)')}
                  </button>
                  <button 
                    onClick={handleExportPDF} 
                    disabled={isExporting}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-xs"
                  >
                    <Download className={cn("h-4 w-4", isExporting && "animate-bounce")} /> 
                    {isExporting ? t('生成 PDF 中...') : t('导出 PDF')}
                  </button>
                  <button onClick={() => setShowReport(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/50" id="report-content">
                <div id="report-paper" className="max-w-4xl mx-auto space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-slate-900 dark:text-slate-100">
                  
                  {/* Header Title */}
                  <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-6">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
                      {t('金融风控 AI 算法智能推荐引擎')}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">{t('业务模型智能推荐综合报告')}</h1>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>{t('需求领域')}：<strong className="text-slate-700 dark:text-slate-200">{parseResult.domain}</strong></span>
                      <span>{t('评估时间')}：<strong className="text-slate-700 dark:text-slate-200">{new Date().toLocaleDateString('zh-CN')}</strong></span>
                      <span>{t('校验状态')}：<strong className="text-emerald-600 dark:text-emerald-400">{t('合规审计已通过')}</strong></span>
                    </div>
                  </div>

                  {/* 1. 业务需求解析摘要 */}
                  <section>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold">1</span> 
                      {t('业务需求解析摘要')}
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="text-slate-500 dark:text-slate-400 font-medium">{t('核心客群')}：</span><span className="text-slate-800 dark:text-slate-200 font-semibold">{Array.isArray(parseResult?.audience) ? parseResult.audience.join(', ') : (parseResult?.audience || '-')}</span></div>
                      <div><span className="text-slate-500 dark:text-slate-400 font-medium">{t('业务阶段')}：</span><span className="text-slate-800 dark:text-slate-200 font-semibold">{parseResult?.stage || '-'}</span></div>
                      <div className="col-span-1 md:col-span-2"><span className="text-slate-500 dark:text-slate-400 font-medium">{t('能力诉求')}：</span><span className="text-slate-800 dark:text-slate-200 font-semibold">{Array.isArray(parseResult?.coreCapabilities) ? parseResult.coreCapabilities.join('、') : (parseResult?.coreCapabilities || '-')}</span></div>
                      <div className="col-span-1 md:col-span-2"><span className="text-slate-500 dark:text-slate-400 font-medium">{t('预期输出')}：</span><span className="text-slate-800 dark:text-slate-200 font-semibold">{parseResult?.expectedOutput || '-'}</span></div>
                      <div className="col-span-1 md:col-span-2"><span className="text-slate-500 dark:text-slate-400 font-medium">{t('前置数据条件')}：</span><span className="text-slate-800 dark:text-slate-200">{Array.isArray(parseResult?.dataAvailable) ? parseResult.dataAvailable.join('；') : (parseResult?.dataAvailable || '-')}</span></div>
                    </div>
                  </section>

                  {/* 2. 主推单模型方案与五维度匹配评估 */}
                  <section>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold">2</span> 
                      {t('主推单模型方案与五维度适配评估')}
                    </h3>
                    <div className="border border-blue-100 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/20 p-6 rounded-xl space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-100/80 dark:border-blue-900/80 pb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[11px] font-mono font-bold">
                              {singleRecs[0].model.id}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{singleRecs[0].model.type}</span>
                          </div>
                          <h4 className="font-bold text-blue-900 dark:text-blue-200 text-lg">{singleRecs[0].model.name}</h4>
                          <p className="text-slate-600 dark:text-slate-300 text-xs mt-1">{singleRecs[0].model.description}</p>
                        </div>
                        <div className="shrink-0 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-xl px-5 py-3 text-center shadow-xs">
                          <div className="text-[10px] text-slate-400 font-medium">{t('综合匹配度')}</div>
                          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{singleRecs[0].matchScore}%</div>
                        </div>
                      </div>

                      {/* 图二：五维度匹配度雷达图 + 五维度匹配明细 */}
                      <div id="radar-chart-export" className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
                          <span>{t('五维度模型适配度评价 (Radar Chart)')}</span>
                          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">{t('满分 100 分')}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          {/* Radar Chart Visual */}
                          <div className="h-[240px] w-full flex items-center justify-center bg-slate-50/60 dark:bg-slate-800/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={singleRecs[0].radarData}>
                                <PolarGrid stroke="#64748b" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name={t('适配度')} dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.45} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* 5-Dimension Score Badges & Explanation */}
                          <div className="space-y-2 text-xs">
                            {singleRecs[0].radarData.map((item) => (
                              <div key={item.subject} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.subject}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden hidden sm:block">
                                    <div className="bg-blue-600 dark:bg-blue-400 h-full rounded-full" style={{ width: `${item.A}%` }}></div>
                                  </div>
                                  <span className="font-bold text-blue-700 dark:text-blue-300 font-mono w-10 text-right">{item.A}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 推荐理由与性能参考 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                          <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{t('推荐理由与业务优势')}</h5>
                          <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                            {singleRecs[0].matchReasons.map((r, i) => (
                              <li key={i} className="flex gap-1.5 items-start">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                          <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{t('算法性能与参照指标')}</h5>
                          <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                            {Object.entries(singleRecs[0].model.metrics).map(([k, v]) => (
                              <div key={k} className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                <div className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-mono">{k}</div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 3. 备选与联动模型推荐 */}
                  {singleRecs.length > 1 && (
                    <section>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <span className="bg-blue-600 text-white h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold">3</span> 
                        {t('备选与辅助联动模型对比')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {singleRecs.slice(1).map((item, idx) => (
                          <div key={item.model.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.model.name}</span>
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">{t('匹配度')} {item.matchScore}%</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{item.model.description}</p>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                              <div><strong>{t('推荐定位')}：</strong>{idx === 0 ? t('准入前置数据解析与特征提取') : t('贷后违约预警与额度复核')}</div>
                              <div><strong>{t('优势')}：</strong>{item.matchReasons[0] || t('补充高维风控特征')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 4. 全链路组合推荐 */}
                  <section>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold">4</span> 
                      {t('全链路组合方案与流程拓扑')}
                    </h3>
                    <div className="border border-slate-200 dark:border-slate-800 p-6 rounded-xl bg-slate-50/30 dark:bg-slate-800/30">
                      <div className="mb-4">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">{combinedRec.name}</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{combinedRec.overallExplanation}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-3 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          {t('组合预期收益：审批效率提升 60%，风险识别率提升 35%')}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {combinedRec.nodes.map((n, i) => (
                          <div key={n.id} className="p-3.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">{i+1}</div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{n.roleInFlow}</span>
                                <span className="text-slate-400 mx-1.5">|</span>
                                <span className="text-blue-700 dark:text-blue-300 font-semibold">{n.model.name}</span>
                              </div>
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-[11px] bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded md:max-w-xs">
                              {t('预期价值')}：{n.expectedValue}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* 5. 前置特征与数据接入依赖 */}
                  <section>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold">5</span> 
                      {t('前置特征与数据接入依赖')}
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">{t('人行征信 & 司法黑名单')}</div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">{t('提供逾期历史、诉讼记录与关联企业风险')}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">{t('经营流水 & 纳税发票')}</div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">{t('用于自动化经营现金流评估与实际营收核算')}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">{t('行内存款 & 交易行为')}</div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">{t('补充客户粘性与资产存量评估维度')}</p>
                      </div>
                    </div>
                  </section>

                  {/* 6. 实施路径与合规风控提示 */}
                  <section>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <span className="bg-amber-500 text-white h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold">!</span> 
                      {t('实施路径与合规风控提示')}
                    </h3>
                    <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 p-4 rounded-xl text-xs space-y-2">
                      <div className="font-bold flex items-center gap-1.5 text-amber-950 dark:text-amber-100">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        {t('合规审慎部署建议')}
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300">
                        <li>{singleRecs[0]?.model?.complianceBoundaries?.[0] || t('须关注经营流水真实性及外部数据时效性，建议设置人工复核通道')}</li>
                        <li>{singleRecs[1]?.model?.complianceBoundaries?.[0] || t('建议按月进行模型PSI（稳定性指标）监控与截断阈值动态微调')}</li>
                        <li>{t('模型输入变量与决策结论已自动开启审计日志落盘，符合监管风险追溯要求。')}</li>
                      </ul>
                    </div>
                  </section>

                  {/* Report Footer */}
                  <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
                    <p>— {t('业务模型智能推荐系统 自动生成报告')} —</p>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
