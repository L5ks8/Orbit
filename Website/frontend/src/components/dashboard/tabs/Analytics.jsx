import LoadingScreen from "../../ui/LoadingScreen";
import React from 'react';

export default function ({ serverData, setServerData }) {
  return (
    <div style={{ padding: '32px', color: '#a3a3a3', textAlign: 'center' }}>
      <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Analytics</h2>
      <p>Data will appear here once tracking has started.</p>
    </div>
  );
}
