import React from 'react';
import LegalLayout from '../components/ui/LegalLayout';

export default function Privacy() {
  const sections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'who', title: 'Who We Are' },
    { id: 'collect', title: 'What Data We Collect' },
    { id: 'usage', title: 'How We Use Your Data' },
    { id: 'verifications', title: 'Data Use During Verifications' },
    { id: 'search', title: 'Search System' },
    { id: 'ads', title: 'Advertisements' },
    { id: 'gdpr', title: 'Your Rights Under GDPR' },
    { id: 'retention', title: 'Data Retention' },
    { id: 'security', title: 'Security' },
  ];

  return (
    <LegalLayout 
      title="Privacy Policy" 
      lastUpdated="August 2026" 
      sections={sections}
    >
      <p>Orbit legal terms and commitment to keep your data safe.</p>
      <p>At Orbit, your privacy is a priority. We collect only the minimal personal data necessary (primarily your IP address) to detect alternate accounts and ensure server security. All data is automatically processed, encrypted, and never viewed by humans. We do not sell or share your stored personal data. You can request access to or deletion of your personal information at any time via our <a href="https://discord.gg/wekuhwCsUg" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)'}}>Discord support server</a>. This policy outlines what data we collect, how it's used, and your rights under GDPR.</p>

      <h2 id="intro">Introduction</h2>
      <p>We are committed to safeguarding your privacy and handling your data transparently and responsibly. This Privacy Policy explains what personal data we collect, how it is used, and your rights under applicable laws, including the General Data Protection Regulation (GDPR).</p>
      <p>This policy applies to your use of:</p>
      <ul>
        <li>The Orbit Discord bot</li>
        <li>The Orbit web portal</li>
        <li>Any related services provided by the Orbit Team</li>
      </ul>
      <p>We may update this policy as needed to reflect changes in technology, law, or business practices. If any significant changes are made, we will notify you and seek consent where required.</p>

      <h2 id="who">Who We Are</h2>
      <p>Orbit is a service operated by the Orbit Development Team, dedicated to securing and managing Discord communities.</p>

      <h2 id="collect">What Data We Collect</h2>
      <p>When you interact with the Orbit bot:</p>
      <ul>
        <li><strong>Discord User ID:</strong> Collected when you click the verification link.</li>
        <li><strong>IP Address:</strong> Collected when you click the verification link. Linked to your Discord ID (not your username). Used solely for detecting alternate accounts (fraud prevention).</li>
        <li><strong>Browser/User-Agent Information:</strong> Temporarily cached for anti-abuse purposes. This data is not personally identifying on its own and is deleted automatically.</li>
        <li><strong>Administrative Events:</strong> Auto-mod actions, bans, kicks, etc. Collected for moderation and server integrity. Not linked to personal data such as IPs or emails.</li>
      </ul>
      <p>When using our web portal:</p>
      <ul>
        <li><strong>Cookie Information:</strong> A session cookie is set to link your web browser to your Discord account for verification purposes.</li>
      </ul>

      <h2 id="usage">How We Use Your Data</h2>
      <p>We process your data under the legal basis of Legitimate Interests (Article 6(1)(f), GDPR), specifically for:</p>
      <ul>
        <li>Detecting alternate (fraudulent) accounts</li>
        <li>Preventing abuse and ban evasion</li>
        <li>Supporting community moderation and integrity</li>
      </ul>
      <p>We do not sell or share your IP address with third parties.</p>
      <p>All personal data processed by Orbit is automatically handled by automated systems and encrypted. Your Discord user ID is encrypted internally within our detection systems to protect against unauthorized access. Please note that Discord user IDs are publicly accessible through the Discord API.</p>

      <h2 id="verifications">Data Use During Verifications</h2>
      <p>When a user attempts to verify through a server using Orbit, the system may determine that the account is associated with previously flagged accounts. In these cases, a log message is sent to the server to inform moderators. This message includes the Discord usernames and user IDs of both the user attempting to verify and the associated accounts. This data is shared only with the server using the bot at the time of the verification request.</p>

      <h2 id="search">Search System & Lens</h2>
      <p>We offer advanced tools that allow administrators to search for Discord user IDs to identify potential alternate accounts. These associations are based on technical signals and are used to support moderation. We do not display sensitive data such as IP addresses or device fingerprints, only public Discord user IDs and the associated match likelihood. You may opt out of visibility by contacting our support server or using the /privacy command.</p>

      <h2 id="ads">Advertisements on the Verification page</h2>
      <p>This website may use third-party advertising services to manage interest-based advertising. These services may employ a variety of technologies, including cookies, to serve content and display advertisements. Disabling cookies may limit access to certain features. We do not directly sell your personal data to advertisers.</p>

      <h2 id="gdpr">Your Rights Under GDPR</h2>
      <p>As a data subject under the GDPR, you have the right to:</p>
      <ol>
        <li><strong>Right of Access (Article 15):</strong> Request confirmation of whether we process your data and receive a copy.</li>
        <li><strong>Right to Rectification (Article 16):</strong> Correct inaccurate data where feasible.</li>
        <li><strong>Right to Erasure (Article 17):</strong> Request deletion of your personal data ("right to be forgotten").</li>
        <li><strong>Right to Restrict Processing (Article 18):</strong> Prevent further data processing by leaving servers using Orbit.</li>
        <li><strong>Right to Data Portability (Article 20):</strong> Request a copy of your personal data in a machine-readable format.</li>
        <li><strong>Right to Object (Article 21):</strong> Object to processing based on legitimate interests.</li>
        <li><strong>Right Not to Be Subject to Automated Decision-Making (Article 22):</strong> Request manual review of automated decisions.</li>
      </ol>
      <p>If you have questions or concerns, please join our <a href="https://discord.gg/wekuhwCsUg" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)'}}>Support Server</a>.</p>

      <h2 id="retention">Data Retention</h2>
      <p>IP Addresses and Alternate Account association data is retained for up to 24 months from the most recent detection or verification attempt. This retention period supports the system's ability to detect long-term abuse patterns. After 24 months of inactivity, the data is securely deleted.</p>

      <h2 id="security">Security</h2>
      <p>All data is stored securely and encrypted in transit and at rest. Access is restricted to authorized system processes. No human can view your stored private data.</p>
      <p>While we encrypt your Discord user ID internally, we cannot control its visibility on Discord itself. When your verification result is sent to a server, your Discord ID and username may be visible to server moderators.</p>
    </LegalLayout>
  );
}
