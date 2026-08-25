const fs = require('fs');

const file = 'src/components/dashboard/tabs/Security.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Strip <div className="lg:pl-64 relative"> and <header>
const mainIndex = content.indexOf('<main');
const returnIndex = content.indexOf('return (');
content = content.substring(0, returnIndex + 8) + '\n    ' + content.substring(mainIndex);

// Strip the final closing </div>
content = content.replace(/<\/main>\s*<\/div>\s*\);\s*}\s*$/, '</main>\n  );\n}');

// 2. Add class to <main>
content = content.replace('<main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto">', '<main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5">');

// 3. Define the state setter names in exact order
const toggleReplacements = [
  '<TailwindToggle checked={antiNuke.enabled} onChange={() => setAntiNuke({...antiNuke, enabled: !antiNuke.enabled})} />',
  '<TailwindToggle checked={antiNuke.test_mode} onChange={() => setAntiNuke({...antiNuke, test_mode: !antiNuke.test_mode})} />',
  '<TailwindToggle checked={antiNuke.privilege_escalation} onChange={() => setAntiNuke({...antiNuke, privilege_escalation: !antiNuke.privilege_escalation})} />',
  '<TailwindToggle checked={antiNuke.webhook_firewall} onChange={() => setAntiNuke({...antiNuke, webhook_firewall: !antiNuke.webhook_firewall})} />',
  '<TailwindToggle checked={antiNuke.server_identity} onChange={() => setAntiNuke({...antiNuke, server_identity: !antiNuke.server_identity})} />',
  '<TailwindToggle checked={antiNuke.block_unknown_bot} onChange={() => setAntiNuke({...antiNuke, block_unknown_bot: !antiNuke.block_unknown_bot})} />',
  '<TailwindToggle checked={antiRaid.enabled} onChange={() => setAntiRaid({...antiRaid, enabled: !antiRaid.enabled})} />',
  '<TailwindToggle checked={antiRaid.verification_challenge} onChange={() => setAntiRaid({...antiRaid, verification_challenge: !antiRaid.verification_challenge})} />',
  '<TailwindToggle checked={antiRaid.suspicious_account} onChange={() => setAntiRaid({...antiRaid, suspicious_account: !antiRaid.suspicious_account})} />',
  '<TailwindToggle checked={antiRaid.no_profile_picture} onChange={() => setAntiRaid({...antiRaid, no_profile_picture: !antiRaid.no_profile_picture})} />',
  '<TailwindToggle checked={antiRaid.default_username} onChange={() => setAntiRaid({...antiRaid, default_username: !antiRaid.default_username})} />',
  '<TailwindToggle checked={webhookProtection.enabled} onChange={() => setWebhookProtection({...webhookProtection, enabled: !webhookProtection.enabled})} />',
  '<TailwindToggle checked={webhookProtection.block_everyone} onChange={() => setWebhookProtection({...webhookProtection, block_everyone: !webhookProtection.block_everyone})} />',
  '<TailwindToggle checked={webhookProtection.block_invite_links} onChange={() => setWebhookProtection({...webhookProtection, block_invite_links: !webhookProtection.block_invite_links})} />',
];

const togglePattern = /<button\s+type="button"\s+role="switch"[\s\S]*?<\/button>/;
for (let i = 0; i < toggleReplacements.length; i++) {
  content = content.replace(togglePattern, toggleReplacements[i]);
}

// 4. Inject component imports and logic
const header = `import React, { useState, useEffect } from 'react';
import SaveBar from '../../ui/SaveBar';
import { useToast } from '../../ui/Toast';
import { getCache, setCache } from '../../../utils/cache';
import LoadingScreen from '../../ui/LoadingScreen';

const TailwindToggle = ({ checked, onChange }) => (
    <button 
      type="button" 
      role="switch" 
      aria-checked={checked} 
      onClick={onChange}
      className={\`relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 \${checked ? 'bg-white' : 'bg-neutral-800'}\`}
    >
      <span className={\`pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-all duration-300 ease-out will-change-transform \${checked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-400'}\`} />
    </button>
);
`;

