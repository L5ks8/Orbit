import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type, leaving: false }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const updateToast = useCallback((id, message, type = 'info', duration = 5000) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, message, type, leaving: false } : t));
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, updateToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.leaving ? 'toast-leaving' : ''}`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="toast-icon">
              {toast.type === 'success' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              )}
              {toast.type === 'error' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              )}
              {toast.type === 'info' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              )}
              {toast.type === 'loading' && (
                <svg className="animate-spin text-neutral-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    const fallback = (m) => console.warn('[Toast]', m);
    fallback.loading = () => {};
    fallback.dismiss = () => {};
    fallback.success = () => {};
    fallback.error = () => {};
    return fallback;
  }
  
  const { addToast, removeToast, updateToast } = context;
  
  return React.useMemo(() => {
    const toast = (message, type) => addToast(message, type);
    toast.loading = (message) => addToast(message, 'loading', 0);
    toast.success = (message, opts) => opts?.id ? updateToast(opts.id, message, 'success') : addToast(message, 'success');
    toast.error = (message, opts) => opts?.id ? updateToast(opts.id, message, 'error') : addToast(message, 'error');
    toast.dismiss = (id) => removeToast(id);
    return toast;
  }, [addToast, removeToast, updateToast]);
}
