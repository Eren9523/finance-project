const fs = require('fs');
let code = fs.readFileSync('src/pages/ArchitecturePage.tsx', 'utf8');

// Replace the closing div for those specific arrows
// We can use a regex to find the arrow block
code = code.replace(/(<motion\.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }} className="hidden lg:flex items-center justify-center pt-11">\s*<div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50\/80 dark:bg-blue-950\/60 border border-blue-200\/80 dark:border-blue-800 text-blue-500 shadow-2xs">\s*<ArrowRight className="h-3\.5 w-3\.5" \/>\s*<\/div>\s*)<\/div>/g, '$1</motion.div>');

fs.writeFileSync('src/pages/ArchitecturePage.tsx', code);
