'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { insforge, User, Profile } from '@/lib/insforge';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error) {
        setUser(null);
        setProfile(null);
      } else {
        setUser(data?.user || null);
        setProfile(data?.profile || null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      setUser(data?.user || null);
      setProfile(null); // Profile will be loaded separately
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      setUser(data?.user || null);
      setProfile(null); // Profile will be loaded separately
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      await insforge.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      const { data: updatedProfile, error } = await insforge.auth.setProfile(data);
      if (error) {
        return { error: error.message };
      }
      setProfile(updatedProfile);
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
