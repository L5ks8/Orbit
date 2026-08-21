import React, { useState } from 'react';
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
  { name: 'Aug 21', messages: 0 }
];

export default function Analytics() {
  const [messagesRange, setMessagesRange] = useState('7d');
  
  return (
    <div className="pb-overview-container">
      <div className="mb-4">
        <nav style={{ display: 'flex', gap: '2px', overflowX: 'auto', borderBottom: '1px solid #262626', paddingBottom: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '14px', fontWeight: '500', color: '#fff', borderBottom: '2px solid #fff' }}>
              <Activity size={16} /> Engagement
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '14px', fontWeight: '500', color: '#737373' }}>
              <Users size={16} /> People
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '14px', fontWeight: '500', color: '#737373' }}>
              <Hash size={16} /> Activity
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '14px', fontWeight: '500', color: '#737373' }}>
              <Shield size={16} /> Moderation
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '14px', fontWeight: '500', color: '#737373' }}>
              <AlertTriangle size={16} /> Safety
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '14px', fontWeight: '500', color: '#737373' }}>
              <TrendingUp size={16} /> Growth
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px', padding: '4px' }}>
             <button style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', borderRadius: '8px', backgroundColor: '#fff', color: '#000' }}>7D</button>
             <button style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', borderRadius: '8px', color: '#737373' }}>14D</button>
             <button style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', borderRadius: '8px', color: '#737373' }}>30D</button>
             <button style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', borderRadius: '8px', color: '#525252', display: 'flex', alignItems: 'center', gap: '4px' }}>90D <Lock size={10} /></button>
          </div>
        </nav>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Main Big Chart */}
        <div className="pb-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 16px 8px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#34d399" />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Messages</span>
              <span style={{ fontSize: '12px', color: '#737373' }}>last 7 days</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', borderRadius: '6px', backgroundColor: '#fff', color: '#000', border: 'none' }}>
                <MessageSquare size={14} /> Messages
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', borderRadius: '6px', backgroundColor: '#171717', border: '1px solid #262626', color: '#a3a3a3' }}>
                <UserCheck size={14} /> Active Users
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', borderRadius: '6px', backgroundColor: '#171717', border: '1px solid #262626', color: '#a3a3a3' }}>
                <Mic size={14} /> Voice Time
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', borderRadius: '6px', backgroundColor: '#171717', border: '1px solid #262626', color: '#a3a3a3' }}>
                <Users size={14} /> Members
              </button>
            </div>
          </div>
          
          <div style={{ padding: '0 20px 12px 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff', lineHeight: '1' }} className="tabular-nums">20</div>
                <div style={{ fontSize: '12px', color: '#737373', marginTop: '4px' }}>messages</div>
              </div>
              <div style={{ paddingBottom: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '20px', fontWeight: '700', color: '#34d399', lineHeight: '1' }} className="tabular-nums">
                  <TrendingUp size={20} /> 100.0%
                </div>
                <div style={{ fontSize: '12px', color: '#737373', marginTop: '4px' }}>+20 vs prev week</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                 <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#737373', fontWeight: '600' }}>Peak</span>
                 <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '600' }} className="tabular-nums">Aug 20</span>
                 <span style={{ fontSize: '12px', color: '#737373' }}>· 20</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                 <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#737373', fontWeight: '600' }}>Avg</span>
                 <span style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }} className="tabular-nums">3</span>
                 <span style={{ fontSize: '12px', color: '#737373' }}>/ day</span>
               </div>
            </div>
          </div>

          <div style={{ padding: '0 20px 20px 20px', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="engHeroFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} tickCount={5} />
                <RechartsTooltip cursor={{fill: '#262626'}} contentStyle={{backgroundColor: '#171717', borderColor: '#262626', color: '#fff'}} />
                <Area type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={2} fill="url(#engHeroFill)" activeDot={{ r: 5, fill: '#facc15', stroke: '#ffffff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4 Sparkline Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          
          <div className="pb-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', height: '140px' }}>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={12} color="#60a5fa" />
                <span style={{ fontSize: '12px', color: '#737373', fontWeight: '500' }}>Total Messages</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginTop: '8px' }} className="tabular-nums">20</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <TrendingUp size={12} color="#34d399" />
                <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '500' }}>+20 <span style={{ opacity: 0.75 }}>(↑100%)</span></span>
              </div>
            </div>
            <div style={{ height: '42px', width: '100%', marginTop: 'auto' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 42" preserveAspectRatio="none" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="spark-grad-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <polygon points="0,42 0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,4 100,42" fill="url(#spark-grad-blue)"></polygon>
                <polyline points="0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,4" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></polyline>
              </svg>
            </div>
          </div>

          <div className="pb-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', height: '140px' }}>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={12} color="#a78bfa" />
                <span style={{ fontSize: '12px', color: '#737373', fontWeight: '500' }}>Active Users</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginTop: '8px' }} className="tabular-nums">0</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: '#525252' }}>No change</span>
              </div>
            </div>
            <div style={{ height: '42px', width: '100%', marginTop: 'auto' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 42" preserveAspectRatio="none" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="spark-grad-violet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <polygon points="0,42 0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38 100,42" fill="url(#spark-grad-violet)"></polygon>
                <polyline points="0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></polyline>
              </svg>
            </div>
          </div>

          <div className="pb-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', height: '140px' }}>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mic size={12} color="#fbbf24" />
                <span style={{ fontSize: '12px', color: '#737373', fontWeight: '500' }}>Voice Time</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginTop: '8px' }} className="tabular-nums">0m</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: '#525252' }}>No change</span>
              </div>
            </div>
            <div style={{ height: '42px', width: '100%', marginTop: 'auto' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 42" preserveAspectRatio="none" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="spark-grad-amber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <polygon points="0,42 0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38 100,42" fill="url(#spark-grad-amber)"></polygon>
                <polyline points="0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></polyline>
              </svg>
            </div>
          </div>

          <div className="pb-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', height: '140px' }}>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={12} color="#34d399" />
                <span style={{ fontSize: '12px', color: '#737373', fontWeight: '500' }}>Members</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginTop: '8px' }} className="tabular-nums">3</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: '#525252' }}>No change</span>
              </div>
            </div>
            <div style={{ height: '42px', width: '100%', marginTop: 'auto' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 42" preserveAspectRatio="none" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="spark-grad-green" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <polygon points="0,42 0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38 100,42" fill="url(#spark-grad-green)"></polygon>
                <polyline points="0,38 16.6,38 33.3,38 50,38 66.6,38 83.3,38 100,38" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* 2 Bottom Channels Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div className="pb-card" style={{ display: 'flex', flexDirection: 'column', height: '220px' }}>
            <div style={{ padding: '16px 16px 8px 16px' }}>
              <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: '600', margin: 0 }}>Top Message Channels</h3>
              <p style={{ fontSize: '12px', color: '#737373', margin: '2px 0 0 0' }}>Last 7 days · 0 total</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={28} color="#404040" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '14px', color: '#d4d4d4', fontWeight: '500', margin: 0 }}>No messages tracked yet</p>
              <p style={{ fontSize: '12px', color: '#737373', marginTop: '4px', margin: '4px 0 0 0' }}>Message tracking just started — channels with messages will appear here.</p>
            </div>
          </div>

          <div className="pb-card" style={{ display: 'flex', flexDirection: 'column', height: '220px' }}>
            <div style={{ padding: '16px 16px 8px 16px' }}>
              <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: '600', margin: 0 }}>Top Reaction Channels</h3>
              <p style={{ fontSize: '12px', color: '#737373', margin: '2px 0 0 0' }}>Last 7 days · 0 total</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Smile size={28} color="#404040" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '14px', color: '#d4d4d4', fontWeight: '500', margin: 0 }}>No reactions tracked yet</p>
              <p style={{ fontSize: '12px', color: '#737373', marginTop: '4px', margin: '4px 0 0 0' }}>Reaction tracking just started — channels with reactions will appear here.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
