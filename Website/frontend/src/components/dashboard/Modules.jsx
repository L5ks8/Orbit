import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Toggle from '../ui/Toggle';
import { useToast } from '../ui/Toast';
import LoadingScreen from '../ui/LoadingScreen';
import { getCache, setCache } from '../../utils/cache';

import AutomodSettings from './modules/AutomodSettings';
import TicketSettings from './modules/TicketSettings';
import AutoresponderSettings from './modules/AutoresponderSettings';
import WelcomeSettings from './modules/WelcomeSettings';
import BanAppealsSettings from './modules/BanAppealsSettings';
import AutomationSettings from './modules/AutomationSettings';
import BoostMessagesSettings from './modules/BoostMessagesSettings';
import EconomySettings from './modules/EconomySettings';
import MessageLogsSettings from './modules/MessageLogsSettings';

import ServerStatsSettings from './modules/ServerStatsSettings';
import TempVoiceSettings from './modules/TempVoiceSettings';
import LevelingSystemSettings from './modules/LevelingSystemSettings';

export const modulesList = [
    { id: 'automod', category: 'Moderation', name: 'Auto-Moderation', desc: 'Automatically filter spam, bad words, and malicious links.', iconColor: 'rgba(239, 68, 68, 0.2)', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
    { id: 'appeals', category: 'Moderation', name: 'Ban Appeals', desc: 'Allow banned users to appeal their punishments.', iconColor: 'rgba(139, 92, 246, 0.2)', icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" /> },


    { id: 'welcomegoodbye', category: 'Engagement', name: 'Welcome & Goodbye Messages', desc: 'Greet new users with custom text and image cards.', iconColor: 'rgba(59, 130, 246, 0.2)', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></> },
    { id: 'level', category: 'Engagement', name: 'Leveling System', desc: 'Reward active members with XP and roles.', iconColor: 'rgba(16, 185, 129, 0.2)', icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></> },
    { id: 'boost', category: 'Engagement', name: 'Boost Messages', desc: 'Announce when someone boosts your server.', iconColor: 'rgba(244, 63, 94, 0.2)', icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01" /> },
    { id: 'economy', category: 'Engagement', name: 'Economy', desc: 'Global server currency, shops, and gambling.', iconColor: 'rgba(234, 179, 8, 0.2)', icon: <><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8 M12 18V6" /></> },
        { id: 'serverstats', category: 'Engagement', name: 'Server Stats', desc: 'Display member counts in voice channels.', iconColor: 'rgba(6, 182, 212, 0.2)', icon: <path d="M18 20V10 M12 20V4 M6 20v-6" /> },

    { id: 'tickets', category: 'Utility', name: 'Support Tickets', desc: 'Allow users to open private tickets for support.', iconColor: 'rgba(245, 158, 11, 0.2)', icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /> },
    { id: 'automation', category: 'Utility', name: 'Automation', desc: 'Create custom triggers and actions for your server.', iconColor: 'rgba(236, 72, 153, 0.2)', icon: <path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
    { id: 'autoresponder', category: 'Utility', name: 'Auto Responder', desc: 'Automatically reply to specific keywords.', iconColor: 'rgba(14, 165, 233, 0.2)', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
    { id: 'tempvoice', category: 'Utility', name: 'Temp Voice', desc: 'Allow users to create their own voice channels.', iconColor: 'rgba(249, 115, 22, 0.2)', icon: <path d="M12 2c-1.7 0-3 1.2-3 2.6v6.8c0 1.4 1.3 2.6 3 2.6s3-1.2 3-2.6V4.6C15 3.2 13.7 2 12 2z M19 10v1.6c0 3.6-3.1 6.4-7 6.4s-7-2.8-7-6.4V10 M12 18v4 M8 22h8" /> },

];

export default function Modules({ guildId, serverData, setServerData }) {

  const { moduleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const cacheKey = `modules_config_${guildId}`;
  
  
  const [saving, setSaving] = useState(false);
  const [formKey, setFormKey] = useState(0);



  // Redirect to first module if no module is selected or redirect old paths
  useEffect(() => {
    if (!moduleId && guildId) {
      navigate(`/dashboard/${guildId}/automod`, { replace: true });
    } else if (moduleId === 'welcome' && guildId) {
      navigate(`/dashboard/${guildId}/welcomegoodbye`, { replace: true });
    } else if (moduleId === 'goodbye' && guildId) {
      navigate(`/dashboard/${guildId}/welcomegoodbye`, { replace: true });
    }
  }, [moduleId, navigate, guildId]);

  const handleReset = () => {
    setFormKey(prev => prev + 1);
  };

  

  const handleSave = async (payload, preventRemount = false) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/config/${guildId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) {
        toast("Failed to save: " + data.error, 'error');
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
        toast("Settings saved successfully!", 'success');
        if (!preventRemount) {
          handleReset();
        }
      }
    } catch (e) {
      console.error(e);
      toast("Error saving settings.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (id) => {
    if (!serverData) return;

    const cfg = serverData.config || {};
    const backendKey = id === 'tickets' ? 'ticket' : id;
    
    // Determine current state
    let currentState = false;
    if (id === 'autoresponder') currentState = cfg.autoresponder_enabled;
    else if (id === 'messages') currentState = cfg.messages_enabled;
    else currentState = cfg[backendKey]?.enabled;
    
    const newState = !currentState;

    let payload = {};
    if (id === 'autoresponder' || id === 'messages') {
      payload = {
        settings: {
          autoresponder_enabled: id === 'autoresponder' ? newState : (cfg.autoresponder_enabled || false),
          messages_enabled: id === 'messages' ? newState : (cfg.messages_enabled || false)
        }
      };
    } else {
      const currentModConfig = cfg[backendKey] || {};
      payload[backendKey] = {
        ...currentModConfig,
        enabled: newState
      };
    }

    // Optimistic UI update
    setServerData(prev => {
      const newConfig = { ...prev.config };
      if (id === 'autoresponder') newConfig.autoresponder_enabled = newState;
      else if (id === 'messages') newConfig.messages_enabled = newState;
      else newConfig[backendKey] = { ...newConfig[backendKey], enabled: newState };
      return { ...prev, config: newConfig };
    });

    fetch(`/api/config/${guildId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error("Failed to save:", data.error);
          toast("Failed to toggle module", "error");
          // Revert optimistic update
          setServerData(prev => {
            const newConfig = { ...prev.config };
            if (id === 'autoresponder') newConfig.autoresponder_enabled = currentState;
            else if (id === 'messages') newConfig.messages_enabled = currentState;
            else newConfig[backendKey] = { ...newConfig[backendKey], enabled: currentState };
            return { ...prev, config: newConfig };
          });
        }
      })
      .catch(err => {
        console.error(err);
        toast("Network error while toggling module", "error");
      });
  };

  const getModuleState = (id) => {
    if (!serverData) return false;
    const cfg = serverData.config || {};
    if (id === 'autoresponder') return cfg.autoresponder_enabled || false;
    if (id === 'messages') return cfg.messages_enabled || false;
    const backendKey = id === 'tickets' ? 'ticket' : id;
    return cfg[backendKey]?.enabled || false;
  };

  const renderModuleContent = () => {
    if (!serverData) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ef4444' }}>Failed to load data.</div>;

    const moduleInfo = modulesList.find(m => m.id === moduleId);
    
    let Component;
    if (moduleId === 'automod') Component = AutomodSettings;
    else if (moduleId === 'tickets') Component = TicketSettings;
    else if (moduleId === 'autoresponder') Component = AutoresponderSettings;
    else if (moduleId === 'welcomegoodbye') Component = WelcomeSettings;
    else if (moduleId === 'appeals') Component = BanAppealsSettings;
    else if (moduleId === 'automation') Component = AutomationSettings;
    else if (moduleId === 'boost') Component = BoostMessagesSettings;
    else if (moduleId === 'economy') Component = EconomySettings;
    else if (moduleId === 'messages') Component = MessageLogsSettings;

    else if (moduleId === 'serverstats') Component = ServerStatsSettings;
    else if (moduleId === 'tempvoice') Component = TempVoiceSettings;
    else if (moduleId === 'level') Component = LevelingSystemSettings;
    else return <div style={{ padding: '50px', color: '#fff', textAlign: 'center' }}>Module not found.</div>;

    const isFullScreenModule = ['welcomegoodbye', 'appeals', 'level', 'tickets'].includes(moduleId);
    if (isFullScreenModule) {
      return (
        <div className="animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
          <Component 
            key={formKey}
            guildId={guildId}
            config={serverData.config}
            channels={serverData.channels || []}
            voiceChannels={serverData.voice_channels || []}
            roles={serverData.roles || []}
            categories={serverData.categories || []}
            onSave={handleSave}
            saving={saving}
            onReset={handleReset}
          />
        </div>
      );
    }

    return (
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: moduleInfo.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
                {moduleInfo.icon}
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0, marginBottom: '4px' }}>{moduleInfo.name}</h1>
              <p style={{ color: '#949ba4', margin: 0, fontSize: '15px' }}>{moduleInfo.desc}</p>
            </div>
          </div>
          <div style={{ pointerEvents: 'auto' }}>
             <Toggle checked={getModuleState(moduleId)} onChange={() => toggleModule(moduleId)} />
          </div>
        </div>

        <Component 
          key={formKey}
          guildId={guildId}
          config={serverData.config}
          channels={serverData.channels || []}
          voiceChannels={serverData.voice_channels || []}
          roles={serverData.roles || []}
          categories={serverData.categories || []}
          onSave={handleSave}
          saving={saving}
          onReset={handleReset}
        />
      </div>
    );
  };

  const categories = ['Moderation', 'Engagement', 'Utility', 'Logging'];



  if (!serverData || !serverData.config) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#ef4444' }}><LoadingScreen text="Loading settings..." /></div>;

  const content = renderModuleContent();

  return (
    <div className="module-container" style={{ flexGrow: 1, overflowY: 'auto' }}>
      {content}
    </div>
  );
}
