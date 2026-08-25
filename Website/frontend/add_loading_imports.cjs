const fs = require('fs');
const files = [
  'src/components/dashboard/tabs/Security.jsx',
  'src/components/dashboard/tabs/Roles.jsx',
  'src/components/dashboard/tabs/Overview.jsx',
  'src/components/dashboard/tabs/Moderation.jsx',
  'src/components/dashboard/tabs/BotProfile.jsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import LoadingScreen')) {
    // Add import statement after the first import statement
    content = content.replace(/import React(.*?)\n/, "import React$1\nimport LoadingScreen from '../../ui/LoadingScreen';\n");
    fs.writeFileSync(file, content);
  }
}
