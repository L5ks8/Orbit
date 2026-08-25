const fs = require('fs');

function cleanTab(file) {
  let c = fs.readFileSync(file, 'utf8');
  
  // Remove the early return block
  const blockRegex = /\n\s*if \(\!serverData\?\.config.*?return.*?LoadingScreen \/>.*?<\/div>\n\s*\);\n\s*\}/s;
  c = c.replace(blockRegex, '');
  
  // Clean up unused LoadingScreen import
  c = c.replace(/import LoadingScreen from ['"]\.\.\/\.\.\/ui\/LoadingScreen['"];\n/g, '');
  
  fs.writeFileSync(file, c);
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

tabs.forEach(cleanTab);

// Now update Dashboard.jsx
let dash = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

const withLoadingComponent = `
function WithLoading({ required, serverData, children }) {
  if (required.some(k => !serverData?.[k])) {
    return <div className="flex-1 flex items-center justify-center min-h-[500px]"><LoadingScreen /></div>;
  }
  return children;
}
`;

if (!dash.includes('function WithLoading')) {
  dash = dash.replace(/function DashboardInner\(\) \{/, withLoadingComponent + '\nfunction DashboardInner() {');
}

const oldRoutes = `<Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview guildId={guildId} serverData={serverData} setServerData={setServerData} />} />
              <Route path="analytics" element={<Analytics serverData={serverData} setServerData={setServerData} />} />
              <Route path="roles" element={<Roles guildId={guildId} serverData={serverData} setServerData={setServerData} />} />
              <Route path="bot-profile" element={<BotProfile guildId={guildId} serverData={serverData} setServerData={setServerData} />} />
              <Route path="invites" element={<Invites serverData={serverData} setServerData={setServerData} />} />
              <Route path="embed-builder" element={<EmbedBuilder setSidebarOpen={setSidebarOpen} />} />
              <Route path="leaderboard" element={<Leaderboard guildId={guildId} />} />
              <Route path="settings" element={<Settings guildId={guildId} serverData={serverData} setServerData={setServerData} />} />
              <Route path="automod" element={<Moderation guildId={guildId} serverData={serverData} setServerData={setServerData} />} />
              <Route path="security" element={<Security guildId={guildId} serverData={serverData} setServerData={setServerData} />} />
              <Route path=":moduleId" element={<Modules guildId={guildId} serverData={serverData} setServerData={setServerData} />} />
            </Routes>`;

const newRoutes = `<Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<WithLoading required={['config', 'modActivity']} serverData={serverData}><Overview guildId={guildId} serverData={serverData} setServerData={setServerData} /></WithLoading>} />
              <Route path="analytics" element={<WithLoading required={['config']} serverData={serverData}><Analytics serverData={serverData} setServerData={setServerData} /></WithLoading>} />
              <Route path="roles" element={<WithLoading required={['config', 'roles']} serverData={serverData}><Roles guildId={guildId} serverData={serverData} setServerData={setServerData} /></WithLoading>} />
              <Route path="bot-profile" element={<WithLoading required={['botProfile']} serverData={serverData}><BotProfile guildId={guildId} serverData={serverData} setServerData={setServerData} /></WithLoading>} />
              <Route path="invites" element={<WithLoading required={['config']} serverData={serverData}><Invites serverData={serverData} setServerData={setServerData} /></WithLoading>} />
              <Route path="embed-builder" element={<EmbedBuilder setSidebarOpen={setSidebarOpen} />} />
              <Route path="leaderboard" element={<Leaderboard guildId={guildId} />} />
              <Route path="settings" element={<WithLoading required={['config']} serverData={serverData}><Settings guildId={guildId} serverData={serverData} setServerData={setServerData} /></WithLoading>} />
              <Route path="automod" element={<WithLoading required={['config', 'roles', 'channels']} serverData={serverData}><Moderation guildId={guildId} serverData={serverData} setServerData={setServerData} /></WithLoading>} />
              <Route path="security" element={<WithLoading required={['config', 'roles', 'channels']} serverData={serverData}><Security guildId={guildId} serverData={serverData} setServerData={setServerData} /></WithLoading>} />
              <Route path=":moduleId" element={<WithLoading required={['config', 'roles', 'channels']} serverData={serverData}><Modules guildId={guildId} serverData={serverData} setServerData={setServerData} /></WithLoading>} />
            </Routes>`;

dash = dash.replace(oldRoutes, newRoutes);
fs.writeFileSync('src/pages/Dashboard.jsx', dash);

