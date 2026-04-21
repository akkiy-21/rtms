import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { changePassword as changePasswordRequest, getCurrentUser, login as loginRequest, setAuthToken } from '@/services/api';
import { ChangePasswordFormData, LoginResponseData, User } from '@/types/user';


const AUTH_TOKEN_STORAGE_KEY = 'rtms.auth.token';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userId: string, password: string) => Promise<LoginResponseData>;
  logout: () => void;
  refreshCurrentUser: () => Promise<User | null>;
  changePassword: (payload: ChangePasswordFormData) => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);


const persistToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    setAuthToken(token);
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  setAuthToken(null);
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, []);

  const refreshCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  const login = async (userId: string, password: string): Promise<LoginResponseData> => {
    const response = await loginRequest({ user_id: userId, password });
    persistToken(response.access_token);
    setUser(response.user);
    return response;
  };

  const changePassword = async (payload: ChangePasswordFormData): Promise<User> => {
    const updatedUser = await changePasswordRequest(payload);
    setUser(updatedUser);
    return updatedUser;
  };

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    persistToken(token);
    refreshCurrentUser().finally(() => setIsLoading(false));
  }, [refreshCurrentUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    refreshCurrentUser,
    changePassword,
  }), [isLoading, logout, refreshCurrentUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};