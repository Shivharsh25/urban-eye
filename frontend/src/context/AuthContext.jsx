import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import { getSocket } from '../api/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('urban_eye_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('urban_eye_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on load
  useEffect(() => {
    async function verifyAuth() {
      const savedToken = localStorage.getItem('urban_eye_token');
      if (savedToken) {
        try {
          const res = await client.get('/api/auth/me');
          setUser(res.data.user);
          localStorage.setItem('urban_eye_user', JSON.stringify(res.data.user));
          
          // Join socket user room
          const socket = getSocket();
          if (socket.connected) {
            socket.emit('join:user', res.data.user.id);
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    }

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await client.post('/api/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem('urban_eye_token', receivedToken);
    localStorage.setItem('urban_eye_user', JSON.stringify(receivedUser));

    const socket = getSocket();
    socket.emit('join:user', receivedUser.id);

    return receivedUser;
  };

  const loginWithPhone = async (phone, idToken) => {
    console.log('[AuthContext] loginWithPhone called with phone:', phone);
    const res = await client.post('/api/auth/firebase-login', { phone, idToken });
    console.log('[AuthContext] verify-otp response:', res.data);
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem('urban_eye_token', receivedToken);
    localStorage.setItem('urban_eye_user', JSON.stringify(receivedUser));

    const socket = getSocket();
    socket.emit('join:user', receivedUser.id);

    return receivedUser;
  };

  const register = async (name, email, phone, password) => {
    const res = await client.post('/api/auth/register', { name, email, phone, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem('urban_eye_token', receivedToken);
    localStorage.setItem('urban_eye_user', JSON.stringify(receivedUser));

    const socket = getSocket();
    socket.emit('join:user', receivedUser.id);

    return receivedUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('urban_eye_token');
    localStorage.removeItem('urban_eye_user');
  };

  const value = {
    user,
    token,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    loginWithPhone,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
