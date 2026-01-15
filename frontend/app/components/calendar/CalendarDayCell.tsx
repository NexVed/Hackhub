'use client';

import { Hackathon } from '../../types/hackathon';
import { FlagshipHackathon } from '../../data/flagshipHackathons';
import EventPill from './EventPill';

interface CalendarEvent {
    event: Hackathon | FlagshipHackathon;
    isStart: boolean;
    isEnd: boolean;
    isMultiDay: boolean;
}

interface CalendarDayCellProps {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
    onEventClick: (event: Hackathon | FlagshipHackathon) => void;
}

const MAX_VISIBLE_EVENTS = 3;

export default function CalendarDayCell({
    date,
    isCurrentMonth,
    isToday,
    events,
    onEventClick
}: CalendarDayCellProps) {
    const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS);
    const remainingCount = events.length - MAX_VISIBLE_EVENTS;

    return (
        <div
            className={`
        min-h-[100px] p-1.5 border-b border-r border-zinc-200 dark:border-zinc-800 
        ${isCurrentMonth
                    ? 'bg-white dark:bg-zinc-900'
                    : 'bg-zinc-50 dark:bg-zinc-950'
                }
        ${isToday ? 'ring-2 ring-inset ring-violet-500' : ''}
        transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50
      `}
        >
            {/* Day number */}
            <div className="flex items-center justify-between mb-1">
                <span
                    className={`
            flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full
            ${isToday
                            ? 'bg-violet-600 text-white'
                            : isCurrentMonth
                                ? 'text-zinc-700 dark:text-zinc-300'
                                : 'text-zinc-400 dark:text-zinc-600'
                        }
          `}
                >
                    {date.getDate()}
                </span>
            </div>

            {/* Events */}
            <div className="space-y-0.5">
                {visibleEvents.map((calEvent, index) => (
                    <EventPill
                        key={`${calEvent.event.id}-${index}`}
                        event={calEvent.event}
                        onClick={() => onEventClick(calEvent.event)}
                    />
                ))}

                {/* More indicator */}
                {remainingCount > 0 && (
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 pl-1 font-medium">
                        +{remainingCount} more
                    </div>
                )}
            </div>
        </div>
    );
}

export type { CalendarEvent };
