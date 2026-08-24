import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TopNav({ guildName, setSidebarOpen }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-16 bg-neutral-900/90 backdrop-blur-sm border-b border-neutral-800">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden transition-colors" 
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu w-5 h-5">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          
          <Link to="/" className="p-1.5 rounded-xl hover:bg-neutral-800 transition-colors group" title="Back to Servers">
            <img src="/logo.png" alt="Orbit" width="28" height="28" className="rounded-xl group-hover:shadow-lg transition-shadow sm:w-8 sm:h-8" />
          </Link>
          
          <div className="w-px h-8 bg-neutral-700 hidden sm:block"></div>
          
          <h1 className="text-sm sm:text-[15px] font-semibold text-white truncate max-w-[100px] sm:max-w-none">
            {guildName || "Orbit Server"}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="relative">
            <button className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors" aria-label="Notifications" aria-expanded="false">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell w-5 h-5">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <button className="flex items-center gap-1.5 sm:gap-3 p-1 sm:p-1.5 pr-1.5 sm:pr-3 rounded-xl hover:bg-neutral-800 transition-colors" aria-label="User menu" aria-expanded="false">
              {user ? (
                <>
                  <img 
                    src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64` : "https://cdn.discordapp.com/embed/avatars/0.png"} 
                    alt={user.username} 
                    className="w-8 h-8 rounded-xl ring-2 ring-neutral-700" 
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">{user.username}</p>
                    <p className="text-[10px] text-neutral-500">Member</p>
                  </div>
                </>
              ) : (
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">Guest</p>
                </div>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
