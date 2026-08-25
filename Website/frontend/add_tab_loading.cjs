const fs = require('fs');

function processTab(filename, requiredKeys) {
  let c = fs.readFileSync(filename, 'utf8');
  
  const loadingCheck = \`
  if (\${requiredKeys.map(k => \`!serverData?.\${k}\`).join(' || ')}) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <LoadingScreen />
      </div>
    );
  }
\`;

  // Insert it right after the component signature (and any hooks before rendering)
  // Let's just insert it after `const toast = useToast();` or similar.
  // Actually, a safer way is to find `return (` and insert it right before the first return that isn't a loading check.
  
  // A simple way is to insert it after the \`const [isSaving, setIsSaving]\` or \`const initialPayloadRef\` or similar.
  // Since we removed all \`if (loading) return <LoadingScreen />\`, we can just prepend it before the main \`return (\`.
  
  const mainReturnIndex = c.lastIndexOf('return (');
  if (mainReturnIndex !== -1 && !c.includes('LoadingScreen />')) {
    // Wait, some might have early returns. Let's insert it before the last `return (`.
    c = c.substring(0, mainReturnIndex) + loadingCheck + c.substring(mainReturnIndex);
    
    // ensure LoadingScreen is imported
    if (!c.includes('LoadingScreen')) {
       c = c.replace(/import React/, 'import LoadingScreen from "../../ui/LoadingScreen";\nimport React');
       if (!c.includes('LoadingScreen')) {
         c = 'import LoadingScreen from "../../../components/ui/LoadingScreen";\n' + c;
       }
    }
    
    // fix import paths based on depth
    if (filename.includes('Dashboard.jsx')) {
      // ignore Dashboard
    } else if (filename.includes('Modules.jsx')) {
      c = c.replace('import LoadingScreen from "../../../components', 'import LoadingScreen from "../../components');
    }
  }

  fs.writeFileSync(filename, c);
}

processTab('src/components/dashboard/tabs/Security.jsx', ['config', 'roles', 'channels']);
processTab('src/components/dashboard/tabs/Moderation.jsx', ['config', 'roles', 'channels']);
processTab('src/components/dashboard/tabs/Overview.jsx', ['config', 'modActivity']);
processTab('src/components/dashboard/tabs/Roles.jsx', ['config', 'roles']);
processTab('src/components/dashboard/Modules.jsx', ['config', 'roles', 'channels']);

// Some tabs don't use serverData directly or can render without it, but let's add it for consistency if they do.
processTab('src/components/dashboard/tabs/Settings.jsx', ['config']);
processTab('src/components/dashboard/tabs/BotProfile.jsx', ['botProfile']);
processTab('src/components/dashboard/tabs/Analytics.jsx', ['config']); // Analytics needs config? maybe.

