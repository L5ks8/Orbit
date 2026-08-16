import React from 'react';
import LegalLayout from '../components/ui/LegalLayout';

export default function Status() {
  const sections = [
    { id: 'uptime', title: '1. Uptime' },
    { id: 'incidents', title: '2. Past Incidents' },
  ];

  return (
    <LegalLayout 
      title="System Status" 
      lastUpdated="All Systems Operational" 
      sections={sections}
    >
      <h2 id="uptime">1. Uptime</h2>
      <p>Orbit is currently operating normally with a 99.99% uptime over the last 30 days. Both the Discord Bot and Web Dashboard services are healthy.</p>
      
      <p>If you are experiencing issues, please verify that Discord itself is not experiencing an outage.</p>

      <h2 id="incidents">2. Past Incidents</h2>
      <p>There have been no major incidents in the past 90 days.</p>

    </LegalLayout>
  );
}
