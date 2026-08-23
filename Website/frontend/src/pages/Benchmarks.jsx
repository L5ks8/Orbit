import React from 'react';
import LegalLayout from '../components/ui/LegalLayout';

export default function Benchmarks() {
  const sections = [
    { id: 'latency', title: '1. Latency & Response Times' },
    { id: 'throughput', title: '2. API Throughput' },
  ];

  return (
    <LegalLayout 
      title="Benchmarks & Performance" 
      lastUpdated="August 2026" 
      sections={sections}
    >
      <h2 id="latency">1. Latency & Response Times</h2>
      <p>Orbit is designed from the ground up to be blazingly fast. Powered by asynchronous Python and highly optimized database queries, our average command latency is under 50ms.</p>
      
      <p>Compared to other major bots, Orbit consistently ranks in the top tier for response times, ensuring your community never has to wait for an interaction.</p>

      <h2 id="throughput">2. API Throughput</h2>
      <p>The Orbit web dashboard and API handle thousands of requests per second with ease. Our microservices architecture scales horizontally automatically to meet demand during peak hours.</p>

      <p>More detailed charts and performance graphs will be published here soon.</p>
    </LegalLayout>
  );
}