const logic = `
  const { toast } = useToast();
  const cachedServerData = getCache(guildId);
  const initialCfg = cachedServerData?.config?.security || {};

  const [loading, setLoading] = useState(!cachedServerData);
  const [initialStateStr, setInitialStateStr] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // States
  const [antiNuke, setAntiNuke] = useState({ enabled: false, test_mode: false, privilege_escalation: false, webhook_firewall: false, server_identity: false, block_unknown_bot: false, ...initialCfg.anti_nuke });
  const [antiRaid, setAntiRaid] = useState({ enabled: false, verification_challenge: false, suspicious_account: false, no_profile_picture: false, default_username: false, ...initialCfg.anti_raid });
  const [webhookProtection, setWebhookProtection] = useState({ enabled: false, block_everyone: false, block_invite_links: false, ...initialCfg.webhook_protection });

  const getPayload = () => ({
    anti_nuke: antiNuke,
    anti_raid: antiRaid,
    webhook_protection: webhookProtection
  });

  useEffect(() => {
    if (cachedServerData) {
      setInitialStateStr(JSON.stringify({
        anti_nuke: cachedServerData.config?.security?.anti_nuke || { enabled: false, test_mode: false, privilege_escalation: false, webhook_firewall: false, server_identity: false, block_unknown_bot: false },
        anti_raid: cachedServerData.config?.security?.anti_raid || { enabled: false, verification_challenge: false, suspicious_account: false, no_profile_picture: false, default_username: false },
        webhook_protection: cachedServerData.config?.security?.webhook_protection || { enabled: false, block_everyone: false, block_invite_links: false }
      }));
      setLoading(false);
    } else {
      fetch(\`/api/guilds/\${guildId}\`)
        .then(res => res.json())
        .then(data => {
          setCache(guildId, data);
          const cfg = data.config?.security || {};
          setAntiNuke({ enabled: false, test_mode: false, privilege_escalation: false, webhook_firewall: false, server_identity: false, block_unknown_bot: false, ...cfg.anti_nuke });
          setAntiRaid({ enabled: false, verification_challenge: false, suspicious_account: false, no_profile_picture: false, default_username: false, ...cfg.anti_raid });
          setWebhookProtection({ enabled: false, block_everyone: false, block_invite_links: false, ...cfg.webhook_protection });
          setInitialStateStr(JSON.stringify({
            anti_nuke: cfg.anti_nuke || { enabled: false, test_mode: false, privilege_escalation: false, webhook_firewall: false, server_identity: false, block_unknown_bot: false },
            anti_raid: cfg.anti_raid || { enabled: false, verification_challenge: false, suspicious_account: false, no_profile_picture: false, default_username: false },
            webhook_protection: cfg.webhook_protection || { enabled: false, block_everyone: false, block_invite_links: false }
          }));
          setLoading(false);
        })
        .catch(console.error);
    }
  }, [guildId]);

  const handleSave = async (payloadString) => {
    setIsSaving(true);
    const toastId = toast.loading("Saving settings...");
    try {
      const dataToSave = payloadString ? JSON.parse(payloadString) : getPayload();
      const res = await fetch(\`/api/guilds/\${guildId}/config\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ security: dataToSave })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const updatedData = { ...cachedServerData, config: { ...cachedServerData?.config, security: dataToSave } };
      setCache(guildId, updatedData);
      setInitialStateStr(JSON.stringify(dataToSave));
      toast.success("Settings saved", { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Error saving settings", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const currentPayloadStr = JSON.stringify(getPayload());
  const isDirty = initialStateStr && currentPayloadStr !== initialStateStr;

  useEffect(() => {
    if (!initialStateStr || !isDirty) return;
    const timeoutId = setTimeout(() => {
      handleSave(currentPayloadStr);
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [currentPayloadStr, initialStateStr, isDirty]);

  if (loading) {
    return (
      <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5">
        <div data-tour="feature-header" className="scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check w-5 h-5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
              </span>
              <h1 className="text-base font-medium text-white truncate">Security</h1>
            </div>
          </div>
        </div>
        <LoadingScreen text="Loading Security..." />
      </main>
    );
  }
`;

content = content.replace('import React from "react";', header);
content = content.replace('export default function Security() {', 'export default function Security({ guildId }) {');
content = content.replace('return (', logic + '\n  return (\n    <>\n      <SaveBar show={isDirty} onSave={() => handleSave()} onReset={() => window.location.reload()} isSaving={isSaving} />');

// Inject closing fragment
content = content.replace('</main>', '</main>\n    </>');

fs.writeFileSync(file, content);
