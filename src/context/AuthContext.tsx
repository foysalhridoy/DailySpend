import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/db/supabase';
import { UserProfile } from '@/types';
import { localDb } from '@/db/dexie';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isCloudConnected: boolean;
  login: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const DEMO_USER: UserProfile = {
  id: 'usr-demo-local-01',
  email: 'hridoy@dailyspend.app',
  full_name: 'Hridoy',
  avatar_url: '',
  currency_symbol: '৳',
  currency_code: 'BDT',
  date_format: 'yyyy-MM-dd',
  time_format: '12h',
  theme: 'dark',
  is_onboarded: true,
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await loadProfile(session.user.id, session.user.email || '');
          } else {
            // Check for saved local guest session or load default demo session
            const savedUser = localStorage.getItem('dailyspend_current_user');
            if (savedUser) {
              const parsed = JSON.parse(savedUser);
              setUser(parsed);
              await localDb.seedInitialData(parsed.id);
            } else {
              // Default to demo session for instant local usability
              setUser(DEMO_USER);
              await localDb.seedInitialData(DEMO_USER.id);
            }
          }

          // Supabase auth state change listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              await loadProfile(session.user.id, session.user.email || '');
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } catch (err) {
          console.error('Error initializing Supabase Auth:', err);
          setUser(DEMO_USER);
          await localDb.seedInitialData(DEMO_USER.id);
        }
      } else {
        // Local mode
        const savedUser = localStorage.getItem('dailyspend_current_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            await localDb.seedInitialData(parsed.id);
          } catch {
            setUser(DEMO_USER);
            await localDb.seedInitialData(DEMO_USER.id);
          }
        } else {
          setUser(DEMO_USER);
          await localDb.seedInitialData(DEMO_USER.id);
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  async function loadProfile(userId: string, email: string) {
    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const prof: UserProfile = {
          id: data.id,
          email: data.email || email,
          full_name: data.full_name || 'DailySpend User',
          avatar_url: data.avatar_url || '',
          currency_symbol: data.currency_symbol || '৳',
          currency_code: data.currency_code || 'BDT',
          date_format: data.date_format || 'yyyy-MM-dd',
          time_format: data.time_format || '12h',
          theme: data.theme || 'dark',
          is_onboarded: data.is_onboarded ?? true,
          created_at: data.created_at || new Date().toISOString(),
        };
        setUser(prof);
        localStorage.setItem('dailyspend_current_user', JSON.stringify(prof));
        await localDb.seedInitialData(prof.id);
        return;
      }
    }

    // Fallback: check local profile
    const localProf = await localDb.user_profiles.get(userId);
    if (localProf) {
      setUser(localProf);
      localStorage.setItem('dailyspend_current_user', JSON.stringify(localProf));
    } else {
      const newProf: UserProfile = {
        ...DEMO_USER,
        id: userId,
        email,
      };
      await localDb.user_profiles.put(newProf);
      setUser(newProf);
      localStorage.setItem('dailyspend_current_user', JSON.stringify(newProf));
      await localDb.seedInitialData(newProf.id);
    }
  }

  const login = async (email: string, password?: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      if (data.user) {
        await loadProfile(data.user.id, data.user.email || email);
      }
      return {};
    }

    // Local authentication fallback
    const localUser: UserProfile = {
      ...DEMO_USER,
      id: `usr-${btoa(email).slice(0, 10).replace(/[^a-zA-Z0-9]/g, 'x')}`,
      email,
      full_name: email.split('@')[0],
      is_onboarded: true,
    };
    await localDb.user_profiles.put(localUser);
    await localDb.seedInitialData(localUser.id);
    setUser(localUser);
    localStorage.setItem('dailyspend_current_user', JSON.stringify(localUser));
    return {};
  };

  const signUp = async (email: string, password?: string, fullName?: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) return { error: error.message };
      if (data.user) {
        await loadProfile(data.user.id, data.user.email || email);
      }
      return {};
    }

    // Local signup
    const newId = `usr-${Date.now()}`;
    const newProf: UserProfile = {
      ...DEMO_USER,
      id: newId,
      email,
      full_name: fullName || email.split('@')[0],
      is_onboarded: false, // Newly signed up users go through onboarding
    };
    await localDb.user_profiles.put(newProf);
    await localDb.seedInitialData(newId);
    setUser(newProf);
    localStorage.setItem('dailyspend_current_user', JSON.stringify(newProf));
    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('dailyspend_current_user');
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('dailyspend_current_user', JSON.stringify(updated));
    await localDb.user_profiles.put(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update(updates).eq('id', user.id);
    }
  };

  const completeOnboarding = async () => {
    await updateProfile({ is_onboarded: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isCloudConnected: isSupabaseConfigured,
        login,
        signUp,
        signOut,
        updateProfile,
        completeOnboarding,
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

