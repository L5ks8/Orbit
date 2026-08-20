import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user')
      .then(res => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => {
        if (data.id) {
          setUser(data);
        } else {
          setUser(null);
        }
      })
      .catch(err => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value = {
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
