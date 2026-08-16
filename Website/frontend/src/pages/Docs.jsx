import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DiscordEmbed from '../components/ui/DiscordEmbed';

export const docsData = {
  introduction: {
    title: 'Introduction',
    icon: <BookIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'explore', label: 'Explore the Docs' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          The official documentation for <strong>Orbit</strong>.
        </p>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Here you can find information about Orbit's features, moderation tools, and other general usage information.
        </p>
        <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-primary)', marginBottom: '48px' }}>
          <InfoIcon />
          <span style={{ fontSize: '14px' }}>This documentation is actively being updated and may change.</span>
        </div>

        <h2 id="explore" style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <SearchIcon /> Explore the Docs
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="docs-explore-card" onClick={() => document.getElementById('btn-setup').click()}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Initial Setup</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>Configure Orbit for your server, set up permissions, and explore the dashboard.</p>
          </div>
          <div className="docs-explore-card" onClick={() => document.getElementById('btn-automod').click()}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Auto-Moderation</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>Protect your server with advanced spam detection, anti-raid, and automated punishments.</p>
          </div>
        </div>
      </>
    )
  },
  setup: {
    title: 'Initial Setup',
    icon: <SettingsIcon />,
    badge: 'NEW',
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'dashboard-access', label: 'Dashboard Access' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Configuring Orbit for the first time via the Web Dashboard.
        </p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <p style={{ marginBottom: '16px' }}>Orbit does not use complex slash commands for setup. Everything is managed visually through our dashboard.</p>
          <h2 id="dashboard-access" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Dashboard Access</h2>
          <p style={{ marginBottom: '16px' }}>Login with your Discord account on our website. You will see a list of servers where you have Manage Server permissions. Select your server to open the panel.</p>
          <p>We recommend enabling the <strong>Auto-Moderation</strong> and <strong>Welcome Cards</strong> modules first.</p>
        </div>
      </>
    )
  },
  automod: {
    title: 'Auto-Moderation',
    icon: <ShieldIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'punishments', label: 'Punishments' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Keep your community safe automatically.
        </p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <p>The Auto-Moderation module allows you to block bad words, spam, invite links, and zalgo text.</p>
          <h2 id="punishments" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Punishments</h2>
          <p>You can configure automated punishments (Warn, Mute, Kick, Ban) when a user triggers an Auto-Mod filter multiple times.</p>
        </div>
      </>
    )
  },
  'automod-punishments': {
    title: 'Auto-Mod Punishments',
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'available-actions', label: 'Available Actions' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Configure automated actions when filters are triggered.
        </p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <p>When a user violates an auto-mod filter, Orbit can automatically execute predefined punishments.</p>
          <h2 id="available-actions" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Available Actions</h2>
          <ul style={{ paddingLeft: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Delete Message:</strong> Instantly removes the offending message.</li>
            <li><strong>Warn:</strong> Adds a formal warning to the user's history.</li>
            <li><strong>Timeout:</strong> Temporarily mutes the user (up to 28 days).</li>
            <li><strong>Kick/Ban:</strong> Removes the user from the server for severe infractions.</li>
          </ul>
        </div>
      </>
    )
  },
  'automod-logs': {
    title: 'Audit & Logs',
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'log-setup', label: 'Log Setup' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Track every moderation action.
        </p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <h2 id="log-setup" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Log Setup</h2>
          <p>Assign a dedicated logging channel in the dashboard to receive detailed reports whenever Auto-Mod takes action. Logs include the original deleted message content, the rule triggered, and the punishment executed.</p>
        </div>
      </>
    )
  },
  leveling: {
    title: 'Leveling System',
    icon: <StarIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'xp-rates', label: 'XP Rates' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Reward active members with XP and roles.
        </p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <h2 id="xp-rates" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>XP Rates</h2>
          <p>Members gain XP by sending messages. You can configure the XP rate, level up messages, and role rewards that are automatically given when a user reaches a certain level.</p>
        </div>
      </>
    )
  },
  verification: {
    title: 'Verification',
    icon: <ShieldCheckIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'setup', label: 'Setup' },
      { id: 'preview', label: 'Sneak Peek' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Protect your server from bot raids.
        </p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <h2 id="setup" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Features</h2>
          <ul style={{ paddingLeft: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>CAPTCHA Integration:</strong> Force new users to complete a CAPTCHA verification to gain access to your server.</li>
            <li><strong>Role Management:</strong> Automatically grant a "Verified" role and remove a "Quarantine/Unverified" role upon success.</li>
            <li><strong>Auto-Kick:</strong> Automatically kick users who fail to verify within a specified timeframe (e.g., 10 minutes).</li>
          </ul>
          
          <h2 id="preview" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Sneak Peek</h2>
          <DiscordEmbed 
            color="#38bdf8"
            title="Server Verification: Your Community"
            description="This server requires you to verify yourself to get access to other channels, you can simply verify by clicking on the verify button below."
            image="https://raw.githubusercontent.com/L5ks8/Orbit/main/Web/static/default_verify.png"
            buttons={[{ label: 'Verify', style: 'success' }]}
          />
        </div>
      </>
    )
  },
  'automations-welcome': {
    title: 'Welcome Messages',
    toc: [{ id: 'overview', label: 'Overview' }, { id: 'preview', label: 'Card Preview' }],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>Greet new members automatically with customized image cards.</p>
        <h2 id="preview" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Card Preview</h2>
        
        <div style={{
          width: '100%', maxWidth: '800px', aspectRatio: '800 / 300', 
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%), url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          borderRadius: '12px', position: 'relative', overflow: 'hidden',
          fontFamily: 'sans-serif', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <img src="/img/wumpus.png" alt="Wumpus" style={{ position: 'absolute', top: '5%', left: '7.5%', width: '20%', height: '53.33%', borderRadius: '50%', border: '4px solid #111111', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: '65%', left: '7.5%' }}>
            <h3 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 48px)', color: '#fff', fontWeight: 900, fontStyle: 'italic', letterSpacing: '1px', lineHeight: 1 }}>WELCOME</h3>
            <p style={{ margin: '5px 0 0', fontSize: 'clamp(14px, 2.5vw, 32px)', color: 'rgba(255, 255, 255, 0.78)', lineHeight: 1 }}>@wumpus</p>
          </div>
        </div>
      </>
    )
  },
  'automations-goodbye': {
    title: 'Goodbye Messages',
    toc: [{ id: 'overview', label: 'Overview' }, { id: 'preview', label: 'Card Preview' }],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>Send a farewell message and image card when someone leaves.</p>
        <h2 id="preview" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Card Preview</h2>
        
        <div style={{
          width: '100%', maxWidth: '800px', aspectRatio: '800 / 300', 
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%), url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          borderRadius: '12px', position: 'relative', overflow: 'hidden',
          fontFamily: 'sans-serif', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <img src="/img/wumpus.png" alt="Wumpus" style={{ position: 'absolute', top: '5%', left: '7.5%', width: '20%', height: '53.33%', borderRadius: '50%', border: '4px solid #111111', objectFit: 'cover', filter: 'grayscale(100%)' }} />
          <div style={{ position: 'absolute', top: '65%', left: '7.5%' }}>
            <h3 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 48px)', color: '#fff', fontWeight: 900, fontStyle: 'italic', letterSpacing: '1px', lineHeight: 1 }}>GOODBYE</h3>
            <p style={{ margin: '5px 0 0', fontSize: 'clamp(14px, 2.5vw, 32px)', color: 'rgba(255, 255, 255, 0.78)', lineHeight: 1 }}>@wumpus</p>
          </div>
        </div>
      </>
    )
  },
  'automations-roles': {
    title: 'Auto Roles',
    toc: [{ id: 'overview', label: 'Overview' }],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>Automatically assign roles when users join.</p>
      </>
    )
  },
  'automations-respond': {
    title: 'Auto Respond',
    toc: [{ id: 'overview', label: 'Overview' }],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>Create custom bot responses to specific keywords.</p>
      </>
    )
  },
  'tickets': {
    title: 'Ticket System',
    icon: <TicketIcon />,
    toc: [{ id: 'overview', label: 'Overview' }, { id: 'categories', label: 'Categories' }, { id: 'preview', label: 'Sneak Peek' }],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>Create beautiful support panels for your community.</p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <p>Orbit's ticket system allows users to open private channels to speak with your staff.</p>
          <h2 id="categories" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Features</h2>
          <ul style={{ paddingLeft: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Multiple Categories:</strong> Set up distinct ticket types (e.g., Support, Billing) via dropdown menus.</li>
            <li><strong>Staff Tools:</strong> Claim tickets, generate HTML transcripts, and close tickets with one click.</li>
            <li><strong>Blacklists:</strong> Restrict abusive members from opening tickets.</li>
          </ul>

          <h2 id="preview" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Sneak Peek</h2>
          <DiscordEmbed 
            color="#5865F2"
            title="Support Tickets"
            description="Please select a category below to open a ticket and contact our staff team."
            selectMenu={{ placeholder: 'Select a category...' }}
          />
        </div>
      </>
    )
  },
  'temp-voice': {
    title: 'Temp Voice',
    icon: <MicIcon />,
    toc: [{ id: 'overview', label: 'Overview' }],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>Join-to-create voice channels.</p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <p>When a user joins the Hub channel, Orbit automatically creates a new, private voice channel for them. They have full control to change the name, limit users, or kick people.</p>
        </div>
      </>
    )
  },
  'giveaways': {
    title: 'Giveaways & Polls',
    icon: <GiftIcon />,
    toc: [{ id: 'overview', label: 'Overview' }, { id: 'preview', label: 'Sneak Peek' }],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>Engage your community with events.</p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <p>Easily host giveaways with entry requirements, multiple winners, and automated drawing. Create interactive polls to gather community feedback.</p>
          
          <h2 id="preview" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Sneak Peek</h2>
          <DiscordEmbed 
            color="#a855f7"
            title="🎉 GIVEAWAY: 1x Nitro Classic 🎉"
            description="React with 🎉 or click the button below to enter!"
            fields={[
              { name: 'Winners', value: '1', inline: true },
              { name: 'Ends In', value: '24 hours', inline: true }
            ]}
            footer={{ text: 'Hosted by @wumpus' }}
            buttons={[{ label: 'Join Giveaway', style: 'primary', emoji: '🎉' }]}
          />
        </div>
      </>
    )
  },
  'logs': {
    title: 'Advanced Logs',
    icon: <ActivityIcon />,
    toc: [{ id: 'overview', label: 'Overview' }, { id: 'preview', label: 'Sneak Peek' }],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>Track everything happening in your server.</p>
        <div className="document-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
          <p>Orbit logs message deletions, edits, voice channel joins/leaves, role updates, and moderation actions into clean, categorized embed messages.</p>

          <h2 id="preview" style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Sneak Peek</h2>
          <DiscordEmbed 
            color="#ef4444"
            author={{ name: 'Message Deleted', icon: '/img/wumpus.png' }}
            description="**Message sent by <@Wumpus> deleted in <#general>**\n\nThis was a bad message that got deleted by auto-mod."
            footer={{ text: 'User ID: 123456789' }}
          />
        </div>
      </>
    )
  }
};

