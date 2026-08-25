const fs = require('fs');

let c = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

const oldRoutes = `<Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview guildId={guildId} />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="roles" element={<Roles guildId={guildId} />} />
              <Route path="bot-profile" element={<BotProfile guildId={guildId} />} />
              <Route path="invites" element={<Invites />} />
              <Route path="embed-builder" element={<EmbedBuilder setSidebarOpen={setSidebarOpen} />} />
              <Route path="leaderboard" element={<Leaderboard guildId={guildId} />} />
              <Route path="settings" element={<Settings guildId={guildId} />} />
              <Route path="automod" element={<Moderation guildId={guildId} />} />
              <Route path="security" element={<Security guildId={guildId} />} />
              <Route path=":moduleId" element={<Modules guildId={guildId} />} />
            </Routes>`;

const newRoutes = `<Routes>
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

c = c.replace(oldRoutes, newRoutes);
fs.writeFileSync('src/pages/Dashboard.jsx', c);
