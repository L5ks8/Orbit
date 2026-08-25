const fs = require('fs');

function addCheck(file, required) {
  let c = fs.readFileSync(file, 'utf8');
  const checkStr = `\n  if (${required.map(k => `!serverData?.${k}`).join(' || ')}) return <div className="flex-1 flex items-center justify-center min-h-[500px]"><LoadingScreen /></div>;\n`;
  c = c.replace(/(export default function \w+\([^)]+\) {)/, `$1${checkStr}`);
  if (!c.includes('LoadingScreen')) {
    c = 'import LoadingScreen from "../../ui/LoadingScreen";\n' + c;
  }
  fs.writeFileSync(file, c);
}

addCheck('src/components/dashboard/tabs/Security.jsx', ['config', 'roles', 'channels']);
addCheck('src/components/dashboard/tabs/Overview.jsx', ['config', 'modActivity']);
addCheck('src/components/dashboard/tabs/Roles.jsx', ['config', 'roles']);
addCheck('src/components/dashboard/Modules.jsx', ['config', 'roles', 'channels']);
addCheck('src/components/dashboard/tabs/Settings.jsx', ['config']);
addCheck('src/components/dashboard/tabs/Analytics.jsx', ['config']);
addCheck('src/components/dashboard/tabs/BotProfile.jsx', ['botProfile']);
addCheck('src/components/dashboard/tabs/Invites.jsx', ['config']);