export default function Docs() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize from URL search params
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'introduction';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [expanded, setExpanded] = useState({ automod: false, automations: false });

  // Update state if URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
      if (tab.startsWith('automod-')) setExpanded(p => ({ ...p, automod: true }));
      if (tab.startsWith('automations-')) setExpanded(p => ({ ...p, automations: true }));
    }
  }, [location.search]);

  // Update URL when activeTab changes internally
  const handleTabChange = (key) => {
    setActiveTab(key);
    navigate(`/docs?tab=${key}`, { replace: true });
  };

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    // Scroll to top when active tab changes if we were scrolled down
    window.scrollTo(0, 0);
  }, [activeTab]);

  const activeContent = docsData[activeTab];

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
        overflow: 'hidden', // User requested "nicht hoch und runter scrollen"
        backgroundColor: '#0a0a0b'
      }}>
        
        {/* Sub-nav in sidebar */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '24px' }}>
          <Link to="/docs" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '2px solid var(--text-primary)', paddingBottom: '14px', marginBottom: '-17px' }}>
            <BookIcon /> Docs
          </Link>
          <Link to="/guides" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
            <GuideIcon /> Guides
          </Link>
        </div>

        <div className="docs-nav-group">
          <div 
            id="btn-introduction"
            className={`docs-nav-item ${activeTab === 'introduction' ? 'active' : ''}`}
            onClick={() => handleTabChange('introduction')}
          >
            {docsData.introduction.icon} {docsData.introduction.title}
          </div>
          
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '24px', marginBottom: '8px', paddingLeft: '8px' }}>
            Getting Started
          </div>
          
          <div 
            id="btn-setup"
            className={`docs-nav-item ${activeTab === 'setup' ? 'active' : ''}`}
            onClick={() => handleTabChange('setup')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
              {docsData.setup.icon} {docsData.setup.title}
            </div>
            {docsData.setup.badge && <span className="docs-badge">{docsData.setup.badge}</span>}
          </div>

          <div style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '24px', marginBottom: '8px', paddingLeft: '8px' }}>
            Features
          </div>

          <div 
            id="btn-automod"
            className={`docs-nav-item ${expanded.automod ? 'expanded' : ''}`}
            onClick={() => toggleExpand('automod')}
            style={{ 
              background: expanded.automod ? 'rgba(255,255,255,0.03)' : 'transparent',
              marginBottom: '4px'
            }}
          >
            {docsData.automod.icon} {docsData.automod.title}
            <ChevronDownIcon style={{ marginLeft: 'auto', transform: expanded.automod ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.8 }} />
          </div>

          {expanded.automod && (
            <div style={{
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              marginLeft: '18px',
              paddingTop: '4px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div 
                className={`docs-sub-item ${activeTab === 'automod' ? 'active' : ''}`}
                onClick={() => handleTabChange('automod')}
              >
                Filters
              </div>
              <div 
                className={`docs-sub-item ${activeTab === 'automod-punishments' ? 'active' : ''}`}
                onClick={() => handleTabChange('automod-punishments')}
              >
                Punishments
              </div>
              <div 
                className={`docs-sub-item ${activeTab === 'automod-logs' ? 'active' : ''}`}
                onClick={() => handleTabChange('automod-logs')}
              >
                Audit Logs
              </div>
            </div>
          )}

          <div 
            id="btn-verification"
            className={`docs-nav-item ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => handleTabChange('verification')}
          >
            {docsData.verification.icon} {docsData.verification.title}
          </div>

          <div 
            id="btn-leveling"
            className={`docs-nav-item ${activeTab === 'leveling' ? 'active' : ''}`}
            onClick={() => handleTabChange('leveling')}
          >
            {docsData.leveling.icon} {docsData.leveling.title}
          </div>

          <div 
            id="btn-tickets"
            className={`docs-nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => handleTabChange('tickets')}
          >
            {docsData.tickets.icon} {docsData.tickets.title}
          </div>
          
          <div 
            id="btn-temp-voice"
            className={`docs-nav-item ${activeTab === 'temp-voice' ? 'active' : ''}`}
            onClick={() => handleTabChange('temp-voice')}
          >
            {docsData['temp-voice'].icon} {docsData['temp-voice'].title}
          </div>

          <div 
            id="btn-giveaways"
            className={`docs-nav-item ${activeTab === 'giveaways' ? 'active' : ''}`}
            onClick={() => handleTabChange('giveaways')}
          >
            {docsData.giveaways.icon} {docsData.giveaways.title}
          </div>

          <div 
            id="btn-logs"
            className={`docs-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => handleTabChange('logs')}
          >
            {docsData.logs.icon} {docsData.logs.title}
          </div>

          <div 
            id="btn-automations"
            className={`docs-nav-item ${expanded.automations ? 'expanded' : ''}`}
            onClick={() => toggleExpand('automations')}
            style={{ 
              background: expanded.automations ? 'rgba(255,255,255,0.03)' : 'transparent',
              marginBottom: '4px',
              marginTop: '4px'
            }}
          >
            <ZapIcon /> Automations
            <ChevronDownIcon style={{ marginLeft: 'auto', transform: expanded.automations ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.8 }} />
          </div>

          {expanded.automations && (
            <div style={{
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              marginLeft: '18px',
              paddingTop: '4px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div 
                className={`docs-sub-item ${activeTab === 'automations-welcome' ? 'active' : ''}`}
                onClick={() => handleTabChange('automations-welcome')}
              >
                Welcome
              </div>
              <div 
                className={`docs-sub-item ${activeTab === 'automations-goodbye' ? 'active' : ''}`}
                onClick={() => handleTabChange('automations-goodbye')}
              >
                Goodbye
              </div>
              <div 
                className={`docs-sub-item ${activeTab === 'automations-roles' ? 'active' : ''}`}
                onClick={() => handleTabChange('automations-roles')}
              >
                Auto Roles
              </div>
              <div 
                className={`docs-sub-item ${activeTab === 'automations-respond' ? 'active' : ''}`}
                onClick={() => handleTabChange('automations-respond')}
              >
                Auto Respond
              </div>
            </div>
          )}

        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: '48px 64px', maxWidth: '1000px' }}>
        <div style={{ animation: 'fadeIn 0.2s ease-out' }} key={activeTab}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px', letterSpacing: '-0.5px' }}>{activeContent.title}</h1>
          {activeContent.content}
        </div>
      </main>

      {/* Optional Right Sidebar (On this page) */}
      <aside style={{ width: '200px', flexShrink: 0, padding: '48px 24px', position: 'sticky', top: '56px', height: 'calc(100vh - 56px)' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MenuIcon /> On this page
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          {activeContent.toc && activeContent.toc.map((item, index) => (
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
      </aside>

    </div>
  );
}

// Icons
function BookIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>;
}
function GuideIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>;
}
function SettingsIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
}
function ShieldIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
}
function StarIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
}
function SearchIcon({ style }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
}
function InfoIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
}
function ChevronRightIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', opacity: 0.5 }}><polyline points="9 18 15 12 9 6"></polyline></svg>;
}
function ChevronDownIcon({ style }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="6 9 12 15 18 9"></polyline></svg>;
}
function MenuIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
}
function ShieldCheckIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
}
function ZapIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
}
function TicketIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path></svg>;
}
function MicIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>;
}
function GiftIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect width="20" height="5" x="2" y="7"></rect><line x1="12" x2="12" y1="22" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>;
}
function ActivityIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>;
}
