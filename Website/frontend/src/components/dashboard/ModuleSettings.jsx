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

export default function ModuleSettings() {
  const { moduleId } = useParams();

  // Basic mock data for module info
  const modulesInfo = {
    automod: { name: 'Auto-Moderation', desc: 'Configure filters and actions for bad words and spam.' },
    welcome: { name: 'Welcome Messages', desc: 'Set up welcome channels and customize the welcome image card.' },
    leveling: { name: 'Leveling System', desc: 'Adjust XP rates and role rewards.' },
    tickets: { name: 'Support Tickets', desc: 'Manage ticket categories and support roles.' },
    reactionroles: { name: 'Reaction Roles', desc: 'Create messages where users can claim roles by reacting.' },
    logging: { name: 'Server Logging', desc: 'Select which events to log and where.' },
  };

  const module = modulesInfo[moduleId] || { name: moduleId, desc: 'Settings for this module.' };

  const [activeChannel, setActiveChannel] = React.useState('general');

  const channelOptions = [
    { value: 'general', label: '# general' },
    { value: 'welcome', label: '# welcome' },
    { value: 'logs', label: '# logs' },
  ];

  const wrap = (Component) => (
    <div className="dash-settings">
      <div className="dash-settings-header" style={{ marginBottom: '24px' }}>
        <Link to="/dashboard/modules" className="dash-back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Modules
        </Link>
      </div>
      <Component />
    </div>
  );

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

  return (
    <div className="dash-settings">
      <div className="dash-settings-header">
        <Link to="/dashboard/modules" className="dash-back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Modules
        </Link>
        <div className="settings-title-row">
          <h1 className="dash-title">{module.name}</h1>
          <Toggle checked={true} onChange={() => {}} />
        </div>
        <p className="dash-subtitle">{module.desc}</p>
      </div>

      <div className="dash-card settings-card">
        <h3>General Settings</h3>
        <div className="settings-form">
          <div className="form-group">
            <label>Active Channel</label>
            <CustomSelect 
              options={channelOptions} 
              value={activeChannel} 
              onChange={setActiveChannel} 
              placeholder="Select a channel..."
            />
            <span className="form-hint">Select the channel where this module will operate.</span>
          </div>

          <div className="form-group">
            <label>Custom Message</label>
            <textarea className="dash-input" rows="4" defaultValue="Hello {user}, welcome to {server}!"></textarea>
          </div>

          <div className="form-group inline">
            <div className="form-text">
              <label>Delete after sending</label>
              <span className="form-hint">Automatically delete the message after 5 minutes.</span>
            </div>
            <Toggle checked={false} onChange={() => {}} />
          </div>
        </div>
        <div className="settings-footer">
          <button className="dash-btn primary">Save Changes</button>
          <button className="dash-btn secondary">Discard</button>
        </div>
      </div>
    </div>
  );
}
