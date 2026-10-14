import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Medal, 
  MessageSquare, 
  Mic, 
  Smile, 
  UserPlus, 
  Search, 
  X, 
  ArrowLeft,
  Sparkles,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'total_xp', label: 'Level & XP', icon: Trophy, unit: 'XP' },
  { id: 'message_count', label: 'Messages', icon: MessageSquare, unit: 'Msgs' },
  { id: 'voice_minutes', label: 'Voice Time', icon: Mic, unit: 'Hours' },
  { id: 'reaction_count', label: 'Reactions', icon: Smile, unit: 'Reactions' },
  { id: 'invites', label: 'Invites', icon: UserPlus, unit: 'Invites' },
];

export default function Leaderboard() {
  const { guildId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentSort = searchParams.get('sort') || 'total_xp';
  const activeCategory = CATEGORIES.find(c => c.id === currentSort) || CATEGORIES[0];

  const fetchLeaderboard = (sortType) => {
    setLoading(true);
    fetch(`/api/public_leaderboard/${guildId}?sort=${sortType}`)
      .then(res => res.json())
      .then(d => {
        if (d.error) {
          setError(d.error);
        } else {
          setData(d);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to fetch leaderboard data.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaderboard(currentSort);
  }, [guildId, currentSort]);

  const handleCategoryChange = (categoryId) => {
    setSearchParams({ sort: categoryId });
    setSearchQuery('');
  };

  const filteredEntries = useMemo(() => {
    if (!data?.entries) return [];
    if (!searchQuery.trim()) return data.entries;
    const q = searchQuery.toLowerCase().trim();
    return data.entries.filter(entry => 
      entry.name?.toLowerCase().includes(q) ||
      String(entry.rank) === q ||
      String(entry.rank) === `#${q}`
    );
  }, [data?.entries, searchQuery]);

  const top3 = useMemo(() => {
    if (!data?.entries || data.entries.length === 0) return [];
    return data.entries.slice(0, 3);
  }, [data?.entries]);

  const formatScore = (val, catId) => {
    if (typeof val !== 'number') return '0';
    if (catId === 'voice_minutes') {
      return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return val.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-neutral-800 selection:text-white font-sans flex flex-col justify-between">
      
      {/* Top Brand & Navigation Bar */}
      <header className="border-b border-neutral-800/80 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-neutral-400 hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-neutral-700 transition-colors shadow-sm">
                <img
                  src="/img/logo.png"
                  alt="Orbit"
                  className="w-5 h-5 rounded-md"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <span className="text-sm font-semibold tracking-tight text-white hidden sm:inline">Orbit</span>
            </button>
            <span className="text-neutral-700 hidden sm:inline">/</span>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-medium text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Leaderboard
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-medium text-white transition-all active:scale-[0.98]"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">

        {/* Server Hero Banner Card */}
        <div className="relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_40px_-20px_rgba(0,0,0,0.9)]">
          {/* Subtle Ambient Background Accent */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            {/* Server Avatar / Icon */}
            <div className="relative">
              {data?.guild_icon ? (
                <img 
                  src={data.guild_icon} 
                  alt={data.guild_name || 'Guild'} 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-neutral-700/60 shadow-lg bg-neutral-800"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-2 border-neutral-700/60 bg-neutral-800 flex items-center justify-center text-neutral-400 shadow-lg">
                  <Trophy className="w-9 h-9 text-amber-400/80" />
                </div>
              )}
            </div>

            {/* Server Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white truncate">
                  {data?.guild_name || 'Server'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-[11px] font-semibold text-neutral-300">
                  Top 100
                </span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
                Official community leaderboard ranking top active members across levels, messages, voice channels, and server invites.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation & Search Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 overflow-x-auto shadow-sm no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory.id === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap active:scale-[0.98] ${
                    isActive 
                      ? 'bg-neutral-800 border border-neutral-700 text-white shadow-sm' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member or rank..."
              className="w-full h-10 pl-9 pr-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 focus:border-neutral-600 focus:outline-none text-sm text-white placeholder-neutral-500 transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1 rounded-md transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Podium Section (Top 3 Showcase) - Shown only when not actively searching */}
        {!loading && !error && !searchQuery.trim() && top3.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4 pb-2">
            
            {/* #2 Silver (Left) */}
            <div className="order-2 md:order-1 rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 flex flex-col items-center text-center relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-neutral-700 transition-all">
              <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-600/60 text-slate-200 text-xs font-bold flex items-center gap-1 shadow-md">
                <Medal className="w-3.5 h-3.5 text-slate-300" /> #2 Silver
              </div>
              <div className="relative my-3">
                <img
                  src={top3[1]?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt={top3[1]?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-400/50 shadow-md bg-neutral-800"
                  onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                />
              </div>
              <h3 className="text-sm font-semibold text-white truncate max-w-[180px]">{top3[1]?.name}</h3>
              {activeCategory.id === 'total_xp' && (
                <span className="mt-1 text-xs px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700/60 text-neutral-300">
                  Level {top3[1]?.level}
                </span>
              )}
              <div className="mt-3 text-lg font-bold text-white tracking-tight">
                {formatScore(top3[1]?.value, activeCategory.id)}
                <span className="text-xs font-normal text-neutral-400 ml-1">{activeCategory.unit}</span>
              </div>
            </div>

            {/* #1 Gold (Center, Elevated) */}
            <div className="order-1 md:order-2 rounded-2xl bg-neutral-900 border border-amber-500/30 p-6 flex flex-col items-center text-center relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_40px_-20px_rgba(251,191,36,0.15)] hover:border-amber-500/50 transition-all md:-translate-y-2">
              <div className="absolute -top-4 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <Crown className="w-4 h-4 text-amber-400" /> #1 Champion
              </div>
              <div className="relative my-3">
                <img
                  src={top3[0]?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt={top3[0]?.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-xl bg-neutral-800 ring-4 ring-amber-400/10"
                  onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                />
              </div>
              <h3 className="text-base font-bold text-white truncate max-w-[200px]">{top3[0]?.name}</h3>
              {activeCategory.id === 'total_xp' && (
                <span className="mt-1 text-xs px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-300 font-semibold">
                  Level {top3[0]?.level}
                </span>
              )}
              <div className="mt-3 text-2xl font-black text-amber-300 tracking-tight">
                {formatScore(top3[0]?.value, activeCategory.id)}
                <span className="text-xs font-semibold text-amber-400/70 ml-1.5">{activeCategory.unit}</span>
              </div>
            </div>

            {/* #3 Bronze (Right) */}
            <div className="order-3 md:order-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 flex flex-col items-center text-center relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-neutral-700 transition-all">
              <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-500 text-xs font-bold flex items-center gap-1 shadow-md">
                <Medal className="w-3.5 h-3.5 text-amber-600" /> #3 Bronze
              </div>
              <div className="relative my-3">
                <img
                  src={top3[2]?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt={top3[2]?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-700/50 shadow-md bg-neutral-800"
                  onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                />
              </div>
              <h3 className="text-sm font-semibold text-white truncate max-w-[180px]">{top3[2]?.name}</h3>
              {activeCategory.id === 'total_xp' && (
                <span className="mt-1 text-xs px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700/60 text-neutral-300">
                  Level {top3[2]?.level}
                </span>
              )}
              <div className="mt-3 text-lg font-bold text-white tracking-tight">
                {formatScore(top3[2]?.value, activeCategory.id)}
                <span className="text-xs font-normal text-neutral-400 ml-1">{activeCategory.unit}</span>
              </div>
            </div>

          </div>
        )}

        {/* Main Leaderboard Table / Card */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_40px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
          
          {/* Loading State */}
          {loading && (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 border-2 border-neutral-800 border-t-white rounded-full animate-spin" />
              <p className="text-sm text-neutral-400">Loading leaderboard rankings...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 mx-auto mb-3">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Could Not Load Leaderboard</h3>
              <p className="text-sm text-neutral-400 mb-5">{error}</p>
              <button
                type="button"
                onClick={() => fetchLeaderboard(currentSort)}
                className="h-9 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-medium text-xs transition-all active:scale-[0.98]"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredEntries.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 mx-auto mb-3">
                <Trophy className="w-6 h-6 text-neutral-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {searchQuery ? 'No members found' : 'No data recorded yet'}
              </h3>
              <p className="text-sm text-neutral-400 mb-4">
                {searchQuery 
                  ? `No active members found matching "${searchQuery}".` 
                  : 'Start chatting, joining voice channels, or earning XP to rank up on the leaderboard!'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="h-8 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-medium text-white transition-all active:scale-[0.98]"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Leaderboard Table List */}
          {!loading && !error && filteredEntries.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-950/40">
                    <th className="py-3 px-4 sm:px-6 w-20 text-center">Rank</th>
                    <th className="py-3 px-4 sm:px-6">Member</th>
                    {activeCategory.id === 'total_xp' && (
                      <th className="py-3 px-4 sm:px-6 hidden sm:table-cell w-28 text-center">Level</th>
                    )}
                    <th className="py-3 px-4 sm:px-6 text-right">
                      {activeCategory.label}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-sm">
                  {filteredEntries.map((entry, idx) => {
                    const isFirst = entry.rank === 1;
                    const isSecond = entry.rank === 2;
                    const isThird = entry.rank === 3;

                    return (
                      <tr 
                        key={`${entry.rank}_${entry.name}_${idx}`}
                        className="hover:bg-neutral-800/30 transition-colors group"
                      >
                        {/* Rank Column */}
                        <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                          {isFirst ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold text-xs">
                              🥇
                            </span>
                          ) : isSecond ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-400/10 border border-slate-400/30 text-slate-300 font-bold text-xs">
                              🥈
                            </span>
                          ) : isThird ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-700/10 border border-amber-700/30 text-amber-600 font-bold text-xs">
                              🥉
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded-md bg-neutral-800/80 border border-neutral-700/40 text-neutral-400 font-semibold text-xs">
                              #{entry.rank}
                            </span>
                          )}
                        </td>

                        {/* Member Info Column */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <img
                                src={entry.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                alt={entry.name}
                                className={`w-9 h-9 rounded-full object-cover bg-neutral-800 border ${
                                  isFirst 
                                    ? 'border-amber-400 ring-2 ring-amber-400/20' 
                                    : isSecond 
                                    ? 'border-slate-300' 
                                    : isThird 
                                    ? 'border-amber-700' 
                                    : 'border-neutral-700/60'
                                }`}
                                onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md group-hover:text-amber-300/90 transition-colors">
                                {entry.name}
                              </div>
                              {/* Mobile level indicator */}
                              {activeCategory.id === 'total_xp' && (
                                <div className="sm:hidden text-[11px] text-neutral-400 mt-0.5">
                                  Level {entry.level}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Level Column (Desktop) */}
                        {activeCategory.id === 'total_xp' && (
                          <td className="py-3.5 px-4 sm:px-6 hidden sm:table-cell text-center whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                              isFirst
                                ? 'bg-amber-400/10 border border-amber-400/30 text-amber-300'
                                : 'bg-neutral-800 border border-neutral-700/60 text-neutral-300'
                            }`}>
                              Lvl {entry.level}
                            </span>
                          </td>
                        )}

                        {/* Score Column */}
                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                          <div className={`font-bold tracking-tight text-sm sm:text-base ${
                            isFirst ? 'text-amber-300' : 'text-white'
                          }`}>
                            {formatScore(entry.value, activeCategory.id)}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-medium">
                            {activeCategory.unit}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span>Powered by <strong className="text-neutral-400">Orbit</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="hover:text-neutral-300 transition-colors"
          >
            Home
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')} 
            className="hover:text-neutral-300 transition-colors"
          >
            Dashboard
          </button>
          <a 
            href="https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=564430072179839&scope=bot+applications.commands" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-neutral-300 transition-colors"
          >
            Add Orbit
          </a>
        </div>
      </footer>

    </div>
  );
}
