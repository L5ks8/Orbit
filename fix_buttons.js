const fs = require('fs');
let content = fs.readFileSync('Website/frontend/src/components/dashboard/Moderation.jsx', 'utf8');

// 1. Remove the floating PRO alert
content = content.replace(/<div className="fixed bottom-4 right-4 z-50">[\s\S]*?<\/div>\s*<\/div>\s*(<div data-tour="feature-header")/, '$1');

// 2. Remove Upgrade to Pro button
content = content.replace(/<div className="flex justify-center mt-6 mb-2">[\s\S]*?<\/div>\s*(<\/div>\s*<div className="col-span-1 lg:col-span-4 lg:row-start-2 lg:col-start-9")/, '$1');

// 3. Remove Pro Badges
content = content.replace(/<span className="inline-flex items-center justify-center font-semibold uppercase tracking-\[0\.04em\] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-\[0_1px_2px_-0\.5px_rgba\(0,0,0,0\.45\),inset_0_1px_0_rgba\(255,255,255,0\.08\)\] text-indigo-400 border-indigo-500\/20 bg-gradient-to-b from-indigo-400\/25 to-indigo-600\/10 h-\[19px\] pl-\[5px\] pr-\[6\.5px\] gap-\[3px\] rounded-\[6px\] text-\[9\.5px\]">[\s\S]*?Pro\s*<\/span>/g, '');

// 4. Remove pointer-events-none wrappers (AI Moderation & Spam & Logs)
content = content.replace(/className="pointer-events-none select-none flex flex-col"/g, 'className="flex flex-col"');
content = content.replace(/className="mt-3 pointer-events-none opacity-50"/g, 'className="mt-3"');
content = content.replace(/opacity-50 cursor-not-allowed/g, '');
content = content.replace(/<input([^>]*?)disabled([^>]*?)>/g, '<input$1$2>');

fs.writeFileSync('Website/frontend/src/components/dashboard/Moderation.jsx', content);
console.log('done');
