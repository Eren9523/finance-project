const fs = require('fs');
let code = fs.readFileSync('src/pages/ArchitecturePage.tsx', 'utf8');

// 1. Add useInView to imports
code = code.replace(/import \{ motion, AnimatePresence \} from 'motion\/react';/, "import { motion, AnimatePresence, useInView } from 'motion/react';");

// 2. Add PipelineCard and SequenceSection components
const componentsToAdd = `
const SequenceSection = ({ unlock, children, className, delay = 0 }: { unlock: boolean, children: React.ReactNode, className?: string, delay?: number }) => {
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
          transition: { duration: 0.6, delay: delay, ease: "easeOut", staggerChildren: 0.15, delayChildren: delay + 0.2 } 
        }
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
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-900/50 p-4 sm:p-5 shadow-xs flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{title}</span>
        </div>
        {tag && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {tag}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed z-10">{desc}</p>
      
      {/* Progress bar animation */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-200 dark:bg-slate-800 w-full">
         <motion.div 
           variants={{ hidden: { width: "0%" }, visible: { width: "100%", transition: { duration: 2, delay: delay, ease: "circOut" } } }}
           className="h-full bg-blue-500 dark:bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
         />
      </div>
    </motion.div>
  )
};
`;
code = code.replace(/export const ArchitecturePage = \(\) => \{/, componentsToAdd + '\nexport const ArchitecturePage = () => {');

// 3. Update the states in ArchitecturePage
const stateRegex = /const \[chatStep, setChatStep\] = useState<number>\(0\);\n  const \[isReplaying, setIsReplaying\] = useState\(false\);\n  const \[stage2Visible, setStage2Visible\] = useState\(false\);/;
const newStates = `const [chatStep, setChatStep] = useState<number>(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [stageUnlocks, setStageUnlocks] = useState({ 2: false, 3: false, 4: false, 5: false });`;
code = code.replace(stateRegex, newStates);

// 4. Update runChatFlow timeouts
const runChatFlowRegex = /const runChatFlow = \(\) => \{[\s\S]*?return \(\) => \{/;
const newRunChatFlow = `const runChatFlow = () => {
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
      setStageUnlocks(prev => ({...prev, 2: true}));
    }, 2300);

    const t6 = setTimeout(() => setStageUnlocks(prev => ({...prev, 3: true})), 3500);
    const t7 = setTimeout(() => setStageUnlocks(prev => ({...prev, 4: true})), 4500);
    const t8 = setTimeout(() => setStageUnlocks(prev => ({...prev, 5: true})), 5500);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
      clearTimeout(t6); clearTimeout(t7); clearTimeout(t8);
    };`;
code = code.replace(runChatFlowRegex, newRunChatFlow + '\n    return () => {');

// 5. Replace stage2Visible usage
code = code.replace(/animate=\{stage2Visible \? "visible" : "hidden"\}/g, 'animate={stageUnlocks[2] ? "visible" : "hidden"}');

// 6. Update 03 and 04 wrapping
// We need to wrap 03 and 04 individually with SequenceSection
// Let's find 03 container
const layer03Regex = /<motion\.div\s*initial=\{\{ opacity: 0, y: 40 \}\}\s*whileInView=\{\{ opacity: 1, y: 0 \}\}\s*viewport=\{\{ once: true, margin: "-100px" \}\}\s*transition=\{\{ duration: 0.8, ease: "easeOut" \}\}\s*className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 w-full items-stretch"\s*>/;
code = code.replace(layer03Regex, '<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 w-full items-stretch">');

const layer03Col8 = /<div className="xl:col-span-8 rounded-3xl border border-slate-200\/90 dark:border-slate-800\/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">/;
code = code.replace(layer03Col8, '<SequenceSection unlock={stageUnlocks[3]} delay={0} className="xl:col-span-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">');
// Close the sequence section for 03 where the div closes. It closes right before 04 starts.
const layer04Start = /\{\/\* 04 基础设施与算力保障 \(Clean Contained Layout - No Overflow\) \*\/\}/;
code = code.replace(layer04Start, '</SequenceSection>\n\n            {/* 04 基础设施与算力保障 (Clean Contained Layout - No Overflow) */}');

const layer04Col4 = /<div className="xl:col-span-4 rounded-3xl border border-slate-200\/90 dark:border-slate-800\/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">/;
code = code.replace(layer04Col4, '<SequenceSection unlock={stageUnlocks[4]} delay={0.2} className="xl:col-span-4 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">');
// Close 04
const layer04End = /<\/div>\s*<\/motion\.div>\s*\{\/\* ========================================================================= \*\/\}\s*\{\/\* 05 离线治理平面/;
code = code.replace(layer04End, '</SequenceSection>\n          </div>\n\n          {/* ========================================================================= */}\n          {/* 05 离线治理平面');

fs.writeFileSync('src/pages/ArchitecturePage.tsx', code);
