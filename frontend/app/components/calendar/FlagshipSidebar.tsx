'use client';

import { Star } from 'lucide-react';
import { flagshipHackathons } from '../../data/flagshipHackathons';
import FlagshipCard from './FlagshipCard';

export default function FlagshipSidebar() {
    return (
        <aside className="w-80 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900/50 border-l border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden">
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
                            Top-tier global events
                        </p>
                    </div>
                </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
                {flagshipHackathons.map((hackathon) => (
                    <FlagshipCard key={hackathon.id} hackathon={hackathon} />
                ))}
            </div>

            {/* Footer hint */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/30">
                <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                    Don't miss these high-impact opportunities
                </p>
            </div>
        </aside>
    );
}
