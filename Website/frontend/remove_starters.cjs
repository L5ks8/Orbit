const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/modules/WelcomeSettings.jsx', 'utf8');
const regex = /[ \t]*<span className="inline-flex items-center justify-center font-semibold uppercase tracking-\[0\.04em\][\s\S]*?Starter[\s\S]*?<\/span>/g;
const newContent = content.replace(regex, '');
fs.writeFileSync('src/components/dashboard/modules/WelcomeSettings.jsx', newContent);
