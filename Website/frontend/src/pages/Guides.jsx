import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const guidesData = {
  'guides-landing': {
    title: 'Guides',
    icon: <GuideIcon />,
    toc: [],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: '1.7', marginBottom: '48px' }}>
          Step-by-step guides for setting up and getting the most out of Orbit.
        </p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <p style={{ marginBottom: '24px' }}>Practical, walk-through guides for Orbit. Start here if you are new, then dig into the <strong>documentation reference</strong> once you are up and running.</p>
          
          <div 
            onClick={() => document.getElementById('btn-getting-started')?.click()}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '20px 24px',
              cursor: 'pointer',
              marginBottom: '32px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Getting Started</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Invite, set up, and configure Orbit for the first time.</p>
          </div>

          <p style={{ color: 'var(--text-secondary)' }}>More guides are on the way.</p>
        </div>
      </>
    )
  },
  'getting-started': {
    title: 'Getting Started',
    icon: <RocketIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'invite-orbit', label: '1. Invite Orbit' },
      { id: 'setup', label: '2. Setup' },
      { id: 'configure', label: '3. Configure' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Invite, set up, and configure Orbit for the first time.
        </p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <p style={{ marginBottom: '48px' }}>This guide takes you from an empty server to running a fully protected community with Orbit.</p>
          
          <h2 id="invite-orbit" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>1. Invite Orbit</h2>
          <p style={{ marginBottom: '16px' }}>Go to <strong>our website</strong> and click <strong>Add to Discord</strong> to invite the bot. Make sure to grant it the required Administrator permissions so it can manage roles and messages properly.</p>
          
          <div style={{ background: 'rgba(255, 165, 0, 0.1)', border: '1px solid rgba(255, 165, 0, 0.2)', borderLeft: '3px solid orange', borderRadius: '4px', padding: '16px 20px', color: 'rgba(255,255,255,0.9)', marginBottom: '48px', fontSize: '14px' }}>
            <strong style={{ color: 'orange' }}>⚠️ NOTE:</strong> The bot needs to be placed above the roles it is supposed to manage in your Discord Server Settings!
          </div>

          <h2 id="setup" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>2. Setup</h2>
          <p style={{ marginBottom: '16px' }}>Open the Web Dashboard, select your server, and follow the initial prompts. The dashboard will automatically sync your server roles and channels.</p>

          <h2 id="configure" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>3. Configure</h2>
          <p style={{ marginBottom: '16px' }}>Start by enabling the Auto-Moderation module and configuring the punishment settings for spam and bad words.</p>
        </div>
      </>
    )
  }
};

export default function Guides() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'guides-landing';

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    navigate(`/guides?tab=${key}`, { replace: true });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const activeContent = guidesData[activeTab];

  return (
    <div className="docs-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', backgroundColor: '#0a0a0b', color: '#ededed' }}>
      
      {/* Fixed Left Sidebar */}
      <aside style={{ 
        width: '260px', 
        flexShrink: 0, 
        borderRight: '1px solid rgba(255,255,255,0.05)', 
        padding: '24px 16px',
        position: 'sticky',
        top: '56px',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden',
        backgroundColor: '#0a0a0b'
      }}>
        
        {/* Sub-nav in sidebar */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '24px' }}>
          <Link to="/docs" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
            <BookIcon /> Docs
          </Link>
          <Link to="/guides" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '2px solid var(--text-primary)', paddingBottom: '14px', marginBottom: '-17px' }}>
            <GuideIcon /> Guides
          </Link>
        </div>

        <div className="docs-nav-group">
          <div 
            id="btn-guides-landing"
            className={`docs-nav-item ${activeTab === 'guides-landing' ? 'active' : ''}`}
            onClick={() => handleTabChange('guides-landing')}
            style={{ 
              border: activeTab === 'guides-landing' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              background: activeTab === 'guides-landing' ? 'rgba(255,255,255,0.03)' : 'transparent',
              marginBottom: '4px'
            }}
          >
            {guidesData['guides-landing'].icon} {guidesData['guides-landing'].title}
          </div>
          
          <div 
            id="btn-getting-started"
            className={`docs-nav-item ${activeTab === 'getting-started' ? 'active' : ''}`}
            onClick={() => handleTabChange('getting-started')}
            style={{ 
              border: activeTab === 'getting-started' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              background: activeTab === 'getting-started' ? 'rgba(255,255,255,0.03)' : 'transparent',
              marginBottom: '4px'
            }}
          >
            {guidesData['getting-started'].icon} {guidesData['getting-started'].title}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: '48px 64px', maxWidth: '1000px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ animation: 'fadeIn 0.2s ease-out', flexGrow: 1 }} key={activeTab}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px', letterSpacing: '-0.5px' }}>{activeContent.title}</h1>
          {activeContent.content}
        </div>
        
        {/* Next Button Pagination */}
        {activeTab === 'guides-landing' && (
          <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'flex-end' }}>
            <div 
              onClick={() => handleTabChange('getting-started')}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '16px 24px',
                cursor: 'pointer',
                textAlign: 'right',
                minWidth: '240px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginBottom: '4px' }}>
                Getting Started <ChevronRightIcon style={{ opacity: 1 }} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Download, set up, and run Orbit.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar (On this page) */}
      <aside style={{ width: '200px', flexShrink: 0, padding: '48px 24px', position: 'sticky', top: '56px', height: 'calc(100vh - 56px)' }}>
        {activeContent.toc && activeContent.toc.length > 0 && (
          <>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MenuIcon /> On this page
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              {activeContent.toc.map((item, index) => (
                <a 
                  key={index} 
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(item.id);
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  style={{ 
                    fontSize: '13px', 
                    color: index === 0 ? 'var(--text-primary)' : 'var(--text-muted)', 
                    fontWeight: index === 0 ? 600 : 400,
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.target.style.color = index === 0 ? 'var(--text-primary)' : 'var(--text-muted)'}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </>
        )}
      </aside>

    </div>
  );
}

// Icons
function BookIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>; }
function GuideIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>; }
function RocketIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>; }
function ChevronRightIcon({ style }) { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="9 18 15 12 9 6"></polyline></svg>; }
function MenuIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>; }
