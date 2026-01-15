'use client';

import { Hackathon } from '../../types/hackathon';
import { FlagshipHackathon } from '../../data/flagshipHackathons';

interface EventPillProps {
    event: Hackathon | FlagshipHackathon;
    onClick: () => void;
}

export default function EventPill({ event, onClick }: EventPillProps) {
    const isFlagship = 'isFlagship' in event && event.isFlagship;

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`
        w-full text-left text-[10px] px-1.5 py-0.5 rounded truncate font-medium transition-all duration-200
        ${isFlagship
                    ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-600 hover:from-violet-500/30 hover:to-purple-500/30'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                }
      `}
            title={event.name}
        >
            {event.name}
        </button>
    );
}
