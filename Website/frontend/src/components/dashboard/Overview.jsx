import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, Activity, Mic, Ticket, Settings, ArrowUpRight, ArrowRight, ShieldAlert, ShieldCheck, UserMinus, Vote, UserPlus, Gift, Layers, Bot } from 'lucide-react';

export default function Overview({ guildId }) {
  const { user } = useAuth();
  const [guildInfo, setGuildInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState(null);

  const [messagesRange, setMessagesRange] = useState('48h');
  const [channelsRange, setChannelsRange] = useState('7');
  const [activityRange, setActivityRange] = useState('7');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = () => {
    if (!guildId) return;
    
    fetch('/api/guilds')
      .then(res => res.json())
      .then(data => {
        const guildsArray = Array.isArray(data) ? data : (data.guilds || []);
        const g = guildsArray.find(g => String(g.id) === String(guildId));
        if (g) setGuildInfo(g);
      })
      .catch(console.error);
      
    fetch(`/api/guild_stats/${guildId}?days=365`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
      
    fetch(`/api/config/${guildId}`)
      .then(res => res.json())
      .then(data => setConfig(data?.config || null))
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [guildId]);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Process History Data for Charts
  const historyRaw = stats?.history || [];
  const getFilteredHistory = (range) => {
    if (range === 'all') return historyRaw;
    let days = 7;
    if (range === '60m' || range === '48h' || range === '1') days = 2;
    else if (range === '7') days = 7;
    else if (range === '30') days = 30;
    else if (range === '365') days = 365;
    return historyRaw.slice(-days);
  };

  const activityHistory = getFilteredHistory(activityRange);
  const activityData = activityHistory.map(day => {
    const d = new Date(day.date);
    return {
      name: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`,
      messages: day.messages || 0
    };
  });
  
  const messagesHistory = getFilteredHistory(messagesRange);
  const messagesChartData = messagesHistory.map(day => {
    const d = new Date(day.date);
    return {
      name: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`,
      messages: day.messages || 0
    };
  });
  
  const totalMessages = stats?.today_messages || 0;
  const totalMembers = stats?.total_members || guildInfo?.member_count || 0;
  const activeUsers = stats?.today_active_users || 0;
  const voiceHours = stats?.today_voice_minutes ? (stats.today_voice_minutes / 60).toFixed(1) : 0;
  const openTickets = stats?.open_tickets || 0;

  // Features Checks
  const isFeatureActive = (key) => {
    if (!config) return false;
    switch(key) {
      case 'welcome': return config.welcome?.enabled;
      case 'polls': return false; // Or find if polls exist
      case 'tickets': return config.ticket?.enabled;
      case 'automod': return config.automod?.enabled;
      case 'voice': return config.tempvoice?.enabled;
      case 'invites': return false; 
      case 'verification': return config.verify?.enabled;
      case 'giveaways': return false;
      case 'kick': return config.automod?.anti_alt?.enabled || false;
      case 'embeds': return config.messages_enabled;
      case 'botprofile': return false;
      default: return false;
    }
  };

  const activeFeaturesCount = [
    'welcome', 'polls', 'tickets', 'automod', 'voice', 'invites', 
    'verification', 'giveaways', 'kick', 'embeds', 'botprofile'
  ].filter(isFeatureActive).length;

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
              <p className="text-xs text-neutral-500 mt-1 tabular-nums">{totalMembers} members</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"></div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="hidden sm:inline">Updated {isRefreshing ? 'now' : 'live'}</span>
              <button className={`pb-refresh-btn ${isRefreshing ? 'animate-spin' : ''}`} aria-label="Refresh" onClick={handleRefreshClick}>
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
            <p className="text-3xl font-bold tabular-nums leading-none text-white">{totalMembers}</p>
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
            <p className="text-3xl font-bold tabular-nums leading-none text-white">{totalMessages}</p>
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
            <p className="text-3xl font-bold tabular-nums leading-none text-white">{activeUsers}</p>
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
            <p className="text-3xl font-bold tabular-nums leading-none text-white">{voiceHours}</p>
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
            <p className="text-3xl font-bold tabular-nums leading-none text-white">{openTickets}</p>
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
              <p className="text-[13px] text-neutral-400 font-medium">
                Messages · {messagesRange === '60m' ? 'Last 60 Minutes' : messagesRange === '48h' ? 'Last 48 Hours' : `Last ${messagesRange} Days`}
              </p>
              <p className="text-3xl font-bold text-white tabular-nums mt-1">{totalMessages}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Live</span>
              </div>
              <div className="pb-toggle-group">
                <button className={messagesRange === '48h' ? 'active' : ''} onClick={() => setMessagesRange('48h')}>48h</button>
                <button className={messagesRange === '60m' ? 'active' : ''} onClick={() => setMessagesRange('60m')}>60m</button>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 mt-4" style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={messagesChartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: '#262626'}} contentStyle={{backgroundColor: '#171717', borderColor: '#262626', color: '#fff'}} />
                <Bar dataKey="messages" fill="#22c55e" radius={[2, 2, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="pb-card flex flex-col">
          <div className="px-4 pt-4 pb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div>
              <p className="text-sm text-white font-semibold">Top message channels</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {channelsRange === 'all' ? 'All time' : channelsRange === '1' ? 'Last 24 Hours' : `Last ${channelsRange} Days`}
              </p>
            </div>
            <div className="pb-toggle-group flex-shrink-0">
              <button className={channelsRange === '1' ? 'active' : ''} onClick={() => setChannelsRange('1')}>1D</button>
              <button className={channelsRange === '7' ? 'active' : ''} onClick={() => setChannelsRange('7')}>1W</button>
              <button className={channelsRange === '30' ? 'active' : ''} onClick={() => setChannelsRange('30')}>1M</button>
              <button className={channelsRange === '365' ? 'active' : ''} onClick={() => setChannelsRange('365')}>1Y</button>
              <button className={channelsRange === 'all' ? 'active' : ''} onClick={() => setChannelsRange('all')}>All</button>
            </div>
          </div>
          <div className="flex-1 px-4 pb-4 overflow-hidden">
            <table className="w-full text-left text-sm text-neutral-400 mt-2">
              <thead>
                <tr className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase border-b border-neutral-800">
                  <th className="pb-2 font-semibold">Channel</th>
                  <th className="pb-2 font-semibold text-center">Messages</th>
                  <th className="pb-2 font-semibold text-center">% of Activity</th>
                  <th className="pb-2 font-semibold text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                <tr>
                  <td className="py-3">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                      <span className="opacity-70">#</span> chat
                    </div>
                  </td>
                  <td className="py-3 text-center text-white font-bold text-[15px]">{totalMessages > 0 ? totalMessages : 8}</td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-neutral-700"></div>
                      <span className="text-white font-semibold">100%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-green-400 font-semibold">+{totalMessages > 0 ? totalMessages : 8}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Activity Chart */}
      <div className="pb-card">
        <div className="px-5 pt-4 pb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-green-400" />
            <span className="text-sm font-medium text-white">Activity</span>
            <span className="text-[11px] text-neutral-500">
              {activityRange === 'all' ? 'all time' : activityRange === '1' ? 'last 24 hours' : `last ${activityRange} days`}
            </span>
          </div>
          <div className="pb-toggle-group flex-shrink-0">
            <button className={activityRange === '1' ? 'active' : ''} onClick={() => setActivityRange('1')}>1D</button>
            <button className={activityRange === '7' ? 'active' : ''} onClick={() => setActivityRange('7')}>1W</button>
            <button className={activityRange === '30' ? 'active' : ''} onClick={() => setActivityRange('30')}>1M</button>
            <button className={activityRange === '365' ? 'active' : ''} onClick={() => setActivityRange('365')}>1Y</button>
            <button className={activityRange === 'all' ? 'active' : ''} onClick={() => setActivityRange('all')}>All</button>
          </div>
        </div>
        <div className="px-5 pb-3">
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-white tabular-nums leading-none">{totalMessages}</span>
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
              <RechartsTooltip contentStyle={{backgroundColor: '#171717', borderColor: '#262626', color: '#fff'}} />
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
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold tabular-nums bg-amber-500/10 text-amber-400">{activeFeaturesCount}/11</span>
            </div>
          </div>
          <div className="flex flex-col flex-1 divide-y divide-neutral-800/60 pb-features-list">
            <FeatureItem icon={<MessageSquare size={14} />} name="Welcome" active={isFeatureActive('welcome')} />
            <FeatureItem icon={<Vote size={14} />} name="Polls" active={isFeatureActive('polls')} />
            <FeatureItem icon={<Ticket size={14} />} name="Ticketsystem" active={isFeatureActive('tickets')} />
            <FeatureItem icon={<ShieldAlert size={14} />} name="Auto-Mod" active={isFeatureActive('automod')} />
            <FeatureItem icon={<Mic size={14} />} name="Voice Channels" active={isFeatureActive('voice')} />
            <FeatureItem icon={<UserPlus size={14} />} name="Invites" active={isFeatureActive('invites')} />
            <FeatureItem icon={<ShieldCheck size={14} />} name="Verification" active={isFeatureActive('verification')} />
            <FeatureItem icon={<Gift size={14} />} name="Giveaways" active={isFeatureActive('giveaways')} />
            <FeatureItem icon={<UserMinus size={14} />} name="Inactive Kick" active={isFeatureActive('kick')} />
            <FeatureItem icon={<Layers size={14} />} name="Embeds" active={isFeatureActive('embeds')} />
            <FeatureItem icon={<Bot size={14} />} name="Bot Profile" active={isFeatureActive('botprofile')} />
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

function FeatureItem({ icon, name, active }) {
  return (
    <div className="pb-feature-item">
      <div className="pb-feature-icon">{icon}</div>
      <span className="flex-1 truncate text-[13px] font-medium text-white">{name}</span>
      {active ? (
        <span className="pb-feature-active" title="Active" style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.5)'}}></span>
      ) : (
        <span className="pb-feature-inactive" title="Inactive"></span>
      )}
    </div>
  );
}
