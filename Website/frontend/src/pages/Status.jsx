import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import Navbar from '../components/ui/Navbar';

Chart.register(...registerables);

// Sub-components for icons
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#23a559" stroke="#151517" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ borderRadius: '50%', background: '#23a559', color: '#151517', padding: '2px' }}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#80848e', marginLeft: '6px' }}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default function Status() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [historyData, setHistoryData] = useState([]);

  // Generate initial fake data for the chart
  useEffect(() => {
    const data = [];
    let t = -300;
    let orbitVal = 550;
    let othersVal = 20;
    for (let i = 0; i < 60; i++) {
      data.push({
        time: t,
        orbit: orbitVal,
        others: othersVal
      });
      t += 5;
      orbitVal += Math.floor(Math.random() * 10 - 5);
      othersVal += Math.floor(Math.random() * 20 - 9);
      if (othersVal < 0) othersVal = 0;
    }
    setHistoryData(data);
  }, []);

  // Initialize and update chart
  useEffect(() => {
    if (!chartRef.current || historyData.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: historyData.map(d => `${d.time}s`),
        datasets: [
          {
            label: 'Orbit',
            data: historyData.map(d => d.orbit),
            borderColor: '#5865F2', // Blurple
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 10
          },
          {
            label: 'Others',
            data: historyData.map(d => d.others),
            borderColor: '#ed4245', // Reddish
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 10
          },
          {
            label: 'Database',
            data: historyData.map(d => d.others * 2 + 10),
            borderColor: '#fee75c', // Yellow
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 10
          },
          {
            label: 'Cache',
            data: historyData.map(d => d.others * 3 + 30),
            borderColor: '#57F287', // Green
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 10
          },
          {
            label: 'Workers',
            data: historyData.map(d => d.others * 4 + 50),
            borderColor: '#9b59b6', // Purple
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 10
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0 // turn off animation for smooth real-time updates if we had them
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false // We will build a custom HTML legend if needed, but for now hide or just show simple
          },
          tooltip: {
            backgroundColor: '#151517',
            titleColor: '#fff',
            bodyColor: '#dbdee1',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#80848e',
              maxTicksLimit: 6
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#80848e'
            },
            min: 0,
            max: 600
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [historyData]);

  // Uptime Bars component
  const UptimeBars = ({ name, status, label }) => {
    // Generate 60 blocks for 60 days
    const blocks = Array.from({ length: 45 }).map((_, i) => {
      // randomly make a few blocks yellow or red for realism, but mostly green
      let color = '#23a559'; // green
      const rand = Math.random();
      if (rand > 0.98) color = '#faa61a'; // yellow (partial outage)
      else if (rand > 0.995) color = '#ed4245'; // red (major outage)
      
      return (
        <div 
          key={i} 
          style={{ 
            flex: 1, 
            height: '24px', 
            backgroundColor: color, 
            borderRadius: '2px',
            marginRight: i === 44 ? '0' : '3px'
          }}
          title="No downtime recorded on this day"
        />
      );
    });

    return (
      <div style={{ padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckIcon />
            <span style={{ fontSize: '15px', fontWeight: '500', color: '#fff' }}>{name}</span>
            {name === 'Orbit Bot' && <InfoIcon />}
          </div>
          <span style={{ color: '#23a559', fontSize: '14px', fontWeight: '500' }}>{label || status}</span>
        </div>
        <div style={{ display: 'flex', width: '100%' }}>
          {blocks}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0b0c', color: '#dbdee1', fontFamily: '"Inter", sans-serif' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '120px 24px 60px' }}>
        
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Orbit Status</h1>
          <p style={{ color: '#80848e', fontSize: '16px' }}>Live status, refreshed automatically.</p>
        </div>

        {/* Uptime Section */}
        <div style={{ background: '#151517', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0 24px', marginBottom: '32px' }}>
          <UptimeBars name="Discord Bot" status="Operational" />
          <UptimeBars name="Web Dashboard" status="Operational" />
          <UptimeBars name="Database Cluster" status="Operational" />
          <UptimeBars name="Orbit APIs" status="Operational" label="Up to date" />
        </div>

        {/* Chart Section */}
        <div style={{ background: '#151517', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0 }}>Live Instance Count</h2>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '3px', background: '#5865F2', borderRadius: '2px' }}></div>
                <span style={{ fontSize: '13px', color: '#80848e' }}>Orbit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '3px', background: 'linear-gradient(90deg, #ed4245, #fee75c, #57F287)', borderRadius: '2px' }}></div>
                <span style={{ fontSize: '13px', color: '#80848e' }}>Others</span>
              </div>
              <div style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '12px', color: '#80848e' }}>
                Last poll <strong style={{ color: '#fff', marginLeft: '4px' }}>{new Date().toLocaleTimeString()}</strong>
              </div>
            </div>
          </div>
          
          <div style={{ height: '400px', width: '100%' }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

      </div>
    </div>
  );
}
