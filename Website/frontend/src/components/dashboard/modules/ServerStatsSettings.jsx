import Toggle from '../../ui/Toggle';
import React, { useState, useEffect } from 'react';
import CustomSelect from '../../ui/CustomSelect';

export default function ServerStatsSettings({ config, categories, onSave, saving, onReset }) {
  const ssCfg = config?.serverstats || {};

  const [enabled, setEnabled] = useState(ssCfg.enabled || false);
  const [categoryId, setCategoryId] = useState(ssCfg.category_id || '');
  const [categoryName, setCategoryName] = useState(ssCfg.category_name || ' Server Stats');
  
  const [usersEnabled, setUsersEnabled] = useState(ssCfg.users_enabled || false);
  const [usersName, setUsersName] = useState(ssCfg.users_name || 'Users: {count}');
  
  const [boostsEnabled, setBoostsEnabled] = useState(ssCfg.boosts_enabled || false);
  const [boostsName, setBoostsName] = useState(ssCfg.boosts_name || 'Boosts: {count}');
  
  const [botsEnabled, setBotsEnabled] = useState(ssCfg.bots_enabled || false);
  const [botsName, setBotsName] = useState(ssCfg.bots_name || 'Bots: {count}');
  
  const [rolesEnabled, setRolesEnabled] = useState(ssCfg.roles_enabled || false);
  const [rolesName, setRolesName] = useState(ssCfg.roles_name || 'Roles: {count}');

  const categoryOptions = (categories || []).map(c => ({ value: c.id, label: c.name }));

  const getPayload = () => ({
      serverstats: {
        enabled: enabled,
        category_id: categoryId,
        category_name: categoryName,
        users_enabled: usersEnabled,
        users_name: usersName,
        boosts_enabled: boostsEnabled,
        boosts_name: boostsName,
        bots_enabled: botsEnabled,
        bots_name: botsName,
        roles_enabled: rolesEnabled,
        roles_name: rolesName
      }
    });

  const [savedStateStr, setSavedStateStr] = useState(() => JSON.stringify(getPayload()));
  const currentPayloadStr = JSON.stringify(getPayload());
  const isDirty = savedStateStr && currentPayloadStr !== savedStateStr;

  useEffect(() => {
    if (!savedStateStr || !isDirty) return;
    const timeoutId = setTimeout(() => {
      onSave(getPayload(), true);
      setSavedStateStr(currentPayloadStr);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentPayloadStr, savedStateStr, isDirty, onSave]);

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5 w-full">
      <div data-tour="feature-header" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-2 w-5 h-5">
                <line x1="18" x2="18" y1="20" y2="10" />
                <line x1="12" x2="12" y1="20" y2="4" />
                <line x1="6" x2="6" y1="20" y2="14" />
              </svg>
            </span>
            <h1 className="text-base font-medium text-white truncate">
              Server Stats
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Master Toggle */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-900/30 text-teal-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-2">
                  <line x1="18" x2="18" y1="20" y2="10" />
                  <line x1="12" x2="12" y1="20" y2="4" />
                  <line x1="6" x2="6" y1="20" y2="14" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-semibold text-white truncate">Server Stats</span>
                <span className="text-[13px] text-neutral-400 truncate">Display member counts in voice channels.</span>
              </div>
            </div>
            <Toggle checked={enabled} onChange={setEnabled} />
          </div>
        </div>

        {/* Categories / Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Main Config */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] p-5 md:col-span-2">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-neutral-300">Category <span className="text-red-500">*</span></label>
              <span className="text-xs text-neutral-500">Category in which the channels will be created.</span>
              <div className="w-full relative z-50">
                <CustomSelect options={categoryOptions} value={categoryId} onChange={setCategoryId} placeholder="Select category..." />
              </div>
            </div>
          </div>
          

          {/* Users */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-blue-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users text-blue-400">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">Users</span>
                  <span className="text-[12px] text-neutral-400 truncate">Total number of users.</span>
                </div>
              </div>
              <Toggle checked={usersEnabled} onChange={setUsersEnabled} />
            </div>
            <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
              <div className="pt-4">
                <input type="text" className="w-full h-9 bg-neutral-950 border border-neutral-800 rounded-lg px-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all" value={usersName} onChange={e => setUsersName(e.target.value)} placeholder="Users: {count}" />
              </div>
            </div>
          </div>

          {/* Boosts */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-pink-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gem text-pink-400">
                    <polygon points="6 3 18 3 22 9 12 22 2 9" />
                    <path d="M11.7 22 8 9" />
                    <path d="M12.3 22 16 9" />
                    <path d="M2 9h20" />
                    <path d="M6 3v6" />
                    <path d="M18 3v6" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">Boosts</span>
                  <span className="text-[12px] text-neutral-400 truncate">Total number of boosts.</span>
                </div>
              </div>
              <Toggle checked={boostsEnabled} onChange={setBoostsEnabled} />
            </div>
            <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
              <div className="pt-4">
                <input type="text" className="w-full h-9 bg-neutral-950 border border-neutral-800 rounded-lg px-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all" value={boostsName} onChange={e => setBoostsName(e.target.value)} placeholder="Boosts: {count}" />
              </div>
            </div>
          </div>

          {/* Bots */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-green-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot text-green-400">
                    <path d="M12 8V4H8" />
                    <rect width="16" height="12" x="4" y="8" rx="2" />
                    <path d="M2 14h2" />
                    <path d="M20 14h2" />
                    <path d="M15 13v2" />
                    <path d="M9 13v2" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">Bots</span>
                  <span className="text-[12px] text-neutral-400 truncate">Total number of bots.</span>
                </div>
              </div>
              <Toggle checked={botsEnabled} onChange={setBotsEnabled} />
            </div>
            <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
              <div className="pt-4">
                <input type="text" className="w-full h-9 bg-neutral-950 border border-neutral-800 rounded-lg px-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all" value={botsName} onChange={e => setBotsName(e.target.value)} placeholder="Bots: {count}" />
              </div>
            </div>
          </div>

          {/* Roles */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-yellow-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tag text-yellow-400">
                    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">Roles</span>
                  <span className="text-[12px] text-neutral-400 truncate">Total number of roles.</span>
                </div>
              </div>
              <Toggle checked={rolesEnabled} onChange={setRolesEnabled} />
            </div>
            <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
              <div className="pt-4">
                <input type="text" className="w-full h-9 bg-neutral-950 border border-neutral-800 rounded-lg px-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all" value={rolesName} onChange={e => setRolesName(e.target.value)} placeholder="Roles: {count}" />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
