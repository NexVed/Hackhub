'use client';

import { useMemo } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useCalendarHackathons } from '@/hooks';
import { MNCHackathon } from '@/lib/hackathonService';
import FlagshipCard from './FlagshipCard';

// Get status color/label helpers (moved from flagshipHackathons.ts)
export function getStatusColor(status: string): string {
    switch (status) {
        case 'live':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'upcoming':
        case 'open':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'ended':
            return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
        default:
            return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
}

export function getStatusLabel(status: string): string {
    switch (status) {
        case 'live':
            return 'Live Now';
        case 'upcoming':
        case 'open':
            return 'Upcoming';
        case 'ended':
            return 'Ended';
        default:
            return status;
    }
}

// Calculate dynamic status based on current date
function calculateStatus(hackathon: MNCHackathon): 'live' | 'upcoming' | 'ended' {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = hackathon.startDate ? new Date(hackathon.startDate) : null;
    const endDate = hackathon.endDate ? new Date(hackathon.endDate) : null;

    if (!startDate) return 'upcoming';

    if (endDate && today > endDate) {
        return 'ended';
    }

    if (today >= startDate && (!endDate || today <= endDate)) {
        return 'live';
    }

    return 'upcoming';
}

// Get status priority for sorting (live first, then upcoming, then ended)
function getStatusPriority(status: 'live' | 'upcoming' | 'ended'): number {
    switch (status) {
        case 'live': return 0;
        case 'upcoming': return 1;
        case 'ended': return 2;
        default: return 3;
    }
}

// Format timeline string
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

export default function FlagshipSidebar() {
    // Fetch hackathons from backend API using TanStack Query
    const { data: hackathons = [], isLoading, error } = useCalendarHackathons();

    // Filter for flagship only and process with dynamic status
    const processedHackathons = useMemo(() => {
        return hackathons
            .filter(h => h.isFlagship) // Only flagship hackathons
            .map(hackathon => ({
                ...hackathon,
                dynamicStatus: calculateStatus(hackathon),
                timeline: formatTimeline(hackathon.startDate, hackathon.endDate)
            }))
            .sort((a, b) => {
                // First sort by status priority
                const statusDiff = getStatusPriority(a.dynamicStatus) - getStatusPriority(b.dynamicStatus);
                if (statusDiff !== 0) return statusDiff;

                // Then sort by start date
                const aDate = a.startDate ? new Date(a.startDate).getTime() : Infinity;
                const bDate = b.startDate ? new Date(b.startDate).getTime() : Infinity;
                return aDate - bDate;
            });
    }, [hackathons]);

    // Count hackathons by status
    const counts = useMemo(() => {
        return processedHackathons.reduce(
            (acc, h) => {
                acc[h.dynamicStatus]++;
                return acc;
            },
            { live: 0, upcoming: 0, ended: 0 }
        );
    }, [processedHackathons]);

    return (
        <aside className="w-80 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900/50 border-l border-zinc-200 dark:border-zinc-800 flex flex-col min-h-0 max-h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                        <Star className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Featured Hackathons
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {isLoading ? (
                                'Loading...'
                            ) : (
                                <>
                                    {counts.live > 0 && <span className="text-red-500">{counts.live} live</span>}
                                    {counts.live > 0 && counts.upcoming > 0 && ' • '}
                                    {counts.upcoming > 0 && <span className="text-emerald-500">{counts.upcoming} upcoming</span>}
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-sm text-red-500">
                        Failed to load hackathons
                    </div>
                ) : processedHackathons.length === 0 ? (
                    <div className="text-center py-8 text-sm text-zinc-500">
                        No featured hackathons
                    </div>
                ) : (
                    processedHackathons.map((hackathon) => (
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
                    ))
                )}
            </div>

            {/* Footer hint */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/30">
                <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                    {counts.ended > 0 ? `${counts.ended} ended` : "Don't miss these opportunities"}
                </p>
            </div>
        </aside>
    );
}
