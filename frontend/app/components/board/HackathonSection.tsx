'use client';

import { Hackathon } from '../../types/hackathon';
import HackathonCard from './HackathonCard';

interface HackathonSectionProps {
    title: string;
    hackathons: Hackathon[];
    onRegister: (id: string) => void;
}

export default function HackathonSection({ title, hackathons, onRegister }: HackathonSectionProps) {
    if (hackathons.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 sm:gap-4 py-1 sm:py-2 overflow-hidden">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 sm:gap-2">
                    {title}
                    <span className="text-[10px] sm:text-xs font-normal text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 rounded-full">
                        {hackathons.length}
                    </span>
                </h3>
                <button className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    View All
                </button>
            </div>

            <div className="relative group/slider overflow-hidden">
                {/* Horizontal scroll container */}
                <div className="flex gap-4 overflow-x-auto pb-4 px-1 snap-x snap-mandatory scrollbar-hide -mx-1 px-1 sm:mx-0 sm:px-0">
                    {hackathons.map((hackathon, index) => (
                        <div key={`${hackathon.id}-${index}`} className="snap-start flex-shrink-0 first:pl-1 last:pr-1 sm:first:pl-0 sm:last:pr-0">
                            <HackathonCard hackathon={hackathon} onRegister={onRegister} />
                        </div>
                    ))}
                </div>

                {/* Scroll fade masks */}
                <div className="absolute top-0 right-0 bottom-4 w-8 sm:w-12 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity" />
            </div>
        </div>
    );
}
