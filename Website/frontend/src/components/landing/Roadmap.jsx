import React from 'react';

export default function Roadmap() {
  return (
    <section className="lp-section lp-pricing" id="roadmap">
      <div className="lp-section-header reveal">
        <h2 className="lp-section-title">Orbit Roadmap</h2>
        <p className="lp-section-sub">Here is what we are currently working on and what to expect in the future.</p>
      </div>

      <div className="lp-pricing-grid">
        {/* Phase 1 */}
        <div className="lp-pricing-card reveal" style={{ '--i': 0 }}>
          <div className="lp-pricing-header">
            <h3>Phase 1: Foundation</h3>
            <p>The core features are live and stable.</p>
          </div>
          <div className="lp-pricing-features">
            <ul>
              <li><CheckIcon /> Advanced Auto-Moderation</li>
              <li><CheckIcon /> Web Dashboard</li>
              <li><CheckIcon /> Ticket System</li>
              <li><CheckIcon /> Welcome & Leave Cards</li>
            </ul>
          </div>
          <div className="roadmap-status status-done">Completed</div>
        </div>

        {/* Phase 2 (In Progress) */}
        <div className="lp-pricing-card popular reveal" style={{ '--i': 1 }}>
          <div className="lp-pricing-badge">In Progress</div>
          <div className="lp-pricing-header">
            <h3>Phase 2: Engagement</h3>
            <p>Level up your community interactions.</p>
          </div>
          <div className="lp-pricing-features">
            <ul>
              <li><SpinnerIcon /> Leveling & XP System</li>
              <li><SpinnerIcon /> Advanced Giveaways</li>
              <li className="disabled"><CrossIcon /> Custom Bot Persona</li>
            </ul>
          </div>
          <div className="roadmap-status status-progress">Currently Working On</div>
        </div>

        {/* Phase 3 */}
        <div className="lp-pricing-card reveal" style={{ '--i': 2 }}>
          <div className="lp-pricing-header">
            <h3>Phase 3: AI & Growth</h3>
            <p>Smart tools for massive servers.</p>
          </div>
          <div className="lp-pricing-features">
            <ul>
              <li className="disabled"><CrossIcon /> AI Spam Detection</li>
              <li className="disabled"><CrossIcon /> AI Chat Summaries</li>
              <li className="disabled"><CrossIcon /> Detailed Server Analytics</li>
              <li className="disabled"><CrossIcon /> Third-party Plugins</li>
            </ul>
          </div>
          <div className="roadmap-status status-planned">Planned</div>
        </div>
      </div>
    </section>
  );
}

// Simple Inline Icons
function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--success)' }}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--warning)' }}>
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
  );
}
