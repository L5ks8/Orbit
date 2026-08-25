const fs = require('fs');

let c = fs.readFileSync('src/components/dashboard/tabs/Moderation.jsx', 'utf8');

c = c.replace(
  'export default function Moderation({ guildId, serverData, setServerData }) {',
  `export default function Moderation({ guildId, serverData, setServerData }) {
  if (!serverData?.config || !serverData?.roles || !serverData?.channels) return <div className="flex-1 flex items-center justify-center min-h-[500px]"><LoadingScreen /></div>;`
);

if (!c.includes('import LoadingScreen')) {
  c = 'import LoadingScreen from "../../ui/LoadingScreen";\n' + c;
}

fs.writeFileSync('src/components/dashboard/tabs/Moderation.jsx', c);
