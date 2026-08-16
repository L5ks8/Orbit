import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Verify() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch(`/api/verify/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setStatus('error');
        setErrorMsg(data.error);
      } else {
        setStatus('success');
      }
    })
    .catch(err => {
      setStatus('error');
      setErrorMsg('Failed to connect to the server. Please try again later.');
    });
  }, [token]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div className="dash-card settings-card" style={{ padding: '40px', maxWidth: '500px', width: '100%' }}>
        {status === 'verifying' && (
          <>
            <div className="loader" style={{ margin: '0 auto 24px auto', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#5865F2', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Verifying your session...</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Please wait while we confirm your connection.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div style={{ color: '#10B981', marginBottom: '24px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Verification Successful!</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>You have been successfully verified now.</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div style={{ color: '#EF4444', marginBottom: '24px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Verification Failed</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>{errorMsg}</p>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
