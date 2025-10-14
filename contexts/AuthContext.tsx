import React, { createContext, useState, useEffect, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
import * as authService from '../services/authService.ts';

interface AuthContextType {
  user: firebase.User | null;
  isAuthLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    await authService.signInWithGoogle();
  };

  const logout = async () => {
    await authService.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
