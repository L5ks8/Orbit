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
            { text: (import.meta.env.VITE_BASE_URL || '').replace(/^https?:\/\/\/?/, ''), type: 'keyword' },
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
  'dashboard-overview': {
    title: 'Dashboard Overview',
    icon: <ActivityIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'stats', label: 'Server Statistics' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          The Overview tab is your command center. It provides a quick summary of your server's health, recent activity, and essential statistics at a glance.
        </p>
        
        <h2 id="stats" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Server Statistics</h2>
        <PropertiesTable 
          properties={[
            { name: 'Total Members', type: 'Metric', description: 'Displays the total number of members currently in your server.' },
            { name: 'Messages Today', type: 'Metric', description: 'Shows the volume of messages sent across all channels in the last 24 hours.' },
            { name: 'Active Voice', type: 'Metric', description: 'The number of users currently participating in voice channels.' },
            { name: 'Recent Joins', type: 'List', description: 'A quick feed of the newest members to join your community.' }
          ]}
        />
      </>
    )
  },
  'bot-profile': {
    title: 'Bot Profile',
    icon: <SettingsIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'customization', label: 'Customization Options' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Personalize Orbit to match your community's branding. The Bot Profile tab allows you to completely customize how Orbit appears in your server.
        </p>
        
        <h2 id="customization" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Customization Options</h2>
        <PropertiesTable 
          properties={[
            { name: 'Bot Name (Nickname)', type: 'Text', description: "Change the name Orbit uses when sending messages and appearing in the member list." },
            { name: 'Avatar', type: 'Image Upload', description: "Upload a custom profile picture for the bot." },
            { name: 'Profile Banner', type: 'Image Upload', description: "Set a custom banner for the bot's profile card." },
            { name: 'About Me', type: 'Text', description: "Customize the bot's bio/description." }
          ]}
        />
      </>
    )
  },
  'roles-reaction': {
    title: 'Roles & Reaction Roles',
    icon: <ZapIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'reaction-builder', label: 'Reaction Role Builder' },
      { id: 'automations', label: 'Role Automations' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          The Roles tab is a powerful suite for managing how users acquire roles. It includes the Reaction Role builder, Auto Roles, and advanced role retention systems.
        </p>
        
        <h2 id="reaction-builder" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Reaction Role Builder</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '16px' }}>
          Create interactive panels that allow users to self-assign roles by clicking buttons.
        </p>
        <PropertiesTable 
          properties={[
            { name: 'Panel Creation', type: 'Action', description: 'Click "New panel" to open the Reaction Role Builder. You can customize the embed title, description, color, and add multiple buttons.' },
            { name: 'Button Types', type: 'Setting', description: 'Choose between "Toggle" (click to add/remove) or "Add Only" (can only acquire the role).' },
            { name: 'Posting Panels', type: 'Action', description: 'Once saved, click the "Post" button on the panel card to send it directly to the selected Discord channel. The button will turn green ("Posted") upon success.' }
          ]}
        />

        <h2 id="automations" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '48px' }}>Role Automations</h2>
        <PropertiesTable 
          properties={[
            { name: 'Sticky Roles', type: 'Toggle', description: 'If a member leaves and rejoins the server, Orbit will automatically restore their previous roles.' },
            { name: 'Booster Role', type: 'Role Assignment', description: 'Select a special role to automatically give to anyone who boosts the server. It is removed if they stop boosting.' },
            { name: 'Auto Roles', type: 'Role Assignment', description: 'Automatically assign specific roles the moment a new user joins the server.' }
          ]}
        />
      </>
    )
  },
  'invites-tracker': {
    title: 'Invites Tracker',
    icon: <GuideIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'rewards', label: 'Invite Rewards' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Track who brings the most people to your server. The Invites tab lets you monitor invite links, identify top inviters, and set up automated rewards.
        </p>
        
        <h2 id="rewards" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Invite Rewards</h2>
        <PropertiesTable 
          properties={[
            { name: 'Milestone Roles', type: 'Configuration', description: 'Automatically grant a role when a user reaches a certain number of successful invites (e.g., 10 invites = "Recruiter" role).' },
            { name: 'Fake Invite Detection', type: 'System', description: 'Orbit detects users trying to game the system using alt accounts (leaves within 5 minutes are penalized).' },
            { name: 'Vanity Tracking', type: 'Metric', description: "Track how many users join specifically through your server's custom vanity URL (if applicable)." }
          ]}
        />
      </>
    )
  },
  'analytics': {
    title: 'Analytics & Leaderboard',
    icon: <ActivityIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'leaderboards', label: 'Leaderboards' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Dive deep into your community's engagement. The Analytics tab provides historical data on messages, joins, and voice activity.
        </p>
        
        <h2 id="leaderboards" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Leaderboards</h2>
        <PropertiesTable 
          properties={[
            { name: 'Message Leaderboard', type: 'Ranking', description: 'See who the most active chatters are in your server.' },
            { name: 'Voice Leaderboard', type: 'Ranking', description: 'Track which users spend the most time in voice channels.' },
            { name: 'Economy Leaderboard', type: 'Ranking', description: 'View the richest members based on their wallet and bank balances.' }
          ]}
        />
      </>
    )
  },
  'settings': {
    title: 'Server Settings',
    icon: <SettingsIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'configuration', label: 'Configuration' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          The Settings tab is where you manage global bot configurations, data privacy, and premium status for your server.
        </p>
        
        <h2 id="configuration" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Configuration</h2>
        <PropertiesTable 
          properties={[
            { name: 'Command Prefix', type: 'Setting', description: 'Change the prefix used for text commands (default is usually `-`). Note: Slash commands `/` are always available.' },
            { name: 'Language', type: 'Setting', description: 'Set the primary language Orbit uses when responding to commands and errors.' },
            { name: 'Data Reset', type: 'Action', description: 'Danger Zone: Allows server owners to permanently delete all Orbit data associated with the server.' }
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
            { name: 'Mass Mentions', type: 'Toggle', description: 'Prevents ghost-pings and mass-pings by limiting the number of allowed mentions per message.' },
            { name: 'Capital Letters', type: 'Toggle', description: 'Deletes messages consisting primarily of ALL CAPS to reduce visual spam.' }
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
            { name: 'Warn', type: 'Punishment', description: "Adds a formal warning to the user's history. Useful for initial infractions." },
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
  security: {
    title: 'Server Security',
    icon: <ShieldIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'anti-nuke', label: 'Anti-Nuke Protection' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Orbit's Security module acts as an impenetrable shield against server nukes, rogue administrators, and massive bot raids. It monitors API events in real-time and acts faster than humanly possible.
        </p>
        
        <h2 id="anti-nuke" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Anti-Nuke Protection</h2>
        <PropertiesTable 
          properties={[
            { name: 'Mass Bans', type: 'Threshold System', description: 'If an admin bans too many users within a few seconds, Orbit will strip their permissions and halt the nuke.' },
            { name: 'Channel Deletions', type: 'Threshold System', description: 'Prevents rogue bots or hijacked staff accounts from wiping your server\'s channels.' },
            { name: 'Anti-Raid (Join Surge)', type: 'Automated Lockdown', description: 'If an abnormal amount of accounts join simultaneously, Orbit temporarily pauses all invites to stop the raid.' },
            { name: 'Whitelist', type: 'Configuration', description: 'You can explicitly whitelist trusted bots (like Dyno or Carl-bot) so their actions are ignored by the Anti-Nuke.' }
          ]}
        />
      </>
    )
  },
  appeals: {
    title: 'Ban Appeals',
    icon: <ShieldCheckIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'setup', label: 'Setup & Usage' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Sometimes mistakes happen, or users reform. The Ban Appeals module allows banned users to submit a formal appeal through a secure web portal linked to your server. Orbit manages the entire pipeline, routing appeals directly to your staff for review.
        </p>

        <h2 id="setup" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Setup & Usage</h2>
        
        <SyntaxBlock 
          title="Appeal Link Format"
          syntax={[
            { text: 'https://', type: 'punct' },
            { text: (import.meta.env.VITE_BASE_URL || '').replace(/^https?:\/\/\/?/, ''), type: 'keyword' },
            { text: '/appeal/', type: 'type' },
            { text: '<your-server-id>', type: 'punct' }
          ]}
        />
        
        <PropertiesTable 
          properties={[
            { name: 'Appeals Channel', type: 'Channel', description: 'The private staff channel where new appeals will be posted as rich embeds.' },
            { name: 'Accepting Appeals', type: 'Action', description: 'Staff can click the green "Accept" button on the appeal embed. Orbit will automatically unban the user and attempt to DM them an invite link.' },
            { name: 'Denying Appeals', type: 'Action', description: 'Staff can click the red "Deny" button to reject the appeal, keeping the ban in place and preventing spam.' }
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
  economy: {
    title: 'Economy System',
    icon: <GiftIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'commands', label: 'Commands & Mechanics' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Engage your community with a fully-fledged, globally persistent Economy System. Members can earn currency, gamble, buy items, and compete on the leaderboards.
        </p>

        <h2 id="commands" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Commands & Mechanics</h2>
        <PropertiesTable 
          properties={[
            { name: '/work', type: 'Earning', description: 'Work a random job every few hours to earn a steady paycheck.' },
            { name: '/daily', type: 'Earning', description: 'Claim a daily reward. Keep your streak alive for massive bonuses.' },
            { name: '/slots & /coinflip', type: 'Gambling', description: 'Risk your hard-earned coins for a chance to double or triple your wealth.' },
            { name: '/rob', type: 'Interaction', description: 'Attempt to steal coins from another user. Fails randomly, resulting in a fine!' },
            { name: '/balance', type: 'Information', description: 'Check your current wallet balance and bank storage.' }
          ]}
        />
      </>
    )
  },
  boost: {
    title: 'Boost Messages',
    icon: <StarIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'customization', label: 'Customization' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Boosting a server is a generous act. The Boost Messages module lets you automatically celebrate these members in a designated channel with custom fanfare.
        </p>

        <h2 id="customization" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Customization</h2>
        <SyntaxBlock 
          title="Example Configuration"
          syntax={[
            { text: 'Thank you ', type: 'text' },
            { text: '{user}', type: 'keyword' },
            { text: ' for boosting ', type: 'text' },
            { text: '{server}', type: 'keyword' },
            { text: '! We are now at ', type: 'text' },
            { text: '{boostcount}', type: 'type' },
            { text: ' boosts.', type: 'text' }
          ]}
        />
        <PropertiesTable 
          properties={[
            { name: 'Boost Channel', type: 'Channel', description: 'The specific channel (e.g., #announcements) where the boost message is posted.' },
            { name: '{boostcount}', type: 'Variable', description: 'Dynamically displays the new total number of server boosts.' },
            { name: '{user} / {server}', type: 'Variable', description: 'Mentions the booster and displays the server name.' }
          ]}
        />
      </>
    )
  },
  serverstats: {
    title: 'Server Stats',
    icon: <ActivityIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'setup', label: 'How it works' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Showcase your community's growth directly in your channel list. The Server Stats module creates locked voice channels that dynamically update their names to reflect live metrics.
        </p>
        
        <h2 id="setup" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>How it works</h2>
        <PropertiesTable 
          properties={[
            { name: 'Total Members', type: 'Metric', description: 'Creates a channel like "📊 Members: 1,402". Updates when users join or leave.' },
            { name: 'Online Members', type: 'Metric', description: 'Creates a channel showing how many users are currently online or idle.' },
            { name: 'Rate Limiting', type: 'Background System', description: 'Orbit intelligently batches updates every 10 minutes to prevent your server from hitting Discord API rate limits.' },
            { name: 'Channel Positioning', type: 'Setup', description: 'You can drag and drop these voice channels anywhere in your server (usually at the very top).' }
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
  automations: {
    title: 'Automations',
    icon: <ZapIcon />,
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          Automations allow you to streamline your server by automatically responding to users, welcoming new members, and setting up honeypots. Select a sub-category on the left to learn more.
        </p>
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
  },
  'automations-autoresponder': {
    title: 'Auto Responder',
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'examples', label: 'Examples & Tips' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          The Auto Responder acts as your server's FAQ bot. It listens for specific trigger words or phrases and instantly replies with pre-configured text, saving your staff hours of answering repetitive questions.
        </p>

        <h2 id="examples" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Examples & Tips</h2>
        <SyntaxBlock 
          title="Common Use Cases"
          syntax={[
            { text: 'Trigger: ', type: 'keyword' },
            { text: 'ip\n', type: 'type' },
            { text: 'Response: ', type: 'keyword' },
            { text: 'You can join our server at play.example.com!\n\n', type: 'text' },
            { text: 'Trigger: ', type: 'keyword' },
            { text: 'support\n', type: 'type' },
            { text: 'Response: ', type: 'keyword' },
            { text: 'Need help? Please open a ticket in the #support channel.', type: 'text' }
          ]}
        />
        
        <PropertiesTable 
          properties={[
            { name: 'Trigger Word', type: 'Input', description: 'The exact phrase or word that triggers the response. It is case-insensitive.' },
            { name: 'Response', type: 'Output', description: "The bot's reply. You can include links and discord formatting (like bolding and italics)." },
            { name: 'Spam Prevention', type: 'System', description: 'Orbit has a built-in cooldown to prevent the auto-responder from spamming the chat if multiple users type the trigger.' }
          ]}
        />
      </>
    )
  },
  'commands-reference': {
    title: 'Commands Reference',
    icon: <BookIcon />,
    toc: [
      { id: 'overview', label: 'Overview' },
      { id: 'general', label: 'General / Utility' },
      { id: 'moderation', label: 'Moderation' },
      { id: 'features', label: 'Feature Commands' }
    ],
    content: (
      <>
        <div id="overview" style={{ position: 'relative', top: '-100px' }}></div>
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
          This page serves as a complete reference for every text and slash command available in Orbit. Most standard commands use the <code>-</code> prefix (configurable), while complex features use Discord's built-in slash commands <code>/</code>.
        </p>

        <h2 id="general" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>General / Utility Commands</h2>
        <PropertiesTable 
          properties={[
            { name: '-help', type: 'Command', description: 'Displays a list of available commands and a link to the dashboard.' },
            { name: '-ping', type: 'Command', description: 'Shows the bot\'s current API latency and response time.' },
            { name: '-userinfo [@user]', type: 'Command', description: 'Fetches details about a specific user (Join date, roles, ID).' },
            { name: '-serverinfo', type: 'Command', description: 'Displays statistics about the current server.' }
          ]}
        />

        <h2 id="moderation" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Moderation Commands</h2>
        <PropertiesTable 
          properties={[
            { name: '-ban [@user] [reason]', type: 'Command', description: 'Permanently bans a user from the server.' },
            { name: '-kick [@user] [reason]', type: 'Command', description: 'Kicks a user from the server.' },
            { name: '-mute [@user] [duration]', type: 'Command', description: 'Timeouts a user for the specified duration (e.g. 10m, 1h).' },
            { name: '-warn [@user] [reason]', type: 'Command', description: 'Issues a formal warning and logs it in their moderation history.' },
            { name: '-purge [amount]', type: 'Command', description: 'Deletes up to 100 recent messages in the current channel.' },
            { name: '-slowmode [duration]', type: 'Command', description: 'Sets a slowmode delay for the current channel.' }
          ]}
        />

        <h2 id="features" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Feature Commands</h2>
        <PropertiesTable 
          properties={[
            { name: '-rank / -leaderboard', type: 'Leveling', description: "View your level card or the server's top chatters." },
            { name: '/work / /daily', type: 'Economy', description: 'Earn daily/hourly currency in the server.' },
            { name: '/ticket <add | remove | close>', type: 'Tickets', description: 'Manage a ticket channel (e.g. add a user or close the ticket).' },
            { name: '-vc_mute / -vc_lock / -vc_move', type: 'Voice', description: 'Moderator voice controls to manage active voice channels.' },
            { name: '-addrole / -removerole', type: 'Roles', description: 'Quickly grant or revoke a role from a user without opening their profile.' }
          ]}
        />

      </>
    )
  }
};

const sidebarConfig = [
  { type: 'group', label: 'Getting Started' },
  { id: 'introduction', icon: <BookIcon /> },
  { id: 'setup', icon: <SettingsIcon />, badge: 'NEW' },
  
  { type: 'group', label: 'Dashboard' },
  { id: 'dashboard-overview', icon: <ActivityIcon /> },
  { id: 'bot-profile', icon: <SettingsIcon /> },
  { id: 'roles-reaction', icon: <ZapIcon /> },
  { id: 'invites-tracker', icon: <GuideIcon /> },
  { id: 'analytics', icon: <ActivityIcon /> },
  { id: 'settings', icon: <SettingsIcon /> },
  
  { type: 'group', label: 'Features' },
  { id: 'automod', icon: <ShieldIcon />, children: ['automod-punishments', 'automod-logs'] },
  { id: 'security', icon: <ShieldIcon /> },
  { id: 'appeals', icon: <ShieldCheckIcon /> },
  { id: 'verification', icon: <ShieldCheckIcon /> },
  { id: 'leveling', icon: <StarIcon /> },
  { id: 'economy', icon: <GiftIcon /> },
  { id: 'boost', icon: <StarIcon /> },
  { id: 'serverstats', icon: <ActivityIcon /> },
  { id: 'tickets', icon: <TicketIcon /> },
  { id: 'temp-voice', icon: <MicIcon /> },
  { id: 'giveaways', icon: <GiftIcon /> },
  { id: 'logs', icon: <ActivityIcon /> },
  { id: 'automations', icon: <ZapIcon />, children: ['automations-welcome', 'automations-goodbye', 'automations-respond', 'automations-autoresponder'] },
  
  { type: 'group', label: 'Reference' },
  { id: 'commands-reference', icon: <BookIcon /> }
];

export default function Docs() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'introduction';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [expanded, setExpanded] = useState({ automod: false, automations: false });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
      if (tab.startsWith('automod-')) setExpanded(p => ({ ...p, automod: true }));
      if (tab.startsWith('automations-')) setExpanded(p => ({ ...p, automations: true }));
    }
  }, [location.search, activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    navigate(`/docs?tab=${key}`, { replace: true });
  };

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const activeContent = docsData[activeTab];

  // Flatten IDs for prev/next logic
  const flatKeys = [];
  sidebarConfig.forEach(item => {
    if (item.id) {
      flatKeys.push(item.id);
      if (item.children) flatKeys.push(...item.children);
    }
  });
  
  const currentIndex = flatKeys.indexOf(activeTab);
  const prevKey = currentIndex > 0 ? flatKeys[currentIndex - 1] : null;
  const nextKey = currentIndex >= 0 && currentIndex < flatKeys.length - 1 ? flatKeys[currentIndex + 1] : null;

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
          {sidebarConfig.map((item, idx) => {
            if (item.type === 'group') {
              return (
                <div key={idx} style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '24px', marginBottom: '8px', paddingLeft: '8px' }}>
                  {item.label}
                </div>
              );
            }
            
            if (item.children) {
              const isExpanded = expanded[item.id];
              return (
                <React.Fragment key={item.id}>
                  <div 
                    className={`docs-nav-item ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleExpand(item.id)}
                    style={{ 
                      background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                      marginBottom: '4px', marginTop: '4px'
                    }}
                  >
                    {item.icon} {docsData[item.id].title}
                    <ChevronDownIcon style={{ marginLeft: 'auto', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.8 }} />
                  </div>
                  {isExpanded && (
                    <div style={{
                      borderLeft: '1px solid rgba(255,255,255,0.08)', marginLeft: '18px', paddingTop: '4px', marginBottom: '16px', display: 'flex', flexDirection: 'column'
                    }}>
                      <div 
                        className={`docs-sub-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(item.id)}
                      >
                        Main
                      </div>
                      {item.children.map(childId => (
                        <div 
                          key={childId}
                          className={`docs-sub-item ${activeTab === childId ? 'active' : ''}`}
                          onClick={() => handleTabChange(childId)}
                        >
                          {docsData[childId].title}
                        </div>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            }

            return (
              <div 
                key={item.id}
                className={`docs-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleTabChange(item.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                  {item.icon} {docsData[item.id].title}
                </div>
                {item.badge && <span className="docs-badge">{item.badge}</span>}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: '48px 64px', maxWidth: '1000px', display: 'flex', flexDirection: 'column' }}>
        {activeContent ? (
          <>
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
          </>
        ) : (
          <div>Document not found.</div>
        )}
      </main>

      {/* Optional Right Sidebar (On this page) */}
      {activeContent && (
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
      )}

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
