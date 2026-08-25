const fs = require('fs');

function cleanLines(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const out = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this line is the start of the loading check I inserted
    if (line.includes('if (!serverData?.config')) {
      // The block is exactly 7 lines long:
      // if (...) {
      //   return (
      //     <div className="flex-1 flex items-center justify-center min-h-[500px]">
      //       <LoadingScreen />
      //     </div>
      //   );
      // }
      // Let's verify it by looking ahead
      if (lines[i+1].includes('return (')) {
        i += 7;
        continue;
      }
    }
    
    // Also remove the LoadingScreen import if it's there
    if (line.includes('import LoadingScreen from') && (line.includes('../../ui/LoadingScreen') || line.includes('../../../components/ui/LoadingScreen'))) {
      i++;
      continue;
    }
    
    out.push(line);
    i++;
  }
  
  fs.writeFileSync(file, out.join('\n'));
}

const tabs = [
  'src/components/dashboard/tabs/Security.jsx',
  'src/components/dashboard/tabs/Overview.jsx',
  'src/components/dashboard/tabs/Roles.jsx',
  'src/components/dashboard/Modules.jsx',
  'src/components/dashboard/tabs/Settings.jsx',
  'src/components/dashboard/tabs/Analytics.jsx',
  'src/components/dashboard/tabs/BotProfile.jsx',
  'src/components/dashboard/tabs/Invites.jsx',
  'src/components/dashboard/tabs/Moderation.jsx'
];

tabs.forEach(cleanLines);
