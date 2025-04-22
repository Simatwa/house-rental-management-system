import React, { createContext, useContext, useEffect, useState } from 'react';
import { accountService } from '../services/accountService';
import { UserProfile } from '../types/account';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  loading: false,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const profile = await accountService.getUserProfile();
        setUser(profile);
      } catch (err) {
        localStorage.removeItem('access_token');
        setError('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await accountService.login(username, password);
      const profile = await accountService.getUserProfile();
      setUser(profile);
    } catch (err) {
      setError('Invalid username or password');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/';
  };
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};