'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sparkles, Search, Users, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

import ThemeToggle from '../components/ThemeToggle';

export default function DiscoverPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Ambient Effects */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 dark:bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 dark:bg-blue-900/15 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
                    {/* Header with Toggle */}
                    <div className="flex justify-between items-start mb-12">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                Welcome back, {profile?.name?.split(' ')[0] || 'Hacker'}!
                            </span>
                        </div>
                        <ThemeToggle />
                    </div>

                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Discover Your Next<br />
                            <span className="bg-gradient-to-r from-emerald-500 to-blue-600 dark:from-emerald-400 dark:to-blue-500 bg-clip-text text-transparent">
                                Hackathon Adventure
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl">
                            Find hackathons, build dream teams, and ship projects that matter.
                        </p>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Link
                            href="/"
                            className="group p-6 bg-card border border-border rounded-2xl hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="p-3 bg-emerald-500/10 rounded-xl w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
                                <Search className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Browse Hackathons</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Explore upcoming hackathons from Unstop, Devfolio, and more.
                            </p>
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                <span>Explore</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        <Link
                            href="/teams"
                            className="group p-6 bg-card border border-border rounded-2xl hover:border-blue-500/50 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4 group-hover:bg-blue-500/20 transition-colors">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Find Teammates</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Connect with developers, designers, and builders.
                            </p>
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
                                <span>Connect</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        <Link
                            href="/dashboard"
                            className="group p-6 bg-card border border-border rounded-2xl hover:border-purple-500/50 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4 group-hover:bg-purple-500/20 transition-colors">
                                <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Your Dashboard</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Track your hackathons, projects, and achievements.
                            </p>
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-medium">
                                <span>View</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>

                    {/* Profile Summary */}
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Your Profile</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Username</p>
                                <p className="text-foreground font-medium">@{profile?.username || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Institute</p>
                                <p className="text-foreground font-medium">{profile?.institute || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Course</p>
                                <p className="text-foreground font-medium">{profile?.course || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Year</p>
                                <p className="text-foreground font-medium">{profile?.year || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
