import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EmbedBuilderEditor from './EmbedBuilderEditor';

export default function EmbedBuilder({ setSidebarOpen, sidebarOpen }) {
  const { guildId } = useParams();
  
  const [embeds, setEmbeds] = useState([]);
  const [search, setSearch] = useState('');
  const [activeEmbed, setActiveEmbed] = useState(null); // null = list view
  const [loading, setLoading] = useState(true);
  
  const [menuOpenId, setMenuOpenId] = useState(null);
  
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [embedToRename, setEmbedToRename] = useState(null);
  const [renameInput, setRenameInput] = useState('');
  
  const fetchEmbeds = async () => {
    try {
      const res = await fetch(`/api/action/saved_embeds/${guildId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (!data.error) {
        setEmbeds(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmbeds();
  }, [guildId]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => setMenuOpenId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleSave = async (embedData, isClosing = false) => {
    try {
      const res = await fetch(`/api/action/saved_embeds/${guildId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(embedData)
      });
      const data = await res.json();
      if (data.success) {
        if (!embedData.id) {
          embedData.id = data.id; // update local ID if it was new
        }
        // Update local state without fetching again to prevent lag
        setEmbeds(prev => {
          const exists = prev.find(e => e.id === embedData.id);
          if (exists) {
            return prev.map(e => e.id === embedData.id ? embedData : e);
          } else {
            return [...prev, embedData];
          }
        });
        if (isClosing && setSidebarOpen) {
          setSidebarOpen(true);
        }
      }
    } catch (e) {
      console.error("Failed to auto-save:", e);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await fetch(`/api/action/saved_embeds/${guildId}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEmbeds(prev => prev.filter(emb => emb.id !== id));
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleRenameClick = (e, embed) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setEmbedToRename(embed);
    setRenameInput(embed.name || '');
    setRenameModalOpen(true);
  };
  
  const confirmRename = async () => {
    if (!embedToRename) return;
    const newName = renameInput.trim();
    if (!newName || newName === embedToRename.name) {
      setRenameModalOpen(false);
      return;
    }
    
    const updated = { ...embedToRename, name: newName };
    await handleSave(updated, false);
    setRenameModalOpen(false);
  };

  const handleCreateNew = () => {
    setActiveEmbed({});
  };

  const filteredEmbeds = embeds.filter(e => e.name?.toLowerCase().includes(search.toLowerCase()));

  if (activeEmbed !== null) {
    return (
      <EmbedBuilderEditor 
        setSidebarOpen={setSidebarOpen} 
        initialEmbed={activeEmbed}
        onBack={() => setActiveEmbed(null)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#f2f3f5', marginBottom: '32px' }}>Messages</h1>
      
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f3f5', marginBottom: '12px' }}>Search Messages</h3>
        <input 
          type="text" 
          placeholder="Search for a message..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '14px 16px', 
            background: 'rgba(0,0,0,0.2)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            borderRadius: '8px', 
            color: '#dbdee1',
            fontSize: '15px'
          }}
        />
      </div>

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f3f5', marginBottom: '16px' }}>Messages</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          
          {/* Create New Card */}
          <div 
            onClick={handleCreateNew}
            style={{ 
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              color: '#dbdee1',
              fontWeight: 500,
              transition: 'background 0.2s',
              minHeight: '80px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create a message
          </div>

          {/* Saved Messages Cards */}
          {loading ? (
            <div style={{ color: '#949ba4', display: 'flex', alignItems: 'center' }}>Loading messages...</div>
          ) : (
            filteredEmbeds.map(emb => (
              <div 
                key={emb.id}
                onClick={() => setActiveEmbed(emb)}
                style={{ 
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                  minHeight: '80px'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#949ba4' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                  <span style={{ color: '#f2f3f5', fontWeight: 500 }}>{emb.name || 'Unnamed message'}</span>
                </div>
                
                {/* 3-dots Menu */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === emb.id ? null : emb.id);
                  }}
                  style={{ padding: '8px', cursor: 'pointer', color: '#949ba4', borderRadius: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  
                  {menuOpenId === emb.id && (
                    <div style={{
                      position: 'absolute',
                      top: '60px',
                      right: '20px',
                      background: '#2b2d31',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      zIndex: 10,
                      minWidth: '150px',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }}>
                      <div 
                        onClick={() => setActiveEmbed(emb)}
                        style={{ padding: '8px 12px', color: '#dbdee1', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#383a40'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit
                      </div>
                      <div 
                        onClick={(e) => handleRenameClick(e, emb)}
                        style={{ padding: '8px 12px', color: '#dbdee1', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#383a40'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        Rename
                      </div>
                      <div 
                        onClick={(e) => handleDelete(e, emb.id)}
                        style={{ padding: '8px 12px', color: '#ef4444', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
        </div>
      </div>
      
      {/* Rename Modal */}
      {renameModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#2b2d31',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f2f3f5', marginBottom: '16px' }}>Rename Message</h2>
            <input 
              autoFocus
              type="text" 
              value={renameInput}
              onChange={e => setRenameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmRename()}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#1e1f22',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '6px',
                color: '#dbdee1',
                fontSize: '15px',
                marginBottom: '24px',
                outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#5865F2'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setRenameModalOpen(false)}
                style={{
                  background: 'transparent', color: '#dbdee1', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500
                }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Cancel
              </button>
              <button 
                onClick={confirmRename}
                style={{
                  background: '#5865F2', color: '#fff', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500, transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#4752c4'}
                onMouseLeave={e => e.currentTarget.style.background = '#5865F2'}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
