import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  auth,
  onAuthStateChanged,
  FirebaseUser,
  fetchUserProfile,
  syncUserProfile,
  testFirestoreConnection,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginAsGuest,
  logoutUser,
  requestPasswordReset,
  updateUserProfile,
} from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot' | 'profile';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot' | 'profile') => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<UserProfile>;
  register: (email: string, pass: string, name: string, role?: UserRole) => Promise<UserProfile>;
  loginGoogle: () => Promise<UserProfile>;
  loginGuest: () => Promise<UserProfile>;
  loginLocalSession: (name: string, email: string, role?: UserRole) => UserProfile;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot' | 'profile'>('login');

  // Test Firestore connection on app mount as required by Firebase skill
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const p = await fetchUserProfile(auth.currentUser.uid);
      if (p) setUserProfile(p);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await syncUserProfile(user);
          setUserProfile(profile);
        } catch (err) {
          console.warn('Error syncing profile on auth change:', err);
          // Fallback profile representation if offline
          setUserProfile({
            uid: user.uid,
            email: user.email || 'user@aura.local',
            displayName: user.displayName || 'AURA User',
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            photoURL: user.photoURL || undefined,
            mfaEnabled: false,
          });
        }
      } else {
        try {
          const cached = localStorage.getItem('aura_local_user');
          if (cached) {
            setUserProfile(JSON.parse(cached));
          } else {
            setUserProfile(null);
          }
        } catch (_) {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (tab: 'login' | 'register' | 'forgot' | 'profile' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, pass: string) => {
    const profile = await loginWithEmail(email, pass);
    setUserProfile(profile);
    setIsAuthModalOpen(false);
    return profile;
  };

  const register = async (email: string, pass: string, name: string, role: UserRole = 'user') => {
    const profile = await registerWithEmail(email, pass, name, role);
    setUserProfile(profile);
    setIsAuthModalOpen(false);
    return profile;
  };

  const loginGoogle = async () => {
    const profile = await loginWithGoogle();
    setUserProfile(profile);
    setIsAuthModalOpen(false);
    return profile;
  };

  const loginGuest = async () => {
    const profile = await loginAsGuest();
    setUserProfile(profile);
    setIsAuthModalOpen(false);
    return profile;
  };

  const loginLocalSession = (name: string, emailAddr: string, assignedRole: UserRole = 'engineer') => {
    const localProfile: UserProfile = {
      uid: `local-${Date.now()}`,
      email: emailAddr || 'swastikpadhy0@gmail.com',
      displayName: name || 'Swastik Padhy',
      role: assignedRole,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      mfaEnabled: false,
    };
    setUserProfile(localProfile);
    setIsAuthModalOpen(false);
    try {
      localStorage.setItem('aura_local_user', JSON.stringify(localProfile));
    } catch (_) {}
    return localProfile;
  };

  const logout = async () => {
    try {
      localStorage.removeItem('aura_local_user');
    } catch (_) {}
    await logoutUser();
    setUserProfile(null);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    await requestPasswordReset(email);
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    await updateUserProfile(currentUser.uid, updates);
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginGoogle,
        loginGuest,
        loginLocalSession,
        logout,
        resetPassword,
        updateProfileData,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
