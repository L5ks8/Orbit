import React from 'react';

export default function HowItWorks() {
  return (
    <section className="lp-how-section">
      <div className="lp-section-label reveal">Getting Started</div>
      <h2 className="lp-section-title reveal">Up and running<br/>in 60 seconds.</h2>
      <div className="steps-container reveal">
        <div className="step-card">
          <div className="step-number">1</div>
          <h3>Invite Orbit</h3>
          <p>Click "Add to Discord" and select your server. Orbit needs just basic permissions to get started.</p>
        </div>
        <div className="step-connector"></div>
        <div className="step-card">
          <div className="step-number">2</div>
          <h3>Open Dashboard</h3>
          <p>Login with Discord and select your server. Configure every feature visually — no commands needed.</p>
        </div>
        <div className="step-connector"></div>
        <div className="step-card">
          <div className="step-number">3</div>
          <h3>You're Done</h3>
          <p>Changes apply instantly. Your server is now protected, managed, and enhanced by Orbit.</p>
        </div>
      </div>
    </section>
  );
}
