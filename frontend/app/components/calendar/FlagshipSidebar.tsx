'use client';

import { useMemo } from 'react';
import { Star } from 'lucide-react';
import { flagshipHackathons, FlagshipHackathon } from '../../data/flagshipHackathons';
import FlagshipCard from './FlagshipCard';

// Calculate dynamic status based on current date
function calculateStatus(hackathon: FlagshipHackathon): 'live' | 'upcoming' | 'ended' {
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

export default function FlagshipSidebar() {
    // Process and sort hackathons by dynamic status
    const processedHackathons = useMemo(() => {
        return flagshipHackathons
            .map(hackathon => ({
                ...hackathon,
                dynamicStatus: calculateStatus(hackathon)
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
    }, []);

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
                            {counts.live > 0 && <span className="text-red-500">{counts.live} live</span>}
                            {counts.live > 0 && counts.upcoming > 0 && ' • '}
                            {counts.upcoming > 0 && <span className="text-emerald-500">{counts.upcoming} upcoming</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
                {processedHackathons.map((hackathon) => (
                    <FlagshipCard
                        key={hackathon.id}
                        hackathon={{
                            ...hackathon,
                            status: hackathon.dynamicStatus // Override with dynamic status
                        }}
                    />
                ))}
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

