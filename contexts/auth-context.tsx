"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: {
    displayName?: string;
    avatar_url?: string;
    full_name?: string;
  }) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          localStorage.setItem("user_id", session.user.id);
        } else {
          localStorage.removeItem("user_id");
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        localStorage.setItem("user_id", session.user.id);
      } else {
        localStorage.removeItem("user_id");
      }
      setLoading(false);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          scopes:
            "openid email profile https://www.googleapis.com/auth/calendar.events",
        },
      });
      return { error };
    } catch (error) {
      console.error("Google sign-in error:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user_id");
    router.push("/login");
  };

  const updateProfile = async (updates: {
    displayName?: string;
    avatar_url?: string;
    full_name?: string;
  }) => {
    try {
      // Get current user metadata
      const currentUserData = user?.user_metadata || {};

      // Prepare updates for both user_metadata and raw_user_meta_data
      const supabaseUpdates: any = {
        ...currentUserData,
      };

      if (updates.displayName !== undefined) {
        supabaseUpdates.full_name = updates.displayName;
      }
      if (updates.full_name !== undefined) {
        supabaseUpdates.full_name = updates.full_name;
      }
      if (updates.avatar_url !== undefined) {
        supabaseUpdates.avatar_url = updates.avatar_url;
      }

      const { error } = await supabase.auth.updateUser({
        data: supabaseUpdates,
      });

      if (error) {
        return { error };
      }

      // Force refresh the session to get updated user data
      await new Promise((resolve) => setTimeout(resolve, 500)); // Increased delay
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
