import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Toggle from '../ui/Toggle';
import CustomSelect from '../ui/CustomSelect';
import AutomodSettings from './modules/AutomodSettings';
import TicketSettings from './modules/TicketSettings';
import AutoresponderSettings from './modules/AutoresponderSettings';
import WelcomeSettings from './modules/WelcomeSettings';
import BanAppealsSettings from './modules/BanAppealsSettings';
import AutomationSettings from './modules/AutomationSettings';
import BoostMessagesSettings from './modules/BoostMessagesSettings';
import EconomySettings from './modules/EconomySettings';
import GoodbyeMessagesSettings from './modules/GoodbyeMessagesSettings';
import JoinRolesSettings from './modules/JoinRolesSettings';
import AuditLogsSettings from './modules/AuditLogsSettings';
import MessageLogsSettings from './modules/MessageLogsSettings';
import SecuritySettings from './modules/SecuritySettings';
import ServerStatsSettings from './modules/ServerStatsSettings';
import TempVoiceSettings from './modules/TempVoiceSettings';
import VerificationSettings from './modules/VerificationSettings';
import LevelingSystemSettings from './modules/LevelingSystemSettings';

export default function ModuleSettings({ guildId }) {
  const { moduleId } = useParams();

  const [serverData, setServerData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!guildId) return;
    setLoading(true);
    fetch(`/api/config/${guildId}`)
      .then(res => res.json())
      .then(data => {
        setServerData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [guildId]);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/config/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) {
        alert("Failed to save: " + data.error);
      } else {
        // Optimistically update local config state
        setServerData(prev => {
          const newConfig = { ...prev.config };
          Object.keys(payload).forEach(key => {
            if (typeof payload[key] === 'object' && payload[key] !== null && !Array.isArray(payload[key])) {
              newConfig[key] = { ...newConfig[key], ...payload[key] };
            } else {
              newConfig[key] = payload[key];
            }
          });
          return { ...prev, config: newConfig };
        });
        alert("Settings saved successfully!");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const wrap = (Component) => {
    if (loading) return <div style={{padding: '50px', textAlign: 'center', color: '#fff'}}>Loading module settings...</div>;
    if (!serverData) return <div style={{padding: '50px', textAlign: 'center', color: '#ef4444'}}>Failed to load data.</div>;

    return (
      <div className="dash-settings">
        <div className="dash-settings-header" style={{ marginBottom: '24px' }}>
          <Link to={`/dashboard/${guildId}/modules`} className="dash-back-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Modules
          </Link>
        </div>
        <Component 
          guildId={guildId}
          config={serverData.config}
          channels={serverData.channels || []}
          voiceChannels={serverData.voice_channels || []}
          roles={serverData.roles || []}
          categories={serverData.categories || []}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    );
  };

  if (moduleId === 'automod') return wrap(AutomodSettings);
  if (moduleId === 'tickets') return wrap(TicketSettings);
  if (moduleId === 'autoresponder') return wrap(AutoresponderSettings);
  if (moduleId === 'welcome') return wrap(WelcomeSettings);
  
  if (moduleId === 'appeals') return wrap(BanAppealsSettings);
  if (moduleId === 'automation') return wrap(AutomationSettings);
  if (moduleId === 'boost') return wrap(BoostMessagesSettings);
  if (moduleId === 'economy') return wrap(EconomySettings);
  if (moduleId === 'goodbye') return wrap(GoodbyeMessagesSettings);
  if (moduleId === 'joinroles') return wrap(JoinRolesSettings);
  if (moduleId === 'logs') return wrap(AuditLogsSettings);
  if (moduleId === 'messages') return wrap(MessageLogsSettings);
  if (moduleId === 'security') return wrap(SecuritySettings);
  if (moduleId === 'serverstats') return wrap(ServerStatsSettings);
  if (moduleId === 'tempvoice') return wrap(TempVoiceSettings);
  if (moduleId === 'verify') return wrap(VerificationSettings);
  if (moduleId === 'level') return wrap(LevelingSystemSettings);

  return <div style={{padding: '50px', color: '#fff'}}>Module not found.</div>;
}
