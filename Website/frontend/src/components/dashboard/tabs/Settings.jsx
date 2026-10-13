import React, { useState, useEffect } from 'react';
import CustomSelect from '../../ui/CustomSelect';
import Toggle from '../../ui/Toggle';
import SaveBar from '../../ui/SaveBar';
import { useToast } from '../../ui/Toast';
import { getCache, setCache } from '../../../utils/cache';
import { Settings as SettingsIcon, ShieldAlert, Shield, Cpu, UserMinus } from 'lucide-react';

export default function Settings({ guildId, serverData, setServerData }) {
  const toast = useToast();
  const [settings, setSettings] = useState({
    manager_roles: [],
    immune_roles: [],
    autoresponder_enabled: false,
    messages_enabled: false
  });
  const [immuneUsers, setImmuneUsers] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [fetchingUser, setFetchingUser] = useState(false);
  
  const [extraSettings, setExtraSettings] = useState({
    ai_enabled: true
  });
  const [roles, setRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const cacheKey = `modules_config_${guildId}`;
  
  const [loading, setLoading] = useState(() => !getCache(cacheKey));

  useEffect(() => {
    if (!guildId) return;
    
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      const s = cachedData.config?.settings || {};
      const ext = cachedData.config?.extra_settings || {};
      
      setSettings({
        manager_roles: s.manager_roles || [],
        immune_roles: s.immune_roles || [],
        autoresponder_enabled: s.autoresponder_enabled || false,
        messages_enabled: s.messages_enabled || false
      });
      setImmuneUsers(s.immune_users || []);
      
      setExtraSettings({
        ai_enabled: ext.ai_enabled ?? true
      });

      setInitialState(JSON.stringify(getPayload(
        { ...s, manager_roles: s.manager_roles || [], immune_roles: s.immune_roles || [] }, 
        s.immune_users || [], 
        { ...ext }
      )));
      setRoles(cachedData.roles || []);
    } else {
      setLoading(true);
    }

    fetch(`/api/config/${guildId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const s = data.config?.settings || {};
        const ext = data.config?.extra_settings || {};
        
        setSettings({
          manager_roles: s.manager_roles || [],
          immune_roles: s.immune_roles || [],
          autoresponder_enabled: s.autoresponder_enabled || false,
          messages_enabled: s.messages_enabled || false
        });
        setImmuneUsers(s.immune_users || []);
        
        setExtraSettings({
          ai_enabled: ext.ai_enabled ?? true
        });

        setInitialState(JSON.stringify(getPayload(
          { ...s, manager_roles: s.manager_roles || [], immune_roles: s.immune_roles || [] }, 
          s.immune_users || [], 
          { ...ext }
        )));
        setRoles(data.roles || []);
        setCache(cacheKey, data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [guildId]);

  const getPayload = (s = settings, iu = immuneUsers, ext = extraSettings) => ({
    settings: {
      ...s,
      immune_users: iu.map(u => String(u.id))
    },
    extra_settings: ext
  });

  const [initialState, setInitialState] = useState('');
  const isDirty = Boolean(initialState && JSON.stringify(getPayload()) !== initialState);

  const saveSettings = () => {
    setSaving(true);
    const toastId = toast.loading("Saving...");
    fetch(`/api/config/${guildId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(getPayload())
    })
      .then(res => res.json())
      .then((data) => {
        if (data.error) {
          toast.error("Failed to save: " + data.error, { id: toastId });
        } else {
          toast.success("Saved", { id: toastId });
          setInitialState(JSON.stringify(getPayload()));
        }
      })
      .catch(() => toast.error("Failed to save settings.", { id: toastId }))
      .finally(() => setSaving(false));
  };

  const handleReset = () => {
    if (initialState) {
      const parsed = JSON.parse(initialState);
      const parsedS = parsed.settings || {};
      setSettings({
        manager_roles: parsedS.manager_roles || [],
        immune_roles: parsedS.immune_roles || [],
        autoresponder_enabled: parsedS.autoresponder_enabled || false,
        messages_enabled: parsedS.messages_enabled || false
      });
      const oldIds = parsedS.immune_users || [];
      setImmuneUsers(prev => prev.filter(u => oldIds.includes(String(u.id))));
      
      setExtraSettings(parsed.extra_settings || {});
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-neutral-500">
      <div className="w-8 h-8 rounded-full border-2 border-neutral-700 border-t-blue-500 animate-spin mb-3"></div>
      <div className="text-xs">Loading settings...</div>
    </div>
  );

  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5 w-full">
      {/* Header */}
      <div data-tour="feature-header" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <SettingsIcon className="w-5 h-5 text-neutral-400" />
            </span>
            <div>
              <h1 className="text-base font-medium text-white truncate">Server Settings</h1>
              <p className="text-xs text-neutral-400 mt-0.5">Configure bot management roles, command immunity, and server-wide switches.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Immunity Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-semibold text-white">Anti-Ban & Kick Immunity</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Users in this list or possessing these roles cannot be moderated (banned, kicked, timed out) by Orbit.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-neutral-300">Immune Roles</label>
            <CustomSelect 
              isMulti
              options={roleOptions}
              value={settings.immune_roles}
              onChange={(val) => setSettings({...settings, immune_roles: val})}
              placeholder="Select Immune Roles..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-neutral-300">Immune Users</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 h-9 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700" 
                placeholder="User ID (e.g. 123456789)"
                value={newUserId}
                onChange={e => setNewUserId(e.target.value)}
              />
              <button 
                className="h-9 px-3.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium transition-colors disabled:opacity-40"
                disabled={fetchingUser || !newUserId}
                onClick={() => {
                  if (!newUserId) return;
                  if (immuneUsers.find(u => u.id === newUserId)) {
                    toast("User already added", "error");
                    return;
                  }
                  setFetchingUser(true);
                  fetch(`/api/user/${newUserId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
                    .then(r => r.json())
                    .then(d => {
                      if (d.error) {
                        toast(d.error, 'error');
                      } else {
                        setImmuneUsers([...immuneUsers, d]);
                        setNewUserId('');
                      }
                    })
                    .catch(() => toast("Failed to fetch user", "error"))
                    .finally(() => setFetchingUser(false));
                }}
              >
                {fetchingUser ? '...' : 'Add User'}
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-1">
              {immuneUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between bg-neutral-950/60 border border-neutral-800/80 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full border border-neutral-700" />
                    <span className="text-xs font-medium text-white">{user.name}</span>
                  </div>
                  <button 
                    onClick={() => setImmuneUsers(immuneUsers.filter(u => u.id !== user.id))}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {immuneUsers.length === 0 && (
                <span className="text-xs text-neutral-500 italic">No immune users added yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manager Roles Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Dashboard Manager Roles</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Users with these roles can view and configure Orbit on this web dashboard without full Discord Administrator rights.
          </p>
        </div>
        
        <div>
          <CustomSelect 
            isMulti
            options={roleOptions}
            value={settings.manager_roles}
            onChange={(val) => setSettings({...settings, manager_roles: val})}
            placeholder="Select Manager Roles..."
          />
        </div>
      </div>

      {/* General Features Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">General Bot Features</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Toggle optional AI behaviors and background services.</p>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
          <div>
            <label className="text-xs font-semibold text-white block">AI Chatbot Responses</label>
            <span className="text-[11px] text-neutral-400">Allow Orbit to respond conversationally when mentioned in chat.</span>
          </div>
          <Toggle 
            checked={extraSettings.ai_enabled} 
            onChange={() => setExtraSettings({...extraSettings, ai_enabled: !extraSettings.ai_enabled})} 
          />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
          <div>
            <label className="text-xs font-semibold text-white block">Autoresponder Module</label>
            <span className="text-[11px] text-neutral-400">Enable or disable custom keyword trigger responses.</span>
          </div>
          <Toggle 
            checked={settings.autoresponder_enabled} 
            onChange={() => setSettings({...settings, autoresponder_enabled: !settings.autoresponder_enabled})} 
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <label className="text-xs font-semibold text-white block">Message Tracking</label>
            <span className="text-[11px] text-neutral-400">Track and index message counts for leaderboards and analytics.</span>
          </div>
          <Toggle 
            checked={settings.messages_enabled} 
            onChange={() => setSettings({...settings, messages_enabled: !settings.messages_enabled})} 
          />
        </div>
      </div>

      <SaveBar show={isDirty} onReset={handleReset} onSave={saveSettings} saving={saving} />
    </main>
  );
}
