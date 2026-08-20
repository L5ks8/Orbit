import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { docsData } from '../../pages/Docs';

export default function SearchModal({ isOpen, onClose }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Simple search logic
  const results = [];
  if (query.trim().length > 0) {
    const q = query.toLowerCase();
    Object.entries(docsData).forEach(([key, data]) => {
      // Check title match
      if (data.title.toLowerCase().includes(q)) {
        results.push({ key, title: data.title, type: 'Page', matchedText: data.title });
      }
      // Check TOC items match
      if (data.toc) {
        data.toc.forEach(t => {
          if (t.label.toLowerCase().includes(q)) {
            results.push({ key, title: data.title, type: 'Section', matchedText: t.label });
          }
        });
      }
    });
  }

  const handleResultClick = (key) => {
    navigate(`/docs?tab=${key}`);
    onClose();
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(3px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '10vh'
    }} onClick={onClose}>
      
      <div 
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#111111',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'fit-content'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <SearchIcon style={{ color: 'rgba(255,255,255,0.4)', marginRight: '12px', width: '16px', height: '16px' }} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flexGrow: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '15px',
              outline: 'none'
            }}
          />
          <div 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.5)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >ESC</div>
        </div>

        {query.trim().length > 0 ? (
          <div style={{ padding: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {results.length > 0 ? (
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Search Results
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {results.map((res, i) => (
                    <div 
                      key={i}
                      className="docs-search-result-item" 
                      onClick={() => handleResultClick(res.key)}
                      style={{ padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ opacity: 0.5 }}>#</span> 
                      <span>{res.title} <span style={{ opacity: 0.5, fontSize: '11px', margin: '0 6px' }}>&rsaquo;</span> {res.matchedText}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                <p style={{ fontSize: '13px' }}>No results found</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: '13px' }}>No recent searches</p>
          </div>
        )}
      </div>

    </div>
  );
}

function SearchIcon({ style }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
}
function ChevronRightIcon({ style }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="9 18 15 12 9 6"></polyline></svg>;
}
