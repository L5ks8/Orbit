import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import SearchModal from './components/landing/SearchModal';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Docs from './pages/Docs';
import Guides from './pages/Guides';
import Benchmarks from './pages/Benchmarks';
import Status from './pages/Status';
import Dashboard from './pages/Dashboard';
import Appeal from './pages/Appeal';
import Verify from './pages/Verify';
import Leaderboard from './pages/Leaderboard';
import UserSettings from './pages/UserSettings';
import Navbar from './components/ui/Navbar';
import DocsNavbar from './components/ui/DocsNavbar';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

function AppContent({ isSearchOpen, setIsSearchOpen }) {
  const location = useLocation();
  const useMegaMenu = ['/', '/terms', '/privacy', '/status', '/benchmarks'].includes(location.pathname);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Ambient glows
    const ambientBg = document.createElement('div');
    ambientBg.className = 'ambient-bg';
    const orb1 = document.createElement('div');
    orb1.className = 'ambient-orb orb-1';
    const orb2 = document.createElement('div');
    orb2.className = 'ambient-orb orb-2';

    document.body.prepend(ambientBg, orb1, orb2);
    return () => {
      ambientBg.remove();
      orb1.remove();
      orb2.remove();
    };
  }, []);

  // Global auto-grow for all textareas
  useEffect(() => {
    const resizeTextarea = (t) => {
      // Small timeout to ensure styles/layout are fully applied
      setTimeout(() => {
        if (!t) return;
        t.style.height = 'auto';
        t.style.height = t.scrollHeight + 'px';
      }, 0);
    };

    const handleInput = (e) => {
      if (e.target.tagName === 'TEXTAREA') {
        resizeTextarea(e.target);
      }
    };
    
    document.addEventListener('input', handleInput);

    // Override value setter to detect programmatic changes (e.g. React state updates)
    const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    const originalSet = descriptor.set;
    
    Object.defineProperty(HTMLTextAreaElement.prototype, 'value', {
      set: function(val) {
        originalSet.call(this, val);
        resizeTextarea(this);
      },
      get: descriptor.get
    });

    // Resize existing textareas immediately
    document.querySelectorAll('textarea').forEach(resizeTextarea);

    // Observer for newly added textareas
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'TEXTAREA') resizeTextarea(node);
            if (node.querySelectorAll) {
              node.querySelectorAll('textarea').forEach(resizeTextarea);
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('input', handleInput);
      observer.disconnect();
      Object.defineProperty(HTMLTextAreaElement.prototype, 'value', descriptor);
    };
  }, []);

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="App">
      {!isDashboard && (
        useMegaMenu ? (
          <Navbar onSearchClick={() => setIsSearchOpen(true)} />
        ) : (
          <DocsNavbar onSearchClick={() => setIsSearchOpen(true)} />
        )
      )}
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/benchmarks" element={<Benchmarks />} />
          <Route path="/status" element={<Status />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/appeal/:customUrl" element={<Appeal />} />
          <Route path="/verify/:token" element={<Verify />} />
          <Route path="/leaderboard/:guildId" element={<Leaderboard />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppContent isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
