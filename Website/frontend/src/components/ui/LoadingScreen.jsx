import React from 'react';

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', minHeight: '300px', background: 'transparent', color: '#949ba4' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#5865F2', animation: 'orbit-spin 1s linear infinite', marginBottom: '16px' }}></div>
      <div style={{ fontSize: '15px', fontWeight: 500 }}>{message}</div>
      <style>{`@keyframes orbit-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
