import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Activity, MessageSquare, Users, Mic, TrendingUp, Calendar, Hash, ArrowUpRight } from 'lucide-react';
import LoadingScreen from '../../ui/LoadingScreen';
import { getCache, setCache } from '../../../utils/cache';

export default function Analytics({ serverData }) {
  const { guildId } = useParams();
  const [timeRange, setTimeRange] = useState('7');
  const cacheKey = `analytics_stats_${guildId}_${timeRange}`;
  const [stats, setStats] = useState(() => getCache(cacheKey) || null);
  const [loading, setLoading] = useState(() => !getCache(cacheKey));

  useEffect(() => {
    if (!guildId) return;
    const cached = getCache(cacheKey);
    if (!cached) setLoading(true);

    fetch(`/api/guild_stats/${guildId}?days=${timeRange === 'all' ? 365 : timeRange}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setCache(cacheKey, data);
      })
      .catch(err => console.error("Failed to load analytics stats:", err))
      .finally(() => setLoading(false));
  }, [guildId, timeRange]);

  const historyRaw = stats?.history || [];
  const chartData = historyRaw.map(day => {
    const d = new Date(day.date);
    return {
      name: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`,
      messages: day.messages || 0,
      joins: day.joins || 0,
      leaves: day.leaves || 0
    };
  });

  const totalMessages = stats?.today_messages || stats?.total_messages || 0;
  const totalMembers = serverData?.approximate_member_count || stats?.member_count || 0;
  const channelCount = serverData?.channels?.length || 0;
  const roleCount = serverData?.roles?.length || 0;

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5 w-full">
      {/* Header */}
      <div data-tour="feature-header" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <Activity className="w-5 h-5 text-neutral-400" />
            </span>
            <div>
              <h1 className="text-base font-medium text-white truncate">Analytics & Insights</h1>
              <p className="text-xs text-neutral-400 mt-0.5">Real-time statistics on member engagement, message volume, and trends.</p>
            </div>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
            {[
              { id: '1', label: '24h' },
              { id: '7', label: '7 Days' },
              { id: '30', label: '30 Days' },
              { id: 'all', label: 'All Time' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  timeRange === tab.id ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Messages</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{totalMessages.toLocaleString()}</div>
            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Active period count
            </p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Members</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{totalMembers.toLocaleString()}</div>
            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
              Server community size
            </p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Text Channels</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Hash className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{channelCount}</div>
            <p className="text-xs text-neutral-500 mt-1">Monitored channels</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Server Roles</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{roleCount}</div>
            <p className="text-xs text-neutral-500 mt-1">Configured roles</p>
          </div>
        </div>
      </div>

      {/* Message Activity Chart Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Message Activity Trends</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Message volume recorded across tracked dates.</p>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-neutral-500 text-sm">Loading activity data...</div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-neutral-500 text-sm">No activity recorded for this timeframe yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsMsgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" fontSize={11} tickLine={false} />
                <YAxis stroke="#525252" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="messages" name="Messages" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#analyticsMsgGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Joins vs Leaves Chart Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Member Growth & Fluctuations</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Daily joined vs left members overview.</p>
        </div>

        <div className="h-[220px] w-full pt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-neutral-500 text-sm">Loading member metrics...</div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-neutral-500 text-sm">No member fluctuation recorded yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" fontSize={11} tickLine={false} />
                <YAxis stroke="#525252" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 600 }}
                />
                <Bar dataKey="joins" name="Joins" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leaves" name="Leaves" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </main>
  );
}
