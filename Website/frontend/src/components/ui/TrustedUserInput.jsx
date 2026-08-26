import React, { useState, useEffect } from 'react';

export default function TrustedUserInput({ value, onChange }) {
  const [inputValue, setInputValue] = useState('');
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState({});

  // value is a comma-separated string of user IDs
  const userIds = (value || '').split(',').map(id => id.trim()).filter(id => id.length > 0);

  useEffect(() => {
    userIds.forEach(id => {
      if (!userData[id] && !loading[id]) {
        fetchUserData(id);
      }
    });
  }, [value]);

  const fetchUserData = async (id) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/user/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(prev => ({ ...prev, [id]: data }));
      } else {
        setUserData(prev => ({ ...prev, [id]: { id, name: 'Unknown User', global_name: 'Unknown User' } }));
      }
    } catch (e) {
      setUserData(prev => ({ ...prev, [id]: { id, name: 'Unknown User', global_name: 'Unknown User' } }));
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const commitInput = () => {
    if (!inputValue.trim()) return;
    
    // Split by comma, space, or newline to allow pasting multiple IDs
    const rawIds = inputValue.split(/[\s,]+/);
    const validNewIds = rawIds
      .map(id => id.trim())
      .filter(id => id.length >= 15 && /^\d+$/.test(id)) // basic Discord ID validation
      .filter(id => !userIds.includes(id));
      
    if (validNewIds.length > 0) {
      const newIds = [...userIds, ...validNewIds];
      onChange(newIds.join(','));
    }
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitInput();
    }
  };

  const handleRemove = (idToRemove) => {
    const newIds = userIds.filter(id => id !== idToRemove);
    onChange(newIds.join(','));
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 min-h-[42px] px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text transition-colors focus-within:border-neutral-500 focus-within:ring-2 focus-within:ring-white/10">
        <input
          type="text"
          placeholder="Paste User IDs here..."
          className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitInput}
        />
      </div>

      {userIds.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {userIds.map(id => {
            const user = userData[id];
            const isLoading = loading[id] || !user;

            return (
              <div key={id} className="flex items-center justify-between p-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 overflow-hidden shrink-0">
                    {isLoading ? (
                      <div className="w-full h-full animate-pulse bg-neutral-600" />
                    ) : user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white font-medium text-xs">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-white truncate">
                      {isLoading ? 'Loading...' : (user.global_name || user.name)}
                    </span>
                    <span className="text-xs text-neutral-500 truncate">
                      {id}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(id)}
                  className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  title="Remove User"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
