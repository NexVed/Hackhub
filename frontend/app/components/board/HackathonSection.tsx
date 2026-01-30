'use client';

import React from 'react';

import { Hackathon } from '../../types/hackathon';
import HackathonCard from './HackathonCard';

interface HackathonSectionProps {
    title: string;
    hackathons: Hackathon[];
    onRegister: (id: string) => void;
}

export default function HackathonSection({ title, hackathons, onRegister }: HackathonSectionProps) {
    // Optimization: Limit initial rendering to 15 items to prevent lag
    // If the user wants to see more, we can implement a "Load More" or navigate to a dedicated page.
    // For now, let's just show top 15 and handle "View All".
    const [showAll, setShowAll] = React.useState(false);
    const LIMIT = 15;

    // If we have more than LIMIT, and not showing all, slice it.
    const displayedHackathons = showAll ? hackathons : hackathons.slice(0, LIMIT);
    const hasMore = hackathons.length > LIMIT;

    if (hackathons.length === 0) return null;

    return (
        <div className="flex flex-col gap-4 py-2 overflow-hidden">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {title}
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        {hackathons.length}
                    </span>
                </h3>
                {hasMore && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {showAll ? 'Show Less' : 'View All'}
                    </button>
                )}
            </div>

            <div className="relative group/slider overflow-hidden -mx-4 sm:mx-0">
                {/* Horizontal scroll container */}
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 sm:px-1 snap-x snap-mandatory scrollbar-hide">
                    {displayedHackathons.map((hackathon, index) => (
                        <div key={`${hackathon.id}-${index}`} className="snap-start shrink-0 first:ml-0 sm:first:ml-0">
                            <HackathonCard hackathon={hackathon} onRegister={onRegister} />
                        </div>
                    ))}

                    {/* View More Card if hidden */}
                    {!showAll && hasMore && (
                        <div className="snap-start shrink-0 h-full flex items-center justify-center">
                            <button
                                onClick={() => setShowAll(true)}
                                className="w-[100px] h-[300px] flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-blue-600 hover:border-blue-500 transition-colors"
                            >
                                <span className="text-sm font-medium">View {hackathons.length - LIMIT} more</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Scroll fade masks - hidden on mobile for cleaner look */}
                <div className="hidden sm:block absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-zinc-100 dark:from-zinc-950 to-transparent pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity" />
            </div>
        </div>
    );
}
