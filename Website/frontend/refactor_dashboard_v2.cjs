const fs = require('fs');

let c = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

const oldEffect = `    Promise.all([
      fetch(\`/api/config/\${guildId}\`, { headers }).then(res => res.json()).catch(() => ({})),
      fetch(\`/api/roles/\${guildId}\`, { headers }).then(res => res.json()).catch(() => []),
      fetch(\`/api/botprofile/\${guildId}\`).then(res => res.json()).catch(() => ({})),
      // mod_activity not critical for instant load but we can fetch it
      fetch(\`/api/mod_activity/\${guildId}\`, { headers }).then(res => res.json()).catch(() => [])
    ]).then(([configData, rolesData, botProfileData, modActivityData]) => {
      // Also channels might be needed for CustomSelect, some tabs fetch it. Let's fetch channels too!
      fetch(\`/api/channels/\${guildId}\`, { headers }).then(res => res.json()).catch(() => []).then(channelsData => {
        const fullData = {
          config: configData.config || configData, 
          roles: Array.isArray(rolesData) ? rolesData : (rolesData.roles || []),
          channels: Array.isArray(channelsData) ? channelsData : (channelsData.channels || []),
          botProfile: botProfileData,
          modActivity: modActivityData
        };
        setServerData(fullData);
        setCache(\`global_data_\${guildId}\`, fullData);
        setDataLoading(false);
      });
    });`;

const newEffect = `    setServerData({
      config: null,
      roles: null,
      channels: null,
      botProfile: null,
      modActivity: null
    });

    fetch(\`/api/config/\${guildId}\`, { headers })
      .then(res => res.json())
      .then(data => setServerData(prev => ({ ...prev, config: data.config || data })))
      .catch(() => setServerData(prev => ({ ...prev, config: {} })));

    fetch(\`/api/roles/\${guildId}\`, { headers })
      .then(res => res.json())
      .then(data => setServerData(prev => ({ ...prev, roles: Array.isArray(data) ? data : (data.roles || []) })))
      .catch(() => setServerData(prev => ({ ...prev, roles: [] })));

    fetch(\`/api/channels/\${guildId}\`, { headers })
      .then(res => res.json())
      .then(data => setServerData(prev => ({ ...prev, channels: Array.isArray(data) ? data : (data.channels || []) })))
      .catch(() => setServerData(prev => ({ ...prev, channels: [] })));

    fetch(\`/api/botprofile/\${guildId}\`)
      .then(res => res.json())
      .then(data => setServerData(prev => ({ ...prev, botProfile: data })))
      .catch(() => setServerData(prev => ({ ...prev, botProfile: {} })));

    fetch(\`/api/mod_activity/\${guildId}\`, { headers })
      .then(res => res.json())
      .then(data => setServerData(prev => ({ ...prev, modActivity: data })))
      .catch(() => setServerData(prev => ({ ...prev, modActivity: [] })));`;

c = c.replace(oldEffect, newEffect);
c = c.replace(/const \[dataLoading, setDataLoading\] = useState\(true\);\n/g, '');
c = c.replace(/if \(loading \|\| dataLoading\) return <LoadingScreen \/>;/g, 'if (loading) return <LoadingScreen />;');

fs.writeFileSync('src/pages/Dashboard.jsx', c);
