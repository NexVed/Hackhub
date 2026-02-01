'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

import DiscoverFeed from '../components/board/DiscoverFeed';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';

export default function DiscoverPage() {
    const { user, loading } = useAuth();
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
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen">
                <TopBar>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                Discover Hackathons
                            </span>
                        </div>
                    </div>
                </TopBar>

                <main className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-x-hidden">
                    <DiscoverFeed onRegister={handleRegister} />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

