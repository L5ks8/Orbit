import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EmbedBuilderEditor from './EmbedBuilderEditor';

export default function EmbedBuilder({ setSidebarOpen, sidebarOpen }) {
  const { guildId } = useParams();
  
  const [embeds, setEmbeds] = useState([]);
  const [search, setSearch] = useState('');
  const [activeEmbed, setActiveEmbed] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [menuOpenId, setMenuOpenId] = useState(null);
  
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [embedToRename, setEmbedToRename] = useState(null);
  const [renameInput, setRenameInput] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [embedToDelete, setEmbedToDelete] = useState(null);
  
  const [toastMsg, setToastMsg] = useState('');
  
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
          embedData.id = data.id;
        }
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

  const handleDeleteClick = (e, embed) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setEmbedToDelete(embed);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!embedToDelete) return;
    
    try {
      await fetch(`/api/action/saved_embeds/${guildId}/${embedToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEmbeds(prev => prev.filter(emb => emb.id !== embedToDelete.id));
      setToastMsg('Message deleted successfully.');
      setTimeout(() => setToastMsg(''), 4000);
    } catch (e) {
      console.error(e);
      setToastMsg('Error: Failed to delete message');
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setDeleteModalOpen(false);
      setEmbedToDelete(null);
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

  if (loading) {
    return (
      <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-9 h-9 border-2 border-neutral-800 border-t-white rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-neutral-400">Loading messages...</p>
      </main>
    );
  }

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
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-6 font-sans">
      {/* Header bar matching dashboard tabs */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </span>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">
              Message Builder
            </h1>
            <p className="text-xs text-neutral-500">
              Create, design and send rich custom embeds directly to your Discord server.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="px-3.5 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Message
        </button>
      </div>

      {/* Search Input Container */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search saved messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-neutral-800/80 hover:bg-neutral-800 focus:bg-neutral-800 border border-neutral-700/80 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-white/10 transition-all"
          />
        </div>
      </div>

      {/* Messages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Create Card */}
        <div
          onClick={handleCreateNew}
          className="group rounded-2xl border border-dashed border-neutral-800 hover:border-neutral-600 bg-neutral-900/40 hover:bg-neutral-800/40 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-2.5 min-h-[110px]"
        >
          <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 group-hover:border-neutral-600 flex items-center justify-center text-neutral-400 group-hover:text-white transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors">
            Create a new message
          </span>
        </div>

        {/* Saved Cards */}
        {filteredEmbeds.map(emb => (
          <div
            key={emb.id}
            onClick={() => setActiveEmbed(emb)}
            className="group relative rounded-2xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] p-5 flex items-center justify-between cursor-pointer transition-all min-h-[110px]"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-3">
              <div 
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border border-neutral-800 shadow-sm"
                style={{ backgroundColor: emb.color || '#262626' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white drop-shadow"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate group-hover:text-neutral-100 transition-colors">
                  {emb.name || 'Unnamed message'}
                </h3>
                <p className="text-xs text-neutral-500 truncate mt-0.5">
                  {emb.title ? emb.title : (emb.description ? emb.description.slice(0, 35) + '...' : 'Custom Embed')}
                </p>
              </div>
            </div>

            {/* 3-dots Menu Button */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === emb.id ? null : emb.id);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>

              {menuOpenId === emb.id && (
                <div
                  onClick={e => e.stopPropagation()}
                  className="absolute right-0 top-9 z-30 min-w-[150px] p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_40px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-1"
                >
                  <button
                    type="button"
                    onClick={() => setActiveEmbed(emb)}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleRenameClick(e, emb)}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Rename
                  </button>
                  <div className="h-px bg-neutral-800 my-0.5" />
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(e, emb)}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rename Modal */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-semibold text-white">Rename Message</h2>
            <input
              autoFocus
              type="text"
              value={renameInput}
              onChange={e => setRenameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmRename()}
              placeholder="Message name..."
              className="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-white/10"
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRenameModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRename}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-[0.98]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-semibold text-white">Delete Message</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{embedToDelete?.name || 'Unnamed message'}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-all active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold shadow-2xl flex items-center gap-2">
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg('')}
            className="text-neutral-500 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
