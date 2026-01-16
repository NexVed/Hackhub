'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { getUserProfile, UserProfile } from '@/lib/profileService';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchProfile = useCallback(async (userId: string) => {
        const userProfile = await getUserProfile(userId);
        setProfile(userProfile);
    }, []);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        const initAuth = async () => {
            if (!supabase) return;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
                // Set loading false immediately so pages can render
                setLoading(false);

                // Fetch profile in background (non-blocking)
                if (session?.user) {
                    fetchProfile(session.user.id);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    // Redirect logic for incomplete profile
    useEffect(() => {
        if (loading) return;

        const isAuthPage = pathname?.startsWith('/auth');
        const isCompleteProfilePage = pathname === '/complete-profile';
        const isPublicPage = pathname === '/' || pathname === '/login';

        // Redirect if user is logged in
        if (user && !isAuthPage && !isPublicPage) {
            // Check if profile exists and is complete
            // If profile is NULL, it's treated as incomplete (user likely needs to be backfilled)
            const isProfileComplete = profile?.is_profile_completed;

            if (!isProfileComplete && !isCompleteProfilePage) {
                router.push('/complete-profile');
            }
            else if (isProfileComplete && isCompleteProfilePage) {
                router.push('/discover');
            }
        }
    }, [user, profile, loading, pathname, router]);

    const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
        if (!supabase) {
            console.error('Supabase client not initialized');
            return;
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('OAuth error:', error.message);
            throw error;
        }
    }, []);

    const signOut = useCallback(async () => {
        if (!supabase) {
            console.error('Supabase client not initialized');
            return;
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Sign out error:', error.message);
            throw error;
        }

        setUser(null);
        setSession(null);
        setProfile(null);
        router.push('/');
    }, [router]);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    }, [user, fetchProfile]);

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signInWithOAuth, signOut, refreshProfile }}>
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

export default AuthContext;
