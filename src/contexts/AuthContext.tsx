import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  fullName: string;
  phone?: string;
  role: 'admin' | 'writer';
  createdBy?: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (userId: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isWriter: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'aam_wala_users',
  CURRENT_USER: 'aam_wala_current_user',
};

// Initialize empty users list if none exists
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsers) {
    const users: User[] = [
      {
        id: 'admin',
        fullName: 'Administrator',
        role: 'admin',
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem('aam_wala_passwords', JSON.stringify({ admin: 'admin123' }));
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    initializeUsers();

    // check if user already logged in
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userId: string, password: string): boolean => {
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    const passwordsData = localStorage.getItem('aam_wala_passwords');

    if (!usersData || !passwordsData) return false;

    const users: User[] = JSON.parse(usersData);
    const passwords: Record<string, string> = JSON.parse(passwordsData);

    const user = users.find(u => u.id === userId);

    if (user && passwords[userId] === password) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const value: AuthContextType = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isWriter: currentUser?.role === 'writer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getAllUsers = (): User[] => {
  const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersData ? JSON.parse(usersData) : [];
};

export const createWriter = (fullName: string, phone: string, password: string, createdBy: string): User => {
  try {
    const users = getAllUsers();
    const writerCount = users.filter(u => u.id.startsWith('Aam-Wrt-')).length;
    const newWriterId = `Aam-Wrt-${writerCount + 1}`;

    const newWriter: User = {
      id: newWriterId,
      fullName,
      phone,
      role: 'writer',
      createdBy,
    };

    // add to users list
    users.push(newWriter);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // save password separately
    const passwordsData = localStorage.getItem('aam_wala_passwords');
    const passwords: Record<string, string> = passwordsData ? JSON.parse(passwordsData) : {};
    passwords[newWriterId] = password;
    localStorage.setItem('aam_wala_passwords', JSON.stringify(passwords));

    return newWriter;
  } catch (error) {
    console.error('Error creating writer:', error);
    throw error;
  }
};

export const deleteWriter = (userId: string): boolean => {
  const users = getAllUsers();
  const userToDelete = users.find(u => u.id === userId);

  // only delete if user is writer
  if (!userToDelete || userToDelete.role !== 'writer') {
    return false;
  }

  const updatedUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

  // also remove password
  const passwordsData = localStorage.getItem('aam_wala_passwords');
  if (passwordsData) {
    const passwords: Record<string, string> = JSON.parse(passwordsData);
    delete passwords[userId];
    localStorage.setItem('aam_wala_passwords', JSON.stringify(passwords));
  }

  return true;
};

export const changePassword = (userId: string, newPassword: string): boolean => {
  const passwordsData = localStorage.getItem('aam_wala_passwords');
  if (!passwordsData) return false;

  const passwords: Record<string, string> = JSON.parse(passwordsData);
  passwords[userId] = newPassword;
  localStorage.setItem('aam_wala_passwords', JSON.stringify(passwords));

  return true;
};