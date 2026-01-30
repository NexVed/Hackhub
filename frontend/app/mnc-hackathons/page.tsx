'use client';

import { useMemo } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { useCalendarHackathons } from '@/hooks';
import FlagshipCard from '../components/calendar/FlagshipCard';
import { MNCHackathon } from '@/lib/hackathonService';
import { Star, Trophy, Sparkles, Loader2 } from 'lucide-react';

// Reusing helper functions from FlagshipSidebar logic (inline here since we might delete the sidebar file)
function calculateStatus(hackathon: MNCHackathon): 'live' | 'upcoming' | 'ended' {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = hackathon.startDate ? new Date(hackathon.startDate) : null;
    const endDate = hackathon.endDate ? new Date(hackathon.endDate) : null;

    if (!startDate) return 'upcoming';
    if (endDate && today > endDate) return 'ended';
    if (today >= startDate && (!endDate || today <= endDate)) return 'live';
    return 'upcoming';
}

function getStatusPriority(status: 'live' | 'upcoming' | 'ended'): number {
    switch (status) {
        case 'live': return 0;
        case 'upcoming': return 1;
        case 'ended': return 2;
        default: return 3;
    }
}

function formatTimeline(startDate?: string, endDate?: string): string {
    if (!startDate) return 'TBD';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (end) {
        if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
            return `${monthNames[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
        }
        return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}`;
    }
    return `${monthNames[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()}`;
}

export default function MNCHackathonsPage() {
    // Fetch hackathons
    const { data: hackathons = [], isLoading, error } = useCalendarHackathons();

    // Process hackathons
    const processedHackathons = useMemo(() => {
        return hackathons
            .filter(h => h.isFlagship)
            .map(hackathon => ({
                ...hackathon,
                dynamicStatus: calculateStatus(hackathon),
                timeline: formatTimeline(hackathon.startDate, hackathon.endDate)
            }))
            .sort((a, b) => {
                const statusDiff = getStatusPriority(a.dynamicStatus) - getStatusPriority(b.dynamicStatus);
                if (statusDiff !== 0) return statusDiff;
                const aDate = a.startDate ? new Date(a.startDate).getTime() : Infinity;
                const bDate = b.startDate ? new Date(b.startDate).getTime() : Infinity;
                return aDate - bDate;
            });
    }, [hackathons]);

    const liveCount = processedHackathons.filter(h => h.dynamicStatus === 'live').length;
    const upcomingCount = processedHackathons.filter(h => h.dynamicStatus === 'upcoming').length;

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TopBar>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        MNCs Hackathons
                    </span>
                </TopBar>

                <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 overflow-auto">
                    {/* Hero Section */}
                    <div className="relative bg-zinc-900 dark:bg-zinc-900 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-900/40 to-zinc-900/90" />
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <Trophy className="w-64 h-64 text-white" />
                        </div>

                        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-20">
                            <div className="flex items-start gap-4 mb-6">
                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    Premium Opportunities
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                                Top MNC Hackathons <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-amber-300">
                                    Accelerate Your Career
                                </span>
                            </h1>

                            <p className="max-w-2xl text-base sm:text-lg text-zinc-300 mb-6 sm:mb-8 leading-relaxed">
                                Discover flagship hackathons from the world's leading tech companies.
                                Compete, network, and showcase your skills to get hired by top MNCs.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-white font-medium">{liveCount} Live Now</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-white font-medium">{upcomingCount} Upcoming</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <p className="text-red-500">Failed to load hackathons. Please try again later.</p>
                            </div>
                        ) : processedHackathons.length === 0 ? (
                            <div className="text-center py-20 text-zinc-500">
                                No MNC hackathons found at the moment.
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-6 sm:mb-8">
                                    <Sparkles className="w-5 h-5 text-violet-500" />
                                    <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                        Active & Upcoming Challenges
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {processedHackathons.map((hackathon) => (
                                        <FlagshipCard
                                            key={hackathon.id}
                                            hackathon={{
                                                id: hackathon.id,
                                                name: hackathon.name,
                                                organizer: hackathon.organizer,
                                                logoUrl: hackathon.logoUrl,
                                                timeline: hackathon.timeline,
                                                status: hackathon.dynamicStatus,
                                                url: hackathon.url,
                                                description: hackathon.description || '',
                                                startDate: hackathon.startDate,
                                                endDate: hackathon.endDate,
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
