import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ServerSelector() {
  const { user, loading } = useAuth();
  const [guilds, setGuilds] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/guilds')
        .then(res => res.json())
        .then(data => {
          if (data && data.guilds) {
            setGuilds(data.guilds);
          }
        })
        .finally(() => setFetching(false));
    } else {
      setFetching(false);
    }
  }, [user]);

  if (loading) return <div style={{padding: '50px', textAlign: 'center', color: '#fff'}}>Loading...</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Select a Server</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Choose a server to configure Orbit.</p>
      
      {fetching ? (
        <div>Loading your servers...</div>
      ) : (
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {guilds.map(guild => (
            <Link 
              key={guild.id} 
              to={`/dashboard/${guild.id}/overview`}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                background: 'var(--bg-secondary)', 
                padding: '16px', 
                borderRadius: '12px', 
                textDecoration: 'none', 
                color: '#fff',
                border: '1px solid var(--border)'
              }}
            >
              {guild.icon ? (
                <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} alt={guild.name} style={{width: '48px', height: '48px', borderRadius: '50%'}} />
              ) : (
                <div style={{width: '48px', height: '48px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>{guild.name.charAt(0)}</div>
              )}
              <div style={{ fontWeight: '500' }}>{guild.name}</div>
            </Link>
          ))}
          {guilds.length === 0 && (
            <div style={{ color: 'var(--text-muted)' }}>No servers found where you have admin permissions.</div>
          )}
        </div>
      )}
    </div>
  );
}
