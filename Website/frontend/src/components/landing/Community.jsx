import React from 'react';
import { Link } from 'react-router-dom';

export default function Community() {
  return (
    <section className="lp-section lp-community" id="community" style={{ padding: '100px 0', position: 'relative' }}>
      
      {/* Decorative ambient background elements */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100vw', height: '100%', overflow: 'hidden', zIndex: -1, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)' }}></div>
      </div>

      <div className="lp-community-card reveal" style={{
        position: 'relative',
        background: 'linear-gradient(145deg, rgba(30, 30, 36, 0.5) 0%, rgba(10, 10, 11, 0.8) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '80px 40px',
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Animated grid background inside card */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.5,
          zIndex: 0
        }}></div>

        <div className="lp-community-content" style={{ position: 'relative', zIndex: 1 }}>
          <div className="lp-community-badge" style={{
            display: 'inline-block',
            padding: '6px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#a1a1aa',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>Join the community</div>
          
          <h2 className="lp-section-title" style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 800,
            background: 'linear-gradient(to right, #ffffff, #a1a1aa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '24px',
            letterSpacing: '-1.5px'
          }}>Ready to level up your server?</h2>
          
          <p className="lp-section-sub" style={{
            fontSize: '18px',
            color: '#a1a1aa',
            maxWidth: '600px',
            margin: '0 auto 48px',
            lineHeight: 1.6
          }}>
            Join thousands of administrators in our official Discord server. Get support, request features, and stay up to date with the latest Orbit developments.
          </p>
          
          <div className="lp-community-actions" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <a href="#" className="lp-community-btn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              background: '#ffffff',
              color: '#000000',
              fontWeight: 600,
              fontSize: '15px',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 14px rgba(255, 255, 255, 0.25)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.4)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 255, 255, 0.25)'; }}
            >
              Join Discord <ArrowRightIcon />
            </a>
            
            <Link to="/docs" className="lp-community-btn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '15px',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
            >
              <DocsIcon /> Read the Docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}
