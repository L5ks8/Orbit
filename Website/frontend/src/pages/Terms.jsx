import React from 'react';
import LegalLayout from '../components/ui/LegalLayout';

export default function Terms() {
  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'usage', title: '2. Usage Restrictions' },
    { id: 'availability', title: '3. Service Availability' },
    { id: 'modifications', title: '4. Modifications' },
  ];

  return (
    <LegalLayout 
      title="Terms of Service" 
      lastUpdated="August 2026" 
      sections={sections}
    >
      <h2 id="acceptance">1. Acceptance of Terms</h2>
      <p>By inviting Orbit to your Discord server or logging into our Web Dashboard, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the bot.</p>
      
      <p>These terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and Orbit, concerning your access to and use of the Orbit Discord Bot and the associated website and dashboard.</p>

      <h2 id="usage">2. Usage Restrictions</h2>
      <p>You agree not to use Orbit to violate Discord's Terms of Service, distribute malicious content, or engage in targeted harassment. Any abuse of our systems may result in a permanent ban from our services.</p>
      
      <p>Furthermore, you agree not to reverse engineer, decompile, or disassemble any part of the Orbit bot or dashboard, nor attempt to bypass any rate limits or security measures we have put in place to ensure the stability of the platform.</p>

      <h2 id="availability">3. Service Availability</h2>
      <p>While we strive for 99.9% uptime, Orbit is provided "as is" without warranties of any kind. We are not responsible for any issues resulting from bot downtime or data loss.</p>
      
      <p>We reserve the right to temporarily suspend the bot or dashboard for maintenance, upgrades, or to resolve critical bugs. In such events, we will make reasonable efforts to announce the downtime in advance in our Support Server.</p>

      <h2 id="modifications">4. Modifications</h2>
      <p>We reserve the right to modify or discontinue any part of the service with or without notice. Changes to these terms will be communicated in our Support Server.</p>
      
      <p>Your continued use of Orbit after any such changes constitutes your acceptance of the new Terms of Service. It is your responsibility to review these terms periodically for updates.</p>
    </LegalLayout>
  );
}
