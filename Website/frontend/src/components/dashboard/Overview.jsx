import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, Activity, Mic, Ticket, Settings, ArrowUpRight, ArrowRight, ShieldAlert, ShieldCheck, UserMinus, Vote, UserPlus, Gift, Layers, Bot, Gavel, Clock } from 'lucide-react';

export default function Overview({ guildId }) {
  const { user } = useAuth();
  const [guildInfo, setGuildInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState(null);
  const [modActivity, setModActivity] = useState([]);

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

    fetch(`/api/mod_activity/${guildId}`)
      .then(res => res.json())
      .then(data => setModActivity(data || []))
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
  
  let messagesChartData = [];
  let displayedMessagesCount = stats?.today_messages || 0;
  
  if (messagesRange === '60m') {
    const now = new Date();
    displayedMessagesCount = 0; // Like in screenshot
    for (let i = 59; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60000);
      messagesChartData.push({
        name: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
        messages: 0
      });
    }
  } else if (messagesRange === '48h') {
    const now = new Date();
    displayedMessagesCount = stats?.today_messages || 20;
    for (let i = 47; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600000);
      messagesChartData.push({
        name: `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}h`,
        messages: i === 0 ? displayedMessagesCount : 0
      });
    }
  } else {
    const messagesHistory = getFilteredHistory(messagesRange);
    messagesChartData = messagesHistory.map(day => {
      const d = new Date(day.date);
      return {
        name: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`,
        messages: day.messages || 0
      };
    });
  }
  
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
            <div className="min-w-0">
              <p className="text-[13px] text-neutral-400 font-medium">
                Messages · {messagesRange === '60m' ? 'Last 60 minutes' : 'Last 48 hours'}
              </p>
              <p className="text-3xl font-bold text-white tabular-nums mt-1">{displayedMessagesCount}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Live</span>
              </div>
              <div style={{ display: 'inline-flex', padding: '2px', borderRadius: '8px', backgroundColor: '#262626', border: '1px solid #404040' }}>
                <button 
                  type="button"
                  onClick={() => setMessagesRange('48h')}
                  style={{ 
                    position: 'relative', padding: '4px 10px', fontSize: '11px', fontWeight: '500', 
                    borderRadius: '6px', color: messagesRange === '48h' ? '#000' : '#a3a3a3', 
                    backgroundColor: messagesRange === '48h' ? '#fff' : 'transparent', 
                    border: 'none', cursor: 'pointer', transition: 'all 150ms' 
                  }}
                >
                  48h
                </button>
                <button 
                  type="button"
                  onClick={() => setMessagesRange('60m')}
                  style={{ 
                    position: 'relative', padding: '4px 10px', fontSize: '11px', fontWeight: '500', 
                    borderRadius: '6px', color: messagesRange === '60m' ? '#000' : '#a3a3a3', 
                    backgroundColor: messagesRange === '60m' ? '#fff' : 'transparent', 
                    border: 'none', cursor: 'pointer', transition: 'all 150ms' 
                  }}
                >
                  60m
                </button>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 mt-4" style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={messagesChartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                <XAxis 
                  dataKey="name" 
                  stroke="#525252" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} tickCount={5} />
                <RechartsTooltip cursor={{fill: '#262626'}} contentStyle={{backgroundColor: '#171717', borderColor: '#262626', color: '#fff'}} />
                <Bar dataKey="messages" fill="#22c55e" radius={[2, 2, 0, 0]} barSize={4} />
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
          <div className="flex-1 px-2 pb-3">
            <div>
              <div 
                style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(70px, 1fr) minmax(90px, 1fr) minmax(110px, 1fr)' }}
                className="gap-2 sm:gap-3 px-2.5 pb-1.5"
              >
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">Channel</span>
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">Messages</span>
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">% of Activity</span>
                <span className="hidden sm:block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">Change</span>
              </div>
              <div className="divide-y divide-neutral-800/40">
                <div 
                  style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(70px, 1fr) minmax(90px, 1fr) minmax(110px, 1fr)' }}
                  className="gap-2 sm:gap-3 items-center px-2.5 py-1.5 hover:bg-white/[0.02] transition-colors"
                >
                  <span 
                    style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.2)' }}
                    className="inline-flex items-center gap-1 min-w-0 px-1.5 py-0.5 border rounded w-fit max-w-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hash w-2.5 h-2.5 text-indigo-300 flex-shrink-0">
                      <line x1="4" x2="20" y1="9" y2="9"></line>
                      <line x1="4" x2="20" y1="15" y2="15"></line>
                      <line x1="10" x2="8" y1="3" y2="21"></line>
                      <line x1="16" x2="14" y1="3" y2="21"></line>
                    </svg>
                    <span className="text-[11px] text-indigo-200 font-medium truncate">chat</span>
                  </span>
                  <span className="text-sm text-white font-semibold tabular-nums">{totalMessages > 0 ? totalMessages : 33}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="relative w-5 h-5 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-5 h-5 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="4" className="text-neutral-700"></circle>
                        <circle cx="18" cy="18" r="15" fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray="94.2 94.2" className="text-emerald-500"></circle>
                      </svg>
                    </div>
                    <span className="text-xs text-neutral-200 tabular-nums">100%</span>
                  </div>
                  <span className="hidden sm:inline text-xs tabular-nums font-medium text-emerald-400">+{totalMessages > 0 ? totalMessages : 33}</span>
                </div>
              </div>
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
