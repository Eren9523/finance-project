const fs = require('fs');
let code = fs.readFileSync('src/pages/ArchitecturePage.tsx', 'utf8');

// Replace GovernanceStepNode
const nodeRegex = /const GovernanceStepNode = \(\{ num, icon: Icon, title, desc, color \}: any\) => \{[\s\S]*?return \([\s\S]*?className="flex-1 min-w-\[95px\] max-w-\[130px\] h-full flex flex-col justify-between items-center text-center p-3 xl:p-3\.5 rounded-2xl border border-slate-200\/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-xs transition-all duration-200 group"[\s\S]*?<\/div>\s*\);\s*\};/;

const newNodeCode = `const GovernanceStepNode = ({ num, icon: Icon, title, desc, color, delay = 0 }: any) => {
  const colorStyles: any = {
    blue: "bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-800",
    indigo: "bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-800",
    violet: "bg-violet-50/70 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200/80 dark:border-violet-800",
    purple: "bg-purple-50/70 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/80 dark:border-purple-800",
    amber: "bg-amber-50/70 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800",
    emerald: "bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800",
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
      variants={{ hidden: { opacity: 0, scale: 0.9, y: 15 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } }}
      className="flex-1 min-w-[95px] max-w-[130px] h-full flex flex-col justify-between items-center text-center p-3 xl:p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-xs transition-colors duration-200 group relative overflow-hidden"
    >
      <div className="flex flex-col items-center z-10 w-full">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border mb-2 relative group-hover:scale-105 transition-transform", colorStyles[color])}>
          <Icon className="h-4 w-4" />
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-slate-800 dark:bg-slate-700 text-white text-[8.5px] font-bold font-mono rounded-full shadow-2xs">
            {num}
          </span>
        </div>
        <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1 whitespace-nowrap">{title}</span>
      </div>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight whitespace-nowrap mt-1 z-10">{desc}</span>
      
      {/* Pipeline Scanning Bar */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-slate-100 dark:bg-slate-800 w-full">
         <motion.div 
           variants={{ hidden: { width: "0%" }, visible: { width: "100%", transition: { duration: 1.5, delay: delay, ease: "linear" } } }}
           className={cn("h-full", barColors[color])}
         />
      </div>
    </motion.div>
  );
};`;

code = code.replace(nodeRegex, newNodeCode);


// Replace InfraCard
const infraCardRegex = /const InfraCard = \(\{ icon: Icon, title, desc, status \}: any\) => \([\s\S]*?className="flex flex-col justify-between p-3\.5 xl:p-4 rounded-2xl bg-slate-50\/70 dark:bg-slate-900\/60 border border-slate-200\/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-150 h-full min-h-\[105px\]"[\s\S]*?<\/div>\s*\);/;

const newInfraCardCode = `const InfraCard = ({ icon: Icon, title, desc, status }: any) => (
  <motion.div 
    variants={{ hidden: { opacity: 0, scale: 0.95, y: 15 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.3 } } }}
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
      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">{title}</h4>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{desc}</p>
    </div>
    
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
  </motion.div>
);`;

code = code.replace(infraCardRegex, newInfraCardCode);

// Wrap 05 with SequenceSection
// Search for: <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs relative">
const layer05Regex = /<motion\.div\s*initial=\{\{ opacity: 0, y: 24 \}\}\s*whileInView=\{\{ opacity: 1, y: 0 \}\}\s*viewport=\{\{ once: true, margin: "-50px" \}\}\s*transition=\{\{ duration: 0.5, delay: 0.2 \}\}\s*className="rounded-3xl border border-slate-200\/90 dark:border-slate-800\/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs relative"\s*>/;

code = code.replace(layer05Regex, '<SequenceSection unlock={stageUnlocks[5]} delay={0.1} className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs relative">');

// Find end of layer05 to close SequenceSection
const layer05End = /\{\/\* Footer \*\/\}/;
code = code.replace(layer05End, '</SequenceSection>\n\n      {/* Footer */}');

// Add delay props to GovernanceStepNode calls
let delayCounter = 0.2;
code = code.replace(/<GovernanceStepNode[\s\S]*?\/>/g, (match) => {
  const replacement = match.replace('/>', `delay={${delayCounter.toFixed(1)}} />`);
  delayCounter += 0.3;
  return replacement;
});

// Update GovernanceStepDivider to be animated too
const dividerRegex = /const GovernanceStepDivider = \(\) => \([\s\S]*?className="hidden lg:flex items-center justify-center shrink-0"[\s\S]*?<\/div>\s*\);/;
const newDivider = `const GovernanceStepDivider = () => (
  <motion.div variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } }} className="hidden lg:flex items-center justify-center shrink-0">
    <div className="w-5 h-5 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 flex items-center justify-center text-blue-500 shadow-2xs">
      <ArrowRight className="h-2.5 w-2.5" />
    </div>
  </motion.div>
);`;
code = code.replace(dividerRegex, newDivider);

fs.writeFileSync('src/pages/ArchitecturePage.tsx', code);
