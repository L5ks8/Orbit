import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, ChevronDown } from 'lucide-react';

export default function TopNav({ guildName, setSidebarOpen }) {
  const { user } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
            <img src="/img/logo.png" alt="Orbit" width="28" height="28" className="rounded-xl group-hover:shadow-lg transition-shadow sm:w-8 sm:h-8" />
          </Link>
          
          <div className="w-px h-8 bg-neutral-700 hidden sm:block"></div>
          
          <h1 className="text-sm sm:text-[15px] font-semibold text-white truncate max-w-[100px] sm:max-w-none">
            {guildName || "Orbit Server"}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="relative">
            <button 
              className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors" 
              aria-label="Notifications" 
              aria-expanded={showNotifications}
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileDropdown(false); }}
            >
              <Bell size={20} />
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-[320px] bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                  <h3 className="text-[15px] font-semibold text-white m-0">Notifications</h3>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"></path><path d="m22 10-7.5 7.5L13 16"></path></svg>
                    Clear all
                  </button>
                </div>
                <div className="flex flex-col items-center p-12 text-center">
                  <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-500 mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                  </div>
                  <h4 className="text-[15px] font-semibold text-white m-0 mb-1.5">You're all caught up</h4>
                  <p className="text-[13px] text-neutral-400 m-0">Milestones, recaps and alerts will show up here.</p>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button 
              className="flex items-center gap-1.5 sm:gap-3 p-1 sm:p-1.5 pr-1.5 sm:pr-3 rounded-xl hover:bg-neutral-800 transition-colors" 
              aria-label="User menu" 
              aria-expanded={showProfileDropdown}
              onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifications(false); }}
            >
              {user ? (
                <>
                  <img 
                    src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64` : "https://cdn.discordapp.com/embed/avatars/0.png"} 
                    alt={user.username} 
                    className="w-8 h-8 rounded-xl ring-2 ring-neutral-700" 
                    onError={(e) => { e.target.src = '/img/logo.png'; }}
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white m-0">{user.username}</p>
                    <p className="text-[10px] text-neutral-500 m-0">Member</p>
                  </div>
                </>
              ) : (
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white m-0">Guest</p>
                </div>
              )}
              <ChevronDown size={16} className="text-neutral-400 ml-1" />
            </button>
            {showProfileDropdown && user && (
              <div className="absolute right-0 top-full mt-2 w-[224px] bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-neutral-800">
                  <p className="text-[14px] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis m-0">{user.username}</p>
                  <p className="text-[12px] text-neutral-500 whitespace-nowrap overflow-hidden text-ellipsis m-0 mt-0.5">ID: {user.id || 'Unknown'}</p>
                </div>
                <div className="py-1">
                  <a href="/" className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-neutral-400 no-underline transition-colors hover:text-white hover:bg-neutral-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    Home
                  </a>
                  <a href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-neutral-400 no-underline transition-colors hover:text-white hover:bg-neutral-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line></svg>
                    My Servers
                  </a>
                  <a href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-neutral-400 no-underline transition-colors hover:text-white hover:bg-neutral-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    Settings
                  </a>
                </div>
                <div className="border-t border-neutral-800 pt-1 mt-1">
                  <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] text-red-400 bg-transparent border-none cursor-pointer text-left transition-colors hover:text-red-300 hover:bg-red-500/10" onClick={() => window.location.href = '/auth/logout'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
