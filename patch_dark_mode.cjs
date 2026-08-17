const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('@variant dark')) {
  css = `@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  html, body {
    @apply bg-slate-50 text-slate-900 transition-colors duration-200;
  }
  html.dark, html.dark body {
    @apply bg-slate-950 text-slate-50;
  }
}
` + css.replace('@import "tailwindcss";', '');
  fs.writeFileSync('src/index.css', css);
}
console.log('Patched index.css');
