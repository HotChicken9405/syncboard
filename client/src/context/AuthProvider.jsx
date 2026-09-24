import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext.js';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth.js';
import { setAccessToken } from '../api/client.js';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.data?.token) {
          setAccessToken(data.data.token);
          setUser(data.data.user);
        }
      })
      .catch(() => {
        // No valid session — user needs to log in
      })
      .finally(() => setLoading(false));

    const handleExpired = () => {
      setUser(null);
      setAccessToken(null);
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    setAccessToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await apiRegister(data);
    setAccessToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try { await apiLogout(); } catch {
      // continue logout even if server call fails
    }
    setAccessToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}