'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

import ThemeToggle from '../components/ThemeToggle';
import DiscoverFeed from '../components/board/DiscoverFeed';

export default function DiscoverPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [registered, setRegistered] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const handleRegister = (id: string) => {
        setRegistered(prev => new Set(prev).add(id));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Header Section */}
            <div className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
                {/* Ambient Effects */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 dark:bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 dark:bg-blue-900/15 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                    {/* Header with Toggle */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <span className="text-lg font-semibold text-foreground">
                                    Discover
                                </span>
                                <p className="text-sm text-muted-foreground">
                                    Welcome back, {profile?.name?.split(' ')[0] || 'Hacker'}!
                                </p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Hackathon Feed */}
            <DiscoverFeed onRegister={handleRegister} />
        </div>
    );
}
