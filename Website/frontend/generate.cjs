const fs = require('fs');
const modules = [
  { id: 'appeals', name: 'Ban Appeals' },
  { id: 'automation', name: 'Automation' },
  { id: 'boost', name: 'Boost Messages' },
  { id: 'economy', name: 'Economy' },
  { id: 'goodbye', name: 'Goodbye Messages' },
  { id: 'joinroles', name: 'Join Roles' },
  { id: 'logs', name: 'Audit Logs' },
  { id: 'messages', name: 'Message Logs' },
  { id: 'security', name: 'Security' },
  { id: 'serverstats', name: 'Server Stats' },
  { id: 'tempvoice', name: 'Temp Voice' },
  { id: 'verify', name: 'Verification' },
  { id: 'level', name: 'Leveling System' }
];

modules.forEach(m => {
  const compName = m.name.replace(/ /g, '') + 'Settings';
  const content = `import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';

export default function ${compName}() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">${m.name}</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Configure settings for ${m.name}.</p>
          </div>
          <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
        </div>
      </div>
      <div className="dash-card settings-card">
        <div className="settings-form">
          <p style={{ color: 'var(--text-muted)' }}>This module is currently under construction. More settings will be available soon.</p>
        </div>
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(`./src/components/dashboard/modules/${compName}.jsx`, content);
});
console.log('Files created');
