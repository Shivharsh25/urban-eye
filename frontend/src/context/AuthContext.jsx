import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import { getSocket } from '../api/socket';

const DEFAULT_LOCAL_USER = {
  id: '65e90d235f3b72c4e2010001',
  name: 'Shivharsh Tiwari',
  email: 'sarah.jenkins@example.com',
  role: 'citizen',
  ward: 'Ward 14 (Central Zone)',
  trustScore: 85,
  createdAt: '2024-01-15T08:00:00.000Z'
};

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
      if (savedToken && savedToken !== 'local-demo-token') {
        try {
          const res = await client.get('/api/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('urban_eye_user', JSON.stringify(res.data.user));
            const socket = getSocket();
            if (socket?.connected) {
              socket.emit('join:user', res.data.user.id);
            }
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem('urban_eye_token');
            localStorage.removeItem('urban_eye_user');
          }
        } catch (err) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('urban_eye_token');
            localStorage.removeItem('urban_eye_user');
          }
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('urban_eye_token');
        localStorage.removeItem('urban_eye_user');
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

  const loginWithGoogle = async (googleData) => {
    console.log('[AuthContext] loginWithGoogle called for:', googleData?.email);
    const res = await client.post('/api/auth/google', {
      email: googleData.email,
      name: googleData.name,
      photoUrl: googleData.photoUrl,
      uid: googleData.uid,
      idToken: googleData.idToken
    });

    const { token: receivedToken, user: receivedUser, isNewUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem('urban_eye_token', receivedToken);
    localStorage.setItem('urban_eye_user', JSON.stringify(receivedUser));

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('join:user', receivedUser.id);
    }

    return { user: receivedUser, isNewUser };
  };

  const requestGoogleOtp = async (googleData) => {
    console.log('[AuthContext] requestGoogleOtp called for:', googleData?.email);
    const res = await client.post('/api/auth/google-request-otp', {
      email: googleData.email,
      name: googleData.name,
      photoUrl: googleData.photoUrl,
      uid: googleData.uid,
      idToken: googleData.idToken
    });
    return res.data;
  };

  const verifyGoogleOtp = async (email, otp) => {
    console.log('[AuthContext] verifyGoogleOtp called for:', email);
    const res = await client.post('/api/auth/google-verify-otp', { email, otp });
    const { token: receivedToken, user: receivedUser, isNewUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem('urban_eye_token', receivedToken);
    localStorage.setItem('urban_eye_user', JSON.stringify(receivedUser));

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('join:user', receivedUser.id);
    }

    return { user: receivedUser, isNewUser };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('urban_eye_token');
    localStorage.removeItem('urban_eye_user');
    sessionStorage.clear();
    try {
      const socket = getSocket();
      if (socket?.connected) {
        socket.disconnect();
      }
    } catch (e) {
      console.warn('Socket disconnect error:', e);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('urban_eye_user', JSON.stringify(merged));
      return merged;
    });
  };

  const requestPhoneOtp = async (phoneNumber) => {
    const { auth } = await import('../config/firebase');
    const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth');
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
    return await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
  };

  const verifyPhoneOtp = async (confirmationResult, otp) => {
    const result = await confirmationResult.confirm(otp);
    const firebaseUser = result.user;
    const idToken = typeof firebaseUser.getIdToken === 'function' ? await firebaseUser.getIdToken() : 'demo-token';
    return await loginWithPhone(firebaseUser.phoneNumber, idToken);
  };

  const value = {
    user,
    token,
    loading,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isSuperAdmin: user?.role === 'super_admin',
    isDeptAdmin: user?.role === 'department_admin',
    departmentId: user?.departmentId || null,
    departmentName: user?.departmentName || null,
    login,
    loginWithCredentials: login,
    loginWithPhone,
    requestPhoneOtp,
    verifyPhoneOtp,
    loginWithGoogle,
    requestGoogleOtp,
    verifyGoogleOtp,
    register,
    logout,
    updateUser
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
