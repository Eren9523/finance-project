const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminAIUsagePage.tsx', 'utf-8');

code = code.replace(
  `import { Activity, Zap, CheckCircle2, DollarSign, Clock, RefreshCw, BarChart2 } from 'lucide-react';`,
  `import { Activity, Zap, CheckCircle2, DollarSign, Clock, RefreshCw, BarChart2, X } from 'lucide-react';\nimport { AnimatePresence } from 'motion/react';`
);

// We add a Calibration Modal component to the page
const modalCode = `
      <AnimatePresence>
        {calibrating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">价格校准</h3>
                <button onClick={() => setCalibrating(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-slate-700">读取DeepSeek官方文档</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-slate-900 font-medium">解析当前模型价格...</span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-40">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  <span className="text-slate-700">结构校验</span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-40">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  <span className="text-slate-700">比较价格版本</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

code = code.replace(
  `const handleCalibrate = async () => {`,
  `const [showModal, setShowModal] = useState(false);\n  const handleCalibrate = async () => {`
);

code = code.replace(
  `alert('校准完成');`,
  `alert('校准完成: ' + (res.data ? 'Pricing #' + res.data.version : '无变化')); setShowModal(false);`
);

code = code.replace(
  `{calibrating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}`,
  `<RefreshCw className="w-4 h-4" />`
);

code = code.replace(
  `  return (
    <div className="space-y-6">`,
  `  return (
    <div className="space-y-6">
` + modalCode
);

fs.writeFileSync('src/pages/admin/AdminAIUsagePage.tsx', code);
