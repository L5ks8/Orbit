import React from 'react';
import LegalLayout from '../components/ui/LegalLayout';

export default function Terms() {
  const sections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'identity', title: 'Identity and Contact' },
    { id: 'service', title: 'Service Description' },
    { id: 'obligations', title: 'User Obligations' },
    { id: 'sanctions', title: 'Sanctions and Enforcement' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'contact', title: 'Contact Us' },
  ];

  return (
    <LegalLayout 
      title="Terms of Service" 
      lastUpdated="August 2026" 
      sections={sections}
    >
      <h2 id="intro">Introduction</h2>
      <p>Before you begin using Orbit (“Bot”, “Service”), it is essential to understand and agree to these Terms of Service ("ToS", "Terms"). By adding, accessing, or using our Bot, you hereby comply with and are bound by these Terms.</p>
      <p>The use of Orbit is subject to these legally binding ToS, and by utilizing our Bot, you agree to adhere to them. If you disagree with any part of the ToS, you must refrain from accessing or using the Bot.</p>
      <p>We reserve the right to modify these ToS at our sole discretion, without any personal notice. Any changes to the ToS will be updated on this page. Your continued use of the Bot post-modification constitutes your acceptance of the revised terms.</p>

      <h2 id="identity">Identity and Contact</h2>
      <p>Orbit is operated by the Orbit Development Team. For inquiries regarding the service, please reach out via our Support Server.</p>

      <h2 id="service">Service Description</h2>
      <p>Orbit provides Discord servers with the ability to verify their joining members and check for the existence of alternate and/or automated accounts, thereby mitigating spam and potential misuse. We strive to offer consistent and high-quality services.</p>
      <p>Please check the <a href="/privacy" style={{color: 'var(--primary)'}}>Privacy Policy</a> for details around how data is collected and processed.</p>

      <h2 id="obligations">User Obligations</h2>
      <p>By using Orbit, you agree not to:</p>
      <ul>
        <li>Breach Discord's Terms of Service: <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)'}}>https://discord.com/terms</a></li>
        <li>Try to abuse any Orbit systems, included but not limited to: bot, website, servers...</li>
        <li>Violate intellectual property and copyrights and/or using Orbit's branding for scam purposes</li>
        <li>Use and exploit Orbit to attempt "doxxing" another user's account or revealing their personal information</li>
      </ul>

      <h2 id="sanctions">Sanctions and Enforcement Actions</h2>
      <p>Should users violate the stipulations laid out in these Terms of Service, we reserve the right to undertake one or more of the following enforcement actions:</p>
      <ul>
        <li><strong>Warning:</strong> issuance of a formal warning requesting immediate compliance with ToS</li>
        <li><strong>Immediate termination:</strong> in case of more severe violations, we reserve the right to terminate the service at our sole discretion without prior notice. This includes, but is not limited to, removing the bot from the targeted server and/or wiping all associated data about the server and its members from our systems.</li>
        <li><strong>Report to Discord:</strong> when needed, we will file a report to Discord's Trust & Safety Team so they can take appropriate action</li>
        <li><strong>Legal action:</strong> should we deem the breach is impacting our image or finances in a consequential manner, we reserve the right to pursue legal action.</li>
      </ul>

      <h2 id="liability">Limitation of Liability</h2>
      <p>To the fullest extent permitted by applicable law, Orbit shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of, or inability to access or use, the Bot.</p>

      <h2 id="contact">Contact Us</h2>
      <p>For any inquiries, comments, or concerns regarding these ToS, please contact us at our <a href="https://discord.gg/wekuhwCsUg" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)'}}>Discord Support Server</a>.</p>
    </LegalLayout>
  );
}
