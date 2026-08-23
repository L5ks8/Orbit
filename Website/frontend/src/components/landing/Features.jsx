import React from 'react';

export default function Features() {
  return (
    <section className="lp-section">
      <div className="lp-section-label reveal">Features</div>
      <h2 className="lp-section-title reveal">Everything your server needs,<br/>nothing it doesn't.</h2>
      <div className="lp-bento reveal-stagger">
        {/* ROW 1 */}
        <div className="lp-bento-card lp-bento-wide reveal card-glow" style={{ '--i': 0 }}>
          <div className="lp-bento-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <h3>AutoMod &amp; Security</h3>
          <p>Automatic spam detection, invite link blocking, alt account filtering, and fully configurable punishment actions — all without lifting a finger.</p>
          <div className="lp-bento-tags"><span>Anti-Spam</span><span>Anti-Link</span><span>Anti-Alt</span></div>
        </div>
        <div className="lp-bento-card reveal card-glow" style={{ '--i': 1 }}>
          <div className="lp-bento-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /></svg>
          </div>
          <h3>Ticket System</h3>
          <p>Create beautiful support panels with custom categories, auto-roles, and log channels.</p>
        </div>
        {/* ROW 2 */}
        <div className="lp-bento-card lp-bento-wide reveal card-glow" style={{ '--i': 2 }}>
          <div className="lp-bento-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h1m8-9v1m8 8h1M5.6 5.6l.7.7m12.1-.7-.7.7M9 16a5 5 0 1 1 6 0 3.5 3.5 0 0 0-1 3 2 2 0 0 1-4 0 3.5 3.5 0 0 0-1-3" /></svg>
          </div>
          <h3>Web Dashboard</h3>
          <p>Configure every single feature from this beautiful web panel. No commands needed — just login with Discord and manage your server visually.</p>
          <div className="lp-bento-tags"><span>Real-time sync</span><span>Role-based access</span><span>Mobile friendly</span></div>
        </div>
        <div className="lp-bento-card reveal card-glow" style={{ '--i': 3 }}>
          <div className="lp-bento-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
          </div>
          <h3>Advanced Logs</h3>
          <p>Track everything that happens in your server. Deleted messages, voice channel activity, role changes and more.</p>
        </div>
        {/* ROW 3 */}
        <div className="lp-bento-card reveal card-glow" style={{ '--i': 4 }}>
          <div className="lp-bento-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="m16 3 2 2 4-4" /></svg>
          </div>
          <h3>Join Roles</h3>
          <p>Automatically assign roles when a user joins. Set multiple roles at once.</p>
        </div>
        <div className="lp-bento-card reveal card-glow" style={{ '--i': 5 }}>
          <div className="lp-bento-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
          </div>
          <h3>Welcome Cards</h3>
          <p>Beautiful custom welcome images with custom backgrounds and messages for new members.</p>
        </div>
        <div className="lp-bento-card reveal card-glow" style={{ '--i': 6 }}>
          <div className="lp-bento-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
          </div>
          <h3>Verification Gate</h3>
          <p>CAPTCHA or one-click verification to keep bots and alts out of your community.</p>
        </div>
        {/* ROW 4 */}
        <div className="lp-bento-card reveal card-glow" style={{ '--i': 7 }}>
          <div className="lp-bento-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
          </div>
          <h3>Temp Voice</h3>
          <p>Join to Create system. Users get their own temporary voice channel when they join the hub.</p>
        </div>
        <div className="lp-bento-card reveal card-glow" style={{ '--i': 8 }}>
          <div className="lp-bento-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect width="20" height="5" x="2" y="7" /><line x1="12" x2="12" y1="22" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
          </div>
          <h3>Giveaways &amp; Polls</h3>
          <p>Host exciting giveaways and create interactive polls to engage your community.</p>
        </div>
        <div className="lp-bento-card reveal card-glow" style={{ '--i': 9 }}>
          <div className="lp-bento-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" /><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" /></svg>
          </div>
          <h3>Auto-Replies</h3>
          <p>Set trigger words and instant bot responses. Restrict replies to specific channels.</p>
        </div>
      </div>
    </section>
  );
}
