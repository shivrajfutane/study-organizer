import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { dataService } from '@/services/data-service';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isDemoUser: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  syncNow: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'usr_default_001',
  app_metadata: {},
  user_metadata: { full_name: 'Guest Learner' },
  aud: 'authenticated',
  email: 'guest@studyspace.dev',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEMO_USER);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(DEMO_USER);
      setIsDemoUser(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        setIsDemoUser(false);
        dataService.syncAllDataToCloud(session.user.id);
      } else {
        setUser(DEMO_USER);
        setIsDemoUser(true);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        setIsDemoUser(false);
        await dataService.syncAllDataToCloud(session.user.id);
      } else {
        setUser(DEMO_USER);
        setIsDemoUser(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        ...DEMO_USER,
        email,
      };
      setUser(mockUser);
      setIsDemoUser(false);
      await dataService.syncAllDataToCloud(mockUser.id);
      return { error: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data?.user) {
      setUser(data.user);
      setIsDemoUser(false);
      await dataService.fetchAllDataFromCloud(data.user.id);
      await dataService.syncAllDataToCloud(data.user.id);
    }
    return { error: error ? new Error(error.message) : null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        ...DEMO_USER,
        email,
        user_metadata: { full_name: fullName },
      };
      setUser(mockUser);
      dataService.updateProfile({ full_name: fullName, email });
      setIsDemoUser(false);
      await dataService.syncAllDataToCloud(mockUser.id);
      return { error: null };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (!error && data?.user) {
      setUser(data.user);
      setIsDemoUser(false);
      dataService.updateProfile({ full_name: fullName, email });
      await dataService.syncAllDataToCloud(data.user.id);
    }
    return { error: error ? new Error(error.message) : null };
  };

  const syncNow = async () => {
    const activeUserId = user?.id || 'usr_default_001';
    return await dataService.syncAllDataToCloud(activeUserId);
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(DEMO_USER);
    setSession(null);
    setIsDemoUser(true);
  };

  const continueAsGuest = () => {
    setUser(DEMO_USER);
    setIsDemoUser(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        isDemoUser,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        continueAsGuest,
        syncNow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
