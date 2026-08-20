import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { 
  Activity, Users, Hash, Shield, AlertTriangle, TrendingUp, Lock, 
  MessageSquare, UserCheck, Mic, Smile 
} from 'lucide-react';

const mockChartData = [
  { name: 'Aug 14', messages: 0 },
  { name: 'Aug 15', messages: 0 },
  { name: 'Aug 16', messages: 0 },
  { name: 'Aug 17', messages: 0 },
  { name: 'Aug 18', messages: 0 },
  { name: 'Aug 19', messages: 0 },
  { name: 'Aug 20', messages: 20 },
];

export default function Analytics() {
  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto">
      <div className="pb-12">
        <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-900 flex items-center gap-4">
          <nav className="flex gap-0.5 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-700 -mb-px flex-1 min-w-0" aria-label="Analytics sections">
            <button className="group relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors whitespace-nowrap text-white">
              <Activity className="w-3.5 h-3.5 transition-colors text-white" />
              Engagement
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-white rounded-t-sm"></span>
            </button>
            <button className="group relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors whitespace-nowrap text-neutral-500 hover:text-neutral-200">
              <Users className="w-3.5 h-3.5 transition-colors text-neutral-500 group-hover:text-neutral-300" />
              People
            </button>
            <button className="group relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors whitespace-nowrap text-neutral-500 hover:text-neutral-200">
              <Hash className="w-3.5 h-3.5 transition-colors text-neutral-500 group-hover:text-neutral-300" />
              Activity
            </button>
            <button className="group relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors whitespace-nowrap text-neutral-500 hover:text-neutral-200">
              <Shield className="w-3.5 h-3.5 transition-colors text-neutral-500 group-hover:text-neutral-300" />
              Moderation
            </button>
            <button className="group relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors whitespace-nowrap text-neutral-500 hover:text-neutral-200">
              <AlertTriangle className="w-3.5 h-3.5 transition-colors text-neutral-500 group-hover:text-neutral-300" />
              Safety
            </button>
            <button className="group relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors whitespace-nowrap text-neutral-500 hover:text-neutral-200">
              <TrendingUp className="w-3.5 h-3.5 transition-colors text-neutral-500 group-hover:text-neutral-300" />
              Growth
            </button>
          </nav>
          
          <div className="flex-shrink-0 py-1.5">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-800/50 border border-neutral-800">
              <button className="px-3 py-2.5 sm:py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 bg-white text-black">7D</button>
              <button className="px-3 py-2.5 sm:py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 text-neutral-500 hover:text-white">14D</button>
              <button className="px-3 py-2.5 sm:py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 text-neutral-500 hover:text-white">30D</button>
              <button className="px-3 py-2.5 sm:py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 text-neutral-600 cursor-pointer">
                90D
                <Lock className="w-2.5 h-2.5 text-neutral-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-10 pt-6">
          <section id="section-engagement" className="space-y-4">
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
              <div className="px-5 pt-4 pb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm font-medium text-white">Messages</span>
                  <span className="text-[11px] text-neutral-500">last 7 days</span>
                </div>
                
                <div className="inline-flex flex-wrap gap-1 max-w-full sm:max-w-[60%] justify-end">
                  <button className="inline-flex items-center gap-1.5 px-2.5 py-2 sm:py-1 rounded-md text-[11px] font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-white text-black">
                    <MessageSquare className="w-3 h-3" />
                    Messages
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-2.5 py-2 sm:py-1 rounded-md text-[11px] font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-white">
                    <UserCheck className="w-3 h-3" />
                    Active Users
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-2.5 py-2 sm:py-1 rounded-md text-[11px] font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-white">
                    <Mic className="w-3 h-3" />
                    Voice Time
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-2.5 py-2 sm:py-1 rounded-md text-[11px] font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-white">
                    <Users className="w-3 h-3" />
                    Members
                  </button>
                </div>
              </div>

              <div className="px-5 pb-3 flex items-end justify-between gap-6 flex-wrap">
                <div className="flex items-end gap-4">
                  <div className="flex flex-col">
                    <span className="text-4xl font-bold text-white tabular-nums leading-none">20</span>
                    <span className="text-[11px] text-neutral-500 mt-1">messages</span>
                  </div>
                  <div className="flex flex-col pb-0.5">
                    <span className="inline-flex items-center gap-0.5 text-2xl font-bold tabular-nums leading-none text-emerald-400">
                      <TrendingUp className="w-5 h-5" />
                      100.0%
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-1">+20 vs prev week</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Peak</span>
                    <span className="text-sm text-amber-400 font-semibold tabular-nums">Aug 20</span>
                    <span className="text-[11px] text-neutral-500 tabular-nums">· 20</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Avg</span>
                    <span className="text-sm text-white font-semibold tabular-nums">3</span>
                    <span className="text-[11px] text-neutral-500">/ day</span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-4">
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="engHeroFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#171717" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#525252', fontSize: 10 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#525252', fontSize: 10 }}
                        tickCount={5}
                      />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="messages" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fill="url(#engHeroFill)" 
                        activeDot={{ r: 5, fill: '#facc15', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button type="button" className="relative bg-neutral-900 rounded-2xl border overflow-hidden flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] transition-colors border-neutral-600 hover:border-neutral-700 text-left">
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-blue-400" />
                    <p className="text-[11px] text-neutral-500 font-medium leading-none">Total Messages</p>
                  </div>
                  <p className="text-[28px] font-bold text-white tabular-nums leading-none mt-2">20</p>
                  <div className="flex items-center gap-1 mt-1.5 h-3.5">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-[11px] font-medium tabular-nums text-emerald-400">+20<span className="opacity-75 ml-1">(↑100%)</span></span>
                  </div>
                </div>
                <div className="h-[42px] w-full mt-auto">
                  <svg width="100%" height="100%" viewBox="0 0 100 42" preserveAspectRatio="none" className="block">
                    <defs>
                      <linearGradient id="spark-grad-blue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18"></stop>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <polygon points="0,42 0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,4 100,42" fill="url(#spark-grad-blue)"></polygon>
                    <polyline points="0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,4" fill="none" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></polyline>
                  </svg>
                </div>
              </button>

              <button type="button" className="relative bg-neutral-900 rounded-2xl border overflow-hidden flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] transition-colors border-neutral-800 hover:border-neutral-700 text-left">
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3 text-violet-400" />
                    <p className="text-[11px] text-neutral-500 font-medium leading-none">Active Users</p>
                  </div>
                  <p className="text-[28px] font-bold text-white tabular-nums leading-none mt-2">0</p>
                  <div className="flex items-center gap-1 mt-1.5 h-3.5">
                    <span className="text-[11px] text-neutral-600">No change</span>
                  </div>
                </div>
                <div className="h-[42px] w-full mt-auto">
                  <svg width="100%" height="100%" viewBox="0 0 100 42" preserveAspectRatio="none" className="block">
                    <defs>
                      <linearGradient id="spark-grad-violet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.18"></stop>
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <polygon points="0,42 0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38 100,42" fill="url(#spark-grad-violet)"></polygon>
                    <polyline points="0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38" fill="none" stroke="#8b5cf6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></polyline>
                  </svg>
                </div>
              </button>

              <button type="button" className="relative bg-neutral-900 rounded-2xl border overflow-hidden flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] transition-colors border-neutral-800 hover:border-neutral-700 text-left">
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Mic className="w-3 h-3 text-amber-400" />
                    <p className="text-[11px] text-neutral-500 font-medium leading-none">Voice Time</p>
                  </div>
                  <p className="text-[28px] font-bold text-white tabular-nums leading-none mt-2">0m</p>
                  <div className="flex items-center gap-1 mt-1.5 h-3.5">
                    <span className="text-[11px] text-neutral-600">No change</span>
                  </div>
                </div>
                <div className="h-[42px] w-full mt-auto">
                  <svg width="100%" height="100%" viewBox="0 0 100 42" preserveAspectRatio="none" className="block">
                    <defs>
                      <linearGradient id="spark-grad-amber" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18"></stop>
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <polygon points="0,42 0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38 100,42" fill="url(#spark-grad-amber)"></polygon>
                    <polyline points="0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38" fill="none" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></polyline>
                  </svg>
                </div>
              </button>

              <button type="button" className="relative bg-neutral-900 rounded-2xl border overflow-hidden flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] transition-colors border-neutral-800 hover:border-neutral-700 text-left">
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <p className="text-[11px] text-neutral-500 font-medium leading-none">Members</p>
                  </div>
                  <p className="text-[28px] font-bold text-white tabular-nums leading-none mt-2">3</p>
                  <div className="flex items-center gap-1 mt-1.5 h-3.5">
                    <span className="text-[11px] text-neutral-600">No change</span>
                  </div>
                </div>
                <div className="h-[42px] w-full mt-auto">
                  <svg width="100%" height="100%" viewBox="0 0 100 42" preserveAspectRatio="none" className="block">
                    <defs>
                      <linearGradient id="spark-grad-emerald" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.18"></stop>
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <polygon points="0,42 0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38 100,42" fill="url(#spark-grad-emerald)"></polygon>
                    <polyline points="0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38" fill="none" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></polyline>
                  </svg>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
                <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white font-semibold">Top Message Channels</p>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Last 7 days · 20 messages</p>
                  </div>
                </div>
                <div className="flex-1 px-2 pb-3">
                  <div>
                    <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(52px,auto)_minmax(72px,auto)] gap-2 sm:grid-cols-[minmax(0,1.4fr)_minmax(70px,1fr)_minmax(90px,1fr)_minmax(110px,1fr)] sm:gap-3 px-2.5 pb-1.5">
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">Channel</span>
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">Messages</span>
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">% of Activity</span>
                      <span className="hidden sm:block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">Change</span>
                    </div>
                    <div className="divide-y divide-neutral-800/40">
                      <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(52px,auto)_minmax(72px,auto)] gap-2 sm:grid-cols-[minmax(0,1.4fr)_minmax(70px,1fr)_minmax(90px,1fr)_minmax(110px,1fr)] sm:gap-3 items-center px-2.5 py-1.5 transition-colors hover:bg-white/[0.02]">
                        <div className="min-w-0">
                          <span className="inline-flex items-center gap-1 min-w-0 px-1.5 py-0.5 border rounded w-fit max-w-full bg-indigo-500/15 border-indigo-500/20 text-indigo-200">
                            <Hash className="w-2.5 h-2.5 flex-shrink-0 text-indigo-300" />
                            <span className="text-[11px] font-medium truncate">chat</span>
                          </span>
                        </div>
                        <span className="text-sm text-white font-semibold tabular-nums">20</span>
                        <div className="flex items-center gap-1.5">
                          <div className="relative w-5 h-5 flex-shrink-0">
                            <svg viewBox="0 0 36 36" className="w-5 h-5 -rotate-90">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="4" className="text-neutral-700"></circle>
                              <circle cx="18" cy="18" r="15" fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray="94.2 94.2" className="text-emerald-500"></circle>
                            </svg>
                          </div>
                          <span className="text-xs text-neutral-200 tabular-nums">100%</span>
                        </div>
                        <span className="hidden sm:inline-block text-xs tabular-nums font-medium text-emerald-400">+20</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
                <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white font-semibold">Top Reaction Channels</p>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Last 7 days · 0 total</p>
                  </div>
                </div>
                <div className="flex-1 px-2 pb-3">
                  <div className="h-[160px] flex flex-col items-center justify-center text-center px-4">
                    <Smile className="w-7 h-7 text-neutral-700 mb-2" />
                    <p className="text-sm text-neutral-300 font-medium">No reactions tracked yet</p>
                    <p className="text-[11px] text-neutral-600 mt-1">Reaction tracking just started — channels with reactions will appear here.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
