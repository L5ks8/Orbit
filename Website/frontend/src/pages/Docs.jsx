import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DiscordEmbed from '../components/ui/DiscordEmbed';

function SyntaxBlock({ title = "Syntax", syntax }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>{title}</h2>
      <div className="docs-syntax-block">
        <div style={{ position: 'absolute', top: '12px', right: '12px', opacity: 0.5, cursor: 'pointer' }}>
          <CopyIcon />
        </div>
        <div>
          {syntax.map((s, i) => (
            <span key={i} className={`docs-syntax-${s.type || 'text'}`}>{s.text}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PropertiesTable({ title = "Configuration / Fields", properties }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>{title}</h2>
      <table className="docs-properties-table">
        <thead>
          <tr>
            <th style={{ width: '30%' }}>Property / Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p, i) => (
            <tr key={i}>
              <td>
                <span className="docs-prop-type">{p.name}</span>
                {p.type && <div style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>{p.type}</div>}
              </td>
              <td>{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const docsData = {
  introduction: {
    title: 'Introduction',
    icon: <BookIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'features', label: 'Key Features' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Welcome to the official documentation for <strong>Orbit</strong>. Here you will find in-depth tutorials on how to configure and use every feature available in our Discord Bot.
        </p>
        <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-primary)', marginBottom: '48px' }}>
          <InfoIcon />
          <span style={{ fontSize: '14px' }}>These tutorials are actively updated. Follow the navigation at the bottom of each page to progress through the guide.</span>
        </div>

        <h2 id="features" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Key Features</h2>
        <PropertiesTable 
          title="What Orbit offers"
          properties={[
            { name: 'Auto-Moderation', description: 'Advanced spam detection, bad word filters, and automated punishments.' },
            { name: 'Verification', description: 'Secure your server with CAPTCHA and auto-kick capabilities.' },
            { name: 'Tickets', description: 'Interactive panels with multi-category dropdowns for support.' },
            { name: 'Automations', description: 'Honeypots, Welcome cards, goodbye messages, and more.' }
          ]} 
        />
      </>
    )
  },
  setup: {
    title: 'Initial Setup',
    icon: <SettingsIcon />,
    badge: 'NEW',
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'dashboard', label: 'Using the Dashboard' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Setting up Orbit is entirely visual. You won't need to remember complex slash commands or write configuration files.
        </p>
        
        <SyntaxBlock 
          title="Accessing the Dashboard"
          syntax={[
            { text: 'https://', type: 'punct' },
            { text: (import.meta.env.VITE_BASE_URL || 'orbit-498b.onrender.com').replace(/^https?:\/\//, ''), type: 'keyword' },
            { text: '/dashboard', type: 'type' }
          ]}
        />

        <h2 id="dashboard" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Using the Dashboard</h2>
        <PropertiesTable 
          properties={[
            { name: 'Login', type: 'Action', description: 'Click the Login button to authenticate with your Discord account via OAuth2.' },
            { name: 'Server Selection', type: 'Navigation', description: 'Select any server where you hold the "Manage Server" or "Administrator" permission.' },
            { name: 'Saving Changes', type: 'Action', description: 'Always remember to click the green "Save Changes" button in the navigation bar when modifying settings.' }
          ]}
        />
      </>
    )
  },
  automod: {
    title: 'Auto-Moderation',
    icon: <ShieldIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'filters', label: 'Available Filters' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Keep your community safe with automated filters that detect and act on malicious or unwanted content instantly.
        </p>

        <h2 id="filters" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Available Filters</h2>
        <PropertiesTable 
          properties={[
            { name: 'Bad Words', type: 'Toggle', description: 'Blocks messages containing profanity or words you specify in your custom blacklist.' },
            { name: 'Spam Prevention', type: 'Toggle', description: 'Detects users sending messages too quickly (rate-limiting).' },
            { name: 'Invite Links', type: 'Toggle', description: 'Automatically deletes discord.gg/ invite links sent by unauthorized users.' },
            { name: 'Mass Mentions', type: 'Toggle', description: 'Prevents ghost-pings and mass-pings by limiting the number of allowed mentions per message.' }
          ]}
        />
      </>
    )
  },
  'automod-punishments': {
    title: 'Auto-Mod Punishments',
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'actions', label: 'Automated Actions' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          When a user violates an Auto-Mod filter multiple times, Orbit can automatically execute predefined punishments to stop raids and trolls in their tracks.
        </p>

        <h2 id="actions" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Automated Actions</h2>
        <PropertiesTable 
          properties={[
            { name: 'Warn', type: 'Punishment', description: 'Adds a formal warning to the user\'s history. Useful for initial infractions.' },
            { name: 'Timeout', type: 'Punishment', description: 'Temporarily mutes the user. You can configure the duration (e.g., 10 minutes, 1 hour).' },
            { name: 'Softban', type: 'Punishment', description: 'Bans and immediately unbans the user, which kicks them and deletes their recent messages.' },
            { name: 'Ban', type: 'Punishment', description: 'Permanently removes the user from the server for severe or repeated infractions.' }
          ]}
        />
      </>
    )
  },
  'automod-logs': {
    title: 'Audit Logs',
    toc: [
      { id: 'overview', label: 'Overview' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Track every Auto-Mod action to maintain transparency and review false positives.
        </p>

        <SyntaxBlock 
          title="Log Output Format"
          syntax={[
            { text: 'Action:', type: 'keyword' },
            { text: ' Message Deleted\n', type: 'text' },
            { text: 'User:', type: 'keyword' },
            { text: ' @username (123456789)\n', type: 'type' },
            { text: 'Reason:', type: 'keyword' },
            { text: ' Triggered Bad Word Filter\n', type: 'text' }
          ]}
        />

        <PropertiesTable 
          properties={[
            { name: 'Log Channel', type: 'Channel', description: 'The specific Discord channel where Orbit will send moderation embeds. Keep this private for staff only.' }
          ]}
        />
      </>
    )
  },
  verification: {
    title: 'Verification System',
    icon: <ShieldCheckIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'setup', label: 'Configuration' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Protect your server from bot raids by forcing new users to complete a CAPTCHA verification to gain access to your channels.
        </p>

        <h2 id="setup" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Configuration Fields</h2>
        <PropertiesTable 
          properties={[
            { name: 'Verification Channel', type: 'Channel', description: 'Where the verification panel is sent. Users must be able to view this channel upon joining.' },
            { name: 'Verified Role', type: 'Role', description: 'The role granted to users who successfully complete the CAPTCHA.' },
            { name: 'Unverified Role', type: 'Role', description: '(Optional) A role given to users when they join, which is removed upon verification.' },
            { name: 'Auto-Kick Timer', type: 'Number (Minutes)', description: 'Automatically kick users who fail to verify within this timeframe (e.g., 10 minutes).' }
          ]}
        />
      </>
    )
  },
  leveling: {
    title: 'Leveling System',
    icon: <StarIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'rewards', label: 'XP & Rewards' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Reward active members with XP and roles. Orbit tracks messages and voice activity to calculate user levels.
        </p>

        <h2 id="rewards" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>XP & Rewards</h2>
        <PropertiesTable 
          properties={[
            { name: 'XP Multiplier', type: 'Decimal', description: 'Global multiplier for XP gain. E.g., 1.5x gives 50% more XP.' },
            { name: 'Level Up Messages', type: 'Toggle', description: 'Send a congratulatory message when a user levels up. Can be routed to a specific channel.' },
            { name: 'Role Rewards', type: 'Map<Level, Role>', description: 'Automatically assign specific Discord roles when users reach milestones (e.g., Level 10 gets "Active Member").' }
          ]}
        />
      </>
    )
  },
  tickets: {
    title: 'Ticket System',
    icon: <TicketIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'categories', label: 'Ticket Categories' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Create beautiful, interactive support panels for your community using modern Discord UI components.
        </p>

        <SyntaxBlock 
          title="Staff Commands inside a Ticket"
          syntax={[
            { text: '/ticket ', type: 'keyword' },
            { text: 'close', type: 'type' },
            { text: '\n', type: 'text' },
            { text: '/ticket ', type: 'keyword' },
            { text: 'add ', type: 'type' },
            { text: '<@user>', type: 'punct' }
          ]}
        />

        <h2 id="categories" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Ticket Categories</h2>
        <PropertiesTable 
          properties={[
            { name: 'Panel Channel', type: 'Channel', description: 'The channel where the main Ticket embed and dropdown will be placed.' },
            { name: 'Category Name', type: 'String', description: 'Visible in the dropdown (e.g., "Support", "Billing", "Reports").' },
            { name: 'Support Role', type: 'Role', description: 'The staff role that gets pinged and has access to view tickets in this category.' }
          ]}
        />
      </>
    )
  },
  'temp-voice': {
    title: 'Temp Voice Channels',
    icon: <MicIcon />,
    toc: [
      { id: 'overview', label: 'Overview' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Set up "Join-to-Create" voice hubs. When a user joins the hub channel, Orbit automatically creates a new, private voice channel for them.
        </p>

        <PropertiesTable 
          properties={[
            { name: 'Hub Channel', type: 'Voice Channel', description: 'The trigger channel users join to create their own temp channel.' },
            { name: 'Category', type: 'Category', description: 'Where the temporary voice channels will be created.' },
            { name: 'Owner Permissions', type: 'System', description: 'The creator gets full control to rename the channel, change user limits, and kick users via voice controls.' }
          ]}
        />
      </>
    )
  },
  giveaways: {
    title: 'Giveaways & Polls',
    icon: <GiftIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'commands', label: 'Commands' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Host engaging giveaways with entry requirements, multiple winners, and automated drawing.
        </p>

        <h2 id="commands" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Commands</h2>
        <PropertiesTable 
          properties={[
            { name: '/gcreate', type: 'Command', description: 'Starts an interactive setup to launch a new giveaway in the current channel.' },
            { name: '/greroll', type: 'Command', description: 'Selects a new random winner for a recently ended giveaway.' },
            { name: '/gend', type: 'Command', description: 'Forces a running giveaway to end immediately and draws winners.' }
          ]}
        />
      </>
    )
  },
  logs: {
    title: 'Advanced Logging',
    icon: <ActivityIcon />,
    toc: [
      { id: 'overview', label: 'Overview' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Orbit tracks essential server activities and categorizes them into neat embeds, making moderation history easy to read.
        </p>

        <PropertiesTable 
          properties={[
            { name: 'Message Logs', type: 'Toggle/Channel', description: 'Logs deleted and edited messages, showing original content.' },
            { name: 'Voice Logs', type: 'Toggle/Channel', description: 'Logs when members join, move, or leave voice channels.' },
            { name: 'Role Logs', type: 'Toggle/Channel', description: 'Logs role creations, deletions, and member role updates.' },
            { name: 'Server Logs', type: 'Toggle/Channel', description: 'Logs channel creations, server settings changes, and more.' }
          ]}
        />
      </>
    )
  },
  'automations-welcome': {
    title: 'Welcome Messages',
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'variables', label: 'Message Variables' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Greet new members automatically with customized text and beautiful image cards.
        </p>

        <h2 id="variables" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Message Variables</h2>
        <PropertiesTable 
          properties={[
            { name: '{user}', type: 'Variable', description: 'Mentions the user (e.g., @Wumpus)' },
            { name: '{server}', type: 'Variable', description: 'The name of your Discord server' },
            { name: '{membercount}', type: 'Variable', description: 'The total number of members in your server' }
          ]}
        />
      </>
    )
  },
  'automations-goodbye': {
    title: 'Goodbye Messages',
    toc: [
      { id: 'overview', label: 'Overview' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Send a farewell message and image card when someone leaves the server.
        </p>

        <PropertiesTable 
          properties={[
            { name: 'Leave Channel', type: 'Channel', description: 'The channel where the goodbye message will be sent.' },
            { name: 'Message Content', type: 'Text', description: 'The text sent alongside the goodbye image card. Supports the same variables as Welcome messages.' }
          ]}
        />
      </>
    )
  },
  'automations-roles': {
    title: 'Auto Roles',
    toc: [
      { id: 'overview', label: 'Overview' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Automatically assign roles when users join, ensuring they get immediate access to community channels without manual intervention.
        </p>
        <PropertiesTable 
          properties={[
            { name: 'Roles to Assign', type: 'List<Role>', description: 'A list of roles that will be instantly granted to every new member upon joining.' },
            { name: 'Bot Roles', type: 'List<Role>', description: '(Optional) Roles granted only to bot accounts when they are added to the server.' }
          ]}
        />
      </>
    )
  },
  'automations-respond': {
    title: 'Honeypot System',
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'setup', label: 'Configuration' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          The Honeypot System is a powerful trap for compromised accounts and spam bots. By setting up a hidden channel, anyone who posts in it is immediately punished.
        </p>
        
        <h2 id="setup" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Configuration</h2>
        <PropertiesTable 
          properties={[
            { name: 'Honeypot Channel', type: 'Channel', description: 'A channel that regular users should NOT type in. If a bot scrapes and posts here, the trap triggers.' },
            { name: 'Punishment Action', type: 'Dropdown', description: 'The action taken (e.g., Softban, Ban, Timeout) when a message is caught.' },
            { name: 'Warning Style', type: 'Dropdown', description: 'Choose whether the bot displays a simple Text Message warning or a rich Embed.' }
          ]}
        />
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
    // Scroll to top when active tab changes
    window.scrollTo(0, 0);
  }, [activeTab]);

  const activeContent = docsData[activeTab];

  // Pagination Logic
  const keys = Object.keys(docsData);
  const currentIndex = keys.indexOf(activeTab);
  const prevKey = currentIndex > 0 ? keys[currentIndex - 1] : null;
  const nextKey = currentIndex < keys.length - 1 ? keys[currentIndex + 1] : null;

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
          <Link to="/docs" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '2px solid var(--text-primary)', paddingBottom: '14px', marginBottom: '-17px' }}>
            <BookIcon /> Docs
          </Link>
          <Link to="/guides" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
            <GuideIcon /> Guides
          </Link>
        </div>

        <div className="docs-nav-group" style={{ height: 'calc(100% - 60px)', overflowY: 'auto', paddingRight: '4px' }}>
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
              marginBottom: '32px',
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
                Honeypot
              </div>
            </div>
          )}

        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: '48px 64px', maxWidth: '1000px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ animation: 'fadeIn 0.2s ease-out', flexGrow: 1 }} key={activeTab}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px', letterSpacing: '-0.5px' }}>{activeContent.title}</h1>
          {activeContent.content}
        </div>

        {/* Page Navigation Component */}
        <div className="docs-page-navigation">
          {prevKey ? (
            <div className="docs-nav-button" onClick={() => handleTabChange(prevKey)} style={{ alignItems: 'flex-start' }}>
              <span className="nav-label">Previous Page</span>
              <span className="nav-title">
                <ChevronLeftIcon /> {docsData[prevKey].title}
              </span>
            </div>
          ) : <div></div>}
          
          {nextKey ? (
            <div className="docs-nav-button" onClick={() => handleTabChange(nextKey)} style={{ alignItems: 'flex-end' }}>
              <span className="nav-label">Next Page</span>
              <span className="nav-title">
                {docsData[nextKey].title} <ChevronRightIcon />
              </span>
            </div>
          ) : <div></div>}
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
function InfoIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
}
function ChevronRightIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><polyline points="9 18 15 12 9 6"></polyline></svg>;
}
function ChevronLeftIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><polyline points="15 18 9 12 15 6"></polyline></svg>;
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
function CopyIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
}
