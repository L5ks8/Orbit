import React from 'react';

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', minHeight: '300px', background: 'transparent', color: '#949ba4' }}>
      <div className="ios-spinner-container">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="ios-spinner-blade" 
            style={{ 
              transform: `rotate(${i * 30}deg)`, 
              animationDelay: `${(i - 12) / 12}s` 
            }} 
          />
        ))}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '20px', letterSpacing: '0.5px' }}>{message}</div>
      <style>{`
        .ios-spinner-container {
          position: relative;
          width: 44px;
          height: 44px;
        }
        .ios-spinner-blade {
          position: absolute;
          left: 46%;
          top: 0;
          width: 8%;
          height: 26%;
          background: #fff;
          border-radius: 10px;
          transform-origin: 50% 192%;
          animation: ios-spinner-fade 1.2s linear infinite;
        }
        @keyframes ios-spinner-fade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
