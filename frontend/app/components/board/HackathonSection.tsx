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
        <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {title}
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        {hackathons.length}
                    </span>
                </h3>
                <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    View All
                </button>
            </div>

            <div className="relative group/slider">
                {/* Horizontal scroll container */}
                <div className="flex gap-4 overflow-x-auto pb-4 px-1 snap-x scrollbar-hide">
                    {hackathons.map((hackathon) => (
                        <div key={hackathon.id} className="snap-start">
                            <HackathonCard hackathon={hackathon} onRegister={onRegister} />
                        </div>
                    ))}
                </div>

                {/* Scroll fade masks */}
                <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity" />
            </div>
        </div>
    );
}
