import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, Activity, Mic, Ticket, Settings, ArrowUpRight, ArrowRight, ShieldAlert, ShieldCheck, UserMinus, Vote, UserPlus, Gift, Layers, Bot } from 'lucide-react';

const activityData = [
  { name: 'Aug 14', messages: 0 },
  { name: 'Aug 15', messages: 1 },
  { name: 'Aug 16', messages: 0 },
  { name: 'Aug 17', messages: 4 },
  { name: 'Aug 18', messages: 0 },
  { name: 'Aug 19', messages: 0 },
];

const barData = [
  { name: '08/18 20h', messages: 0 },
  { name: '08/19 04h', messages: 1 },
  { name: '08/19 12h', messages: 0 },
  { name: '08/19 20h', messages: 3 },
  { name: '08/20 04h', messages: 0 },
  { name: '08/20 12h', messages: 0 },
];

export default function Overview({ guildId }) {
  const { user } = useAuth();
  const [guildInfo, setGuildInfo] = useState(null);

  useEffect(() => {
    if (!guildId) return;
    fetch('/api/guilds')
      .then(res => res.json())
      .then(data => {
        const guildsArray = Array.isArray(data) ? data : (data.guilds || []);
        const g = guildsArray.find(g => g.id === guildId);
        if (g) setGuildInfo(g);
      })
      .catch(console.error);
  }, [guildId]);

  return (
    <div className="pb-overview-container">
      {/* Server Header Card */}
      <div className="pb-card pb-server-header relative overflow-hidden">
        <div className="pb-header-glow-1"></div>
        <div className="pb-header-glow-2"></div>
        <div className="pb-header-content relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="pb-server-icon ring-2 ring-neutral-800">
              {guildInfo?.icon ? (
                <img src={`https://cdn.discordapp.com/icons/${guildId}/${guildInfo.icon}.png`} alt="Server Icon" />
              ) : (
                <div className="pb-server-icon-placeholder">{guildInfo?.name?.charAt(0) || '?'}</div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white truncate">{guildInfo?.name || 'Loading...'}</h1>
              <p className="text-xs text-neutral-500 mt-1 tabular-nums">3 members</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"></div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="hidden sm:inline">Just now</span>
              <button className="pb-refresh-btn" aria-label="Refresh">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="pb-card overflow-hidden">
        <div className="pb-stats-grid">
          <div className="pb-stat-box group">
            <div className="flex items-center gap-2 mb-2">
              <div className="pb-icon-box bg-blue-500/10 text-blue-400"><Users size={14} /></div>
              <span className="text-xs font-medium text-neutral-400">Members</span>
            </div>
            <p className="text-3xl font-bold tabular-nums leading-none text-white">3</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="pb-badge-green"><ArrowUpRight size={12} />+0%</span>
              <span className="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>
          <div className="pb-stat-box group">
            <div className="flex items-center gap-2 mb-2">
              <div className="pb-icon-box bg-green-500/10 text-green-400"><MessageSquare size={14} /></div>
              <span className="text-xs font-medium text-neutral-400">Messages</span>
            </div>
            <p className="text-3xl font-bold tabular-nums leading-none text-white">0</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="pb-badge-green"><ArrowUpRight size={12} />+0%</span>
              <span className="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>
          <div className="pb-stat-box group">
            <div className="flex items-center gap-2 mb-2">
              <div className="pb-icon-box bg-cyan-500/10 text-cyan-400"><Activity size={14} /></div>
              <span className="text-xs font-medium text-neutral-400">Active Users</span>
            </div>
            <p className="text-3xl font-bold tabular-nums leading-none text-white">0</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="pb-badge-green"><ArrowUpRight size={12} />+0%</span>
              <span className="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>
          <div className="pb-stat-box group">
            <div className="flex items-center gap-2 mb-2">
              <div className="pb-icon-box bg-purple-500/10 text-purple-400"><Mic size={14} /></div>
              <span className="text-xs font-medium text-neutral-400">Voice Hours</span>
            </div>
            <p className="text-3xl font-bold tabular-nums leading-none text-white">0</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="pb-badge-green"><ArrowUpRight size={12} />+0%</span>
              <span className="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>
          <div className="pb-stat-box group pb-col-span-mobile-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="pb-icon-box bg-neutral-800 text-neutral-400"><Ticket size={14} /></div>
              <span className="text-xs font-medium text-neutral-400">Open Tickets</span>
            </div>
            <p className="text-3xl font-bold tabular-nums leading-none text-white">0</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] text-neutral-500">all clear</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Charts */}
      <div className="pb-grid-2">
        <div className="pb-card flex flex-col">
          <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] text-neutral-400 font-medium">Messages · Last 48 hours</p>
              <p className="text-3xl font-bold text-white tabular-nums mt-1">0</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Live</span>
              </div>
              <div className="pb-toggle-group">
                <button className="active">48h</button>
                <button>60m</button>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 mt-4" style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <Bar dataKey="messages" fill="#22c55e" radius={[2, 2, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="pb-card flex flex-col">
          <div className="px-4 pt-4 pb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div>
              <p className="text-sm text-white font-semibold">Top message channels</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Last 7 days</p>
            </div>
            <div className="pb-toggle-group flex-shrink-0">
              <button>1D</button>
              <button className="active">1W</button>
              <button>1M</button>
              <button>1Y</button>
              <button>All</button>
            </div>
          </div>
          <div className="flex-1 px-2 pb-3">
            <div className="h-[180px] flex flex-col items-center justify-center text-center">
              <p className="text-sm text-neutral-500">No channel activity yet</p>
              <p className="text-xs text-neutral-600 mt-1">Stats build up as messages come in.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Activity Chart */}
      <div className="pb-card">
        <div className="px-5 pt-4 pb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-green-400" />
            <span className="text-sm font-medium text-white">Activity</span>
            <span className="text-[11px] text-neutral-500">last 7 days</span>
          </div>
          <div className="pb-toggle-group flex-shrink-0">
            <button>1D</button>
            <button className="active">1W</button>
            <button>1M</button>
            <button>1Y</button>
            <button>All</button>
          </div>
        </div>
        <div className="px-5 pb-3">
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-white tabular-nums leading-none">0</span>
            <span className="text-[11px] text-neutral-500 mt-1">Messages</span>
          </div>
        </div>
        <div className="px-5 pb-4" style={{ height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
              <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <Area type="monotone" dataKey="messages" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorMessages)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Features & Mod Activity */}
      <div className="pb-grid-bottom">
        <div className="pb-card flex flex-col pb-col-features">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <Settings size={16} className="text-neutral-500" />
              <span className="text-sm font-semibold text-white">Features</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold tabular-nums bg-amber-500/10 text-amber-400">0/15</span>
            </div>
          </div>
          <div className="flex flex-col flex-1 divide-y divide-neutral-800/60 pb-features-list">
            <div className="pb-feature-item">
              <div className="pb-feature-icon"><MessageSquare size={14} /></div>
              <span className="flex-1 truncate text-[13px] font-medium text-white">Welcome</span>
              <span className="pb-feature-inactive" title="Inactive"></span>
            </div>
            <div className="pb-feature-item">
              <div className="pb-feature-icon"><Vote size={14} /></div>
              <span className="flex-1 truncate text-[13px] font-medium text-white">Polls</span>
              <span className="pb-feature-inactive" title="Inactive"></span>
            </div>
            <div className="pb-feature-item">
              <div className="pb-feature-icon"><Ticket size={14} /></div>
              <span className="flex-1 truncate text-[13px] font-medium text-white">Ticketsystem</span>
              <span className="pb-feature-inactive" title="Inactive"></span>
            </div>
            <div className="pb-feature-item">
              <div className="pb-feature-icon"><ShieldAlert size={14} /></div>
              <span className="flex-1 truncate text-[13px] font-medium text-white">Auto-Mod</span>
              <span className="pb-feature-inactive" title="Inactive"></span>
            </div>
            <div className="pb-feature-item">
              <div className="pb-feature-icon"><Mic size={14} /></div>
              <span className="flex-1 truncate text-[13px] font-medium text-white">Voice Channels</span>
              <span className="pb-feature-inactive" title="Inactive"></span>
            </div>
            <div className="pb-feature-item">
              <div className="pb-feature-icon"><UserPlus size={14} /></div>
              <span className="flex-1 truncate text-[13px] font-medium text-white">Invites</span>
              <span className="pb-feature-inactive" title="Inactive"></span>
            </div>
            <div className="pb-feature-item">
              <div className="pb-feature-icon"><ShieldCheck size={14} /></div>
              <span className="flex-1 truncate text-[13px] font-medium text-white">Verification</span>
              <span className="pb-feature-inactive" title="Inactive"></span>
            </div>
            <div className="pb-feature-item">
              <div className="pb-feature-icon"><Gift size={14} /></div>
              <span className="flex-1 truncate text-[13px] font-medium text-white">Giveaways</span>
              <span className="pb-feature-inactive" title="Inactive"></span>
            </div>
            <div className="pb-feature-item">
              <div className="pb-feature-icon"><UserMinus size={14} /></div>
              <span className="flex-1 truncate text-[13px] font-medium text-white">Inactive Kick</span>
              <span className="pb-feature-inactive" title="Inactive"></span>
            </div>
            <div className="pb-feature-item">
              <div className="pb-feature-icon"><Layers size={14} /></div>
              <span className="flex-1 truncate text-[13px] font-medium text-white">Embeds</span>
              <span className="pb-feature-inactive" title="Inactive"></span>
            </div>
            <div className="pb-feature-item">
              <div className="pb-feature-icon"><Bot size={14} /></div>
              <span className="flex-1 truncate text-[13px] font-medium text-white">Bot Profile</span>
              <span className="pb-feature-inactive" title="Inactive"></span>
            </div>
          </div>
        </div>
        
        <div className="pb-card flex flex-col pb-col-mod">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={16} className="text-neutral-500" />
              <span className="text-sm font-semibold text-white">Recent Mod Activity</span>
            </div>
            <button className="pb-view-all group">
              View all <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-800/80 flex items-center justify-center">
              <ShieldCheck size={24} className="text-neutral-600" />
            </div>
            <p className="text-sm text-neutral-400 font-medium">All quiet</p>
            <p className="text-[11px] text-neutral-600 text-center max-w-[240px]">No moderation actions yet. Actions will appear here as your mods take them.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
