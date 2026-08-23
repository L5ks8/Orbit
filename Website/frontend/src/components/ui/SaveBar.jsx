import React, { useEffect, useState } from 'react';

export default function SaveBar({ show, onReset, onSave, saving }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300); // fade out duration
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible && !show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: show ? '24px' : '-100px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'fit-content',
      minWidth: '400px',
      background: '#111214',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '10px 16px 10px 20px',
      gap: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      transition: 'bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      <span style={{ color: '#fff', fontWeight: '500', fontSize: '14px' }}>Careful — you have unsaved changes!</span>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button 
          onClick={onReset} 
          disabled={saving} 
          style={{ 
            background: 'transparent', 
            color: '#fff', 
            border: 'none', 
            cursor: saving ? 'not-allowed' : 'pointer', 
            fontWeight: '500',
            fontSize: '14px',
            opacity: saving ? 0.5 : 1
          }}
          className="dash-text-btn"
        >
          Reset
        </button>
        <button 
          onClick={onSave} 
          disabled={saving} 
          className="dash-btn primary"
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
