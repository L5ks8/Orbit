import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SearchModal from './components/landing/SearchModal';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Docs from './pages/Docs';
import Guides from './pages/Guides';
import Dashboard from './pages/Dashboard';
import Navbar from './components/ui/Navbar';
import DocsNavbar from './components/ui/DocsNavbar';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

function AppContent({ isSearchOpen, setIsSearchOpen }) {
  const location = useLocation();
  const useMegaMenu = ['/', '/terms', '/privacy'].includes(location.pathname);

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
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
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
      <BrowserRouter>
        <AppContent isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
