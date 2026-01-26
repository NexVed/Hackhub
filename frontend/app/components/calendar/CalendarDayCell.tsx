'use client';

import { Hackathon } from '../../types/hackathon';
import { FlagshipHackathon } from '../../data/flagshipHackathons';

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

export default function CalendarDayCell({
    date,
    isCurrentMonth,
    isToday,
    events,
    onEventClick
}: CalendarDayCellProps) {
    // Show up to 4 events per day to maximize info
    const MAX_VISIBLE = 4;
    const visibleEvents = events.slice(0, MAX_VISIBLE);
    const remainingCount = events.length - MAX_VISIBLE;

    // Mobile/Compact View Helper
    const getEventStyle = (name: string) => {
        const lower = name.toLowerCase();

        if (lower.includes('weekly') || lower.includes('biweekly')) {
            return {
                border: 'border-l-2 border-amber-500',
                bg: 'bg-amber-950/30 hover:bg-amber-950/50',
                text: 'text-amber-100',
            };
        }
        if (lower.includes('edu round') || lower.includes('div') || lower.includes('hello')) {
            return {
                border: 'border-l-2 border-blue-500',
                bg: 'bg-blue-950/30 hover:bg-blue-950/50',
                text: 'text-blue-100',
            };
        }
        if (lower.includes('starters') || lower.includes('cook') || lower.includes('icpc')) {
            return {
                border: 'border-l-2 border-rose-500',
                bg: 'bg-rose-950/30 hover:bg-rose-950/50',
                text: 'text-rose-100',
            };
        }
        if (lower.includes('beginner') || lower.includes('regular')) {
            return {
                border: 'border-l-2 border-violet-500',
                bg: 'bg-violet-950/30 hover:bg-violet-950/50',
                text: 'text-violet-100',
            };
        }

        if (lower.includes('aws') || lower.includes('deepracer')) {
            return {
                border: 'border-l-2 border-indigo-500',
                bg: 'bg-indigo-950/30 hover:bg-indigo-950/50',
                text: 'text-indigo-100',
            };
        }

        return {
            border: 'border-l-2 border-zinc-500',
            bg: 'bg-zinc-800/50 hover:bg-zinc-800',
            text: 'text-zinc-200',
        };
    };

    return (
        <div
            className={`
                min-h-[160px] p-2.5 border-r border-b border-zinc-800/60 flex flex-col gap-2 relative group
                ${isCurrentMonth ? 'bg-[#0a0a0c]' : 'bg-[#050505]'} 
                transition-all duration-200
            `}
        >
            {/* Day Header */}
            <div className="flex justify-center mb-1">
                {/* Current day highlight */}
                <span className={`
                    w-7 h-7 flex items-center justify-center text-sm font-medium rounded-sm
                    ${isToday
                        ? 'bg-[#0ea5e9] text-white'
                        : isCurrentMonth ? 'text-zinc-400' : 'text-zinc-700'}
                `}>
                    {date.getDate()}
                </span>
            </div>

            {/* Events List */}
            <div className="flex flex-col gap-1.5 w-full">
                {visibleEvents.map((calEvent, i) => {
                    const style = getEventStyle(calEvent.event.name);

                    return (
                        <button
                            key={i}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(calEvent.event);
                            }}
                            className={`
                                flex items-center px-2.5 py-1.5 rounded-[4px]
                                ${style.bg} ${style.border}
                                text-xs font-medium text-left w-full
                                transition-all hover:translate-x-0.5
                                shadow-sm
                            `}
                            title={calEvent.event.name}
                        >
                            <span className={`truncate ${style.text}`}>
                                {calEvent.event.name}
                            </span>
                        </button>
                    );
                })}
                {remainingCount > 0 && (
                    <span className="text-[10px] text-zinc-500 text-center font-medium mt-0.5">
                        +{remainingCount} more
                    </span>
                )}
            </div>
        </div>
    );
}

export type { CalendarEvent };
