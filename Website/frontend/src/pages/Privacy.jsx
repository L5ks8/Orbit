import React from 'react';
import LegalLayout from '../components/ui/LegalLayout';

export default function Privacy() {
  const sections = [
    { id: 'collection', title: '1. Information We Collect' },
    { id: 'usage', title: '2. How We Use Information' },
    { id: 'retention', title: '3. Data Retention' },
    { id: 'rights', title: '4. Your Rights' },
  ];

  return (
    <LegalLayout 
      title="Privacy Policy" 
      lastUpdated="August 2026" 
      sections={sections}
    >
      <h2 id="collection">1. Information We Collect</h2>
      <p>Orbit collects minimal information necessary to function properly as a Discord bot. This includes server IDs, user IDs, channel IDs, and message content when explicitly required for moderation or logging purposes as configured by the server administrators.</p>
      <p>We do not collect personally identifiable information such as names, addresses, or email addresses unless you explicitly provide them to us (for example, through billing for premium features).</p>

      <h2 id="usage">2. How We Use Information</h2>
      <p>We use the collected information solely for providing the core functionalities of Orbit, such as auto-moderation, leveling, and logging. We do not sell, rent, or share your data with third parties.</p>
      <p>In cases of critical errors, anonymous crash reports and stack traces may be collected to help our developers fix bugs and improve the overall stability of the bot.</p>

      <h2 id="retention">3. Data Retention</h2>
      <p>Data is kept as long as the bot is present in your server. If you kick the bot, all associated server configurations and logs are scheduled for deletion within 30 days.</p>
      <p>Individual user data, such as warning history or level progression, can be wiped upon request by server administrators using the built-in commands.</p>

      <h2 id="rights">4. Your Rights</h2>
      <p>Under GDPR, CCPA, and other applicable data protection laws, you have the right to request access to or deletion of your personal data. To exercise these rights, please join our <a href="https://discord.gg/wekuhwCsUg" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)', textDecoration: 'none'}}>Support Server</a> and open a ticket.</p>
      <p>We will respond to all data requests within 30 days of receipt, free of charge, unless the request is manifestly unfounded or excessive.</p>
    </LegalLayout>
  );
}
