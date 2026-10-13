import React, { useState, useEffect } from 'react';
import CustomSelect from '../../ui/CustomSelect';
import { getCache, setCache } from '../../../utils/cache';
import { Trophy, Medal } from 'lucide-react';

export default function Leaderboard({ guildId }) {
  const [sortCategory, setSortCategory] = useState('total_xp');
  const cacheKey = `leaderboard_${guildId}_${sortCategory}`;
  const cachedData = getCache(cacheKey);

  const [data, setData] = useState(cachedData || null);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    if (!guildId) return;
    if (!getCache(cacheKey)) setLoading(true);
    fetch(`/api/public_leaderboard/${guildId}?sort=${sortCategory}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setCache(cacheKey, d);
      })
      .catch(err => console.error("Error fetching leaderboard:", err))
      .finally(() => setLoading(false));
  }, [guildId, sortCategory]);

  const sortOptions = [
    { value: 'total_xp', label: 'Total XP' },
    { value: 'message_count', label: 'Messages' },
    { value: 'voice_minutes', label: 'Voice Time (Hours)' },
    { value: 'reaction_count', label: 'Reactions' },
    { value: 'invites', label: 'Invites' }
  ];

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5 w-full">
      {/* Header */}
      <div data-tour="feature-header" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <Trophy className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h1 className="text-base font-medium text-white truncate">Server Leaderboard</h1>
              <p className="text-xs text-neutral-400 mt-0.5">Top active members ranked by XP, messages, voice, and invites.</p>
            </div>
          </div>
          <div className="w-56">
            <CustomSelect 
              options={sortOptions} 
              value={sortCategory} 
              onChange={setSortCategory} 
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-neutral-500 text-sm">Loading Leaderboard...</div>
        ) : data?.error ? (
          <div className="p-12 text-center text-red-400 text-sm">
            Error: {data.error}
          </div>
        ) : !data?.entries || data.entries.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-sm">
            No activity data available for this category yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-xs font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-950/40">
                  <th className="py-3.5 px-5 w-20">Rank</th>
                  <th className="py-3.5 px-5">Member</th>
                  <th className="py-3.5 px-5 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-sm">
                {data.entries.map(entry => (
                  <tr key={entry.rank} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold">
                      {entry.rank === 1 ? (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Medal className="w-4 h-4" /> #1
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <Medal className="w-4 h-4" /> #2
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <Medal className="w-4 h-4" /> #3
                        </span>
                      ) : (
                        <span className="text-neutral-500">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={entry.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                          alt="" 
                          className="w-8 h-8 rounded-full border border-neutral-700 object-cover"
                          onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                        />
                        <div>
                          <div className="font-medium text-white">{entry.name}</div>
                          {sortCategory !== 'invites' && entry.level !== undefined && (
                            <div className="text-[11px] text-neutral-400">Level {entry.level}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold text-white">
                      {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : entry.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
