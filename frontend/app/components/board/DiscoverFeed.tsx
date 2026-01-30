'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { Hackathon } from '../../types/hackathon';
import { useHackathons, useHackathonOverview } from '@/hooks/useHackathons';
import HackathonSection from './HackathonSection';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface DiscoverFeedProps {
    onRegister: (id: string) => void;
}

const sections: { title: string; platform: Hackathon['platform'] }[] = [
    { title: 'Unstop Hackathons', platform: 'Unstop' },
    { title: 'Devfolio Hackathons', platform: 'Devfolio' },
    { title: 'Devnovate Challenges', platform: 'Devnovate' },
    { title: 'Hack2Skill Events', platform: 'Hack2Skill' },
    { title: 'HackerEarth Challenges', platform: 'HackerEarth' },
    { title: 'Devpost Hackathons', platform: 'Devpost' },
    { title: 'Major League Hacking', platform: 'MLH' },
    { title: 'Other Opportunities', platform: 'Other' },
];

export default function DiscoverFeed({ onRegister }: DiscoverFeedProps) {
    // 1. Fetch the overview (guaranteed 5 items per platform)
    const {
        data: overviewData,
        status: overviewStatus
    } = useHackathonOverview();

    // 2. Fetch the infinite stream for "Scroll for more"
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status: infiniteStatus,
        error: infiniteError,
        refetch
    } = useHackathons();

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    // Grouping logic that merges Overview + Infinite Stream
    const hackathonsByPlatform = useMemo(() => {
        const grouped: Record<string, Hackathon[]> = {
            Unstop: [],
            Devfolio: [],
            Devnovate: [],
            Hack2Skill: [],
            HackerEarth: [],
            Devpost: [],
            MLH: [],
            Other: [],
        };

        const seenIds = new Set<string>();

        // Process Overview Data first (guarantees something in every section)
        if (overviewData) {
            Object.keys(overviewData).forEach(platform => {
                overviewData[platform].forEach(h => {
                    if (!seenIds.has(h.id)) {
                        seenIds.add(h.id);
                        if (grouped[h.platform]) {
                            grouped[h.platform].push(h);
                        } else {
                            grouped.Other.push(h);
                        }
                    }
                });
            });
        }

        // Process Infinite Stream (adds more items as user scrolls)
        const allInfiniteRaw = infiniteData?.pages.flatMap(page => page) || [];
        allInfiniteRaw.forEach(h => {
            if (!seenIds.has(h.id)) {
                seenIds.add(h.id);
                if (grouped[h.platform]) {
                    grouped[h.platform].push(h);
                } else {
                    grouped.Other.push(h);
                }
            }
        });

        return grouped;
    }, [overviewData, infiniteData]);

    const totalCount = Object.values(hackathonsByPlatform).flat().length;

    // We only show full loading if BOTH are pending
    const isInitialLoading = overviewStatus === 'pending' && infiniteStatus === 'pending';
    const isError = overviewStatus === 'error' && infiniteStatus === 'error'; // Only hard error if both fail

    if (isInitialLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    Loading hackathons...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6">
                <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
                <p className="text-zinc-700 dark:text-zinc-300 font-medium mb-2">
                    Failed to load hackathons
                </p>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    if (totalCount === 0 && !isFetchingNextPage) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-zinc-400" />
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 font-medium mb-2">
                    No hackathons available
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center max-w-md">
                    Check back later for new opportunities.
                </p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 sm:gap-8 px-4 py-6 sm:px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Discover Hackathons
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                        {totalCount}+ hackathons available across platforms
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors self-start sm:self-auto"
                >
                    <RefreshCw className={`w-4 h-4 ${isFetchingNextPage ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Sections */}
            <div className="space-y-8">
                {sections.map((section) => {
                    const sectionHackathons = hackathonsByPlatform[section.platform] || [];

                    // Only render sections that have content or if it's the first load
                    if (sectionHackathons.length === 0) return null;

                    return (
                        <HackathonSection
                            key={section.title}
                            title={section.title}
                            hackathons={sectionHackathons}
                            onRegister={onRegister}
                        />
                    );
                })}
            </div>

            {/* Load More trigger */}
            <div ref={ref} className="flex justify-center py-8">
                {isFetchingNextPage ? (
                    <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                ) : hasNextPage ? (
                    <span className="text-sm text-zinc-400">Scroll for more...</span>
                ) : (
                    <span className="text-sm text-zinc-400">You've reached the end!</span>
                )}
            </div>
        </div>
    );
}
