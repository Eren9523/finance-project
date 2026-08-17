import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { LoginModal } from '../components/auth/LoginModal';

export interface UserInfo {
  id: string;
  avatar: string;
  nickname: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string;
  isAdmin: boolean;
  job_title?: string;
  organization?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  loading: boolean;
  login: (info: UserInfo) => void;
  logout: () => Promise<void>;
  updateUserInfo: (info: Partial<UserInfo>) => void;
  isLoginModalOpen: boolean;
  openLoginModal: (onSuccessCallback?: () => void) => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [onSuccessCb, setOnSuccessCb] = useState<(() => void) | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await authApi.me();
      if (res.data) {
        setIsLoggedIn(true);
        setUserInfo({
          ...res.data,
          isAdmin: res.data.role === 'admin'
        });
      }
    } catch (e) {
      setIsLoggedIn(false);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (info: UserInfo) => {
    setIsLoggedIn(true);
    setUserInfo(info);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout error', e);
    }
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  const updateUserInfo = (info: Partial<UserInfo>) => {
    if (userInfo) {
      setUserInfo({ ...userInfo, ...info });
    }
  };

  const openLoginModal = (callback?: () => void) => {
    if (callback) {
      setOnSuccessCb(() => callback);
    } else {
      setOnSuccessCb(null);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setOnSuccessCb(null);
  };

  const handleSuccess = () => {
    if (onSuccessCb) {
      onSuccessCb();
    }
    closeLoginModal();
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userInfo,
      loading,
      login,
      logout,
      updateUserInfo,
      isLoginModalOpen,
      openLoginModal,
      closeLoginModal
    }}>
      {children}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSuccess={handleSuccess}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

