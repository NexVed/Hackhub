'use client';

import { useState, useMemo } from 'react';
import { ActivityDay } from '@/lib/activityService';

interface ActivityHeatmapProps {
    data: ActivityDay[];
    loading?: boolean;
}

const CELL_SIZE = 11;
const CELL_GAP = 2;

const levelColors = [
    'bg-zinc-100 dark:bg-zinc-800',
    'bg-emerald-200 dark:bg-emerald-900',
    'bg-emerald-400 dark:bg-emerald-700',
    'bg-emerald-500 dark:bg-emerald-500',
    'bg-emerald-600 dark:bg-emerald-400',
];

interface CalendarDay {
    date: string;
    level: 0 | 1 | 2 | 3 | 4;
    description?: string;
    month: number;
    dayOfMonth: number;
}

export default function ActivityHeatmap({ data, loading = false }: ActivityHeatmapProps) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

    // Build calendar data - exactly 53 weeks like GitHub/LeetCode
    const { weeks, monthLabels } = useMemo(() => {
        const today = new Date();
        // Use UTC noon to properly align with DB dates (which are YYYY-MM-DD stored as UTC)
        today.setUTCHours(12, 0, 0, 0);

        // Start from 52 weeks ago
        const startDate = new Date(today);
        startDate.setUTCDate(today.getUTCDate() - 364);

        // Adjust to start from the nearest Sunday (going back)
        const dayOfWeek = startDate.getUTCDay();
        startDate.setUTCDate(startDate.getUTCDate() - dayOfWeek);

        const weeksData: CalendarDay[][] = [];
        const monthPositions: { month: string; weekIndex: number }[] = [];

        let currentMonth = -1;
        let currentDate = new Date(startDate);

        // Generate all weeks
        while (currentDate <= today) {
            const week: CalendarDay[] = [];

            for (let day = 0; day < 7; day++) {
                if (currentDate > today) {
                    // Future dates - add empty placeholder
                    week.push({
                        date: '',
                        level: 0,
                        month: -1,
                        dayOfMonth: 0
                    });
                } else {
                    const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD UTC
                    const month = currentDate.getUTCMonth();
                    const dayOfMonth = currentDate.getUTCDate();

                    // Check for new month at the start of a week
                    if (day === 0 && month !== currentMonth) {
                        currentMonth = month;
                        monthPositions.push({
                            month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
                            weekIndex: weeksData.length
                        });
                    }

                    // Also check if 1st of month appears mid-week
                    if (dayOfMonth === 1 && day > 0 && month !== currentMonth) {
                        currentMonth = month;
                        monthPositions.push({
                            month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
                            weekIndex: weeksData.length
                        });
                    }

                    // Find matching activity data
                    const activityData = data.find(a => a.date === dateStr);

                    week.push({
                        date: dateStr,
                        level: activityData?.level || 0,
                        description: activityData?.description,
                        month,
                        dayOfMonth
                    });
                }

                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }

            weeksData.push(week);
        }

        return { weeks: weeksData, monthLabels: monthPositions };
    }, [data]);

    const handleMouseEnter = (e: React.MouseEvent, day: CalendarDay) => {
        if (!day.date) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const date = new Date(day.date + 'T12:00:00');

        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            content: day.description
                ? `${formattedDate}: ${day.description}`
                : `${formattedDate}: No activity`,
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    if (loading) {
        return (
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="animate-pulse">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-20 mb-4"></div>
                    <div className="h-24 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Activity</h3>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span>Less</span>
                    {levelColors.map((color, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-sm ${color}`}
                        />
                    ))}
                    <span>More</span>
                </div>
            </div>

            {/* Month Labels Row */}
            <div className="flex mb-1 ml-8">
                <div className="flex" style={{ gap: CELL_GAP }}>
                    {weeks.map((_, weekIndex) => {
                        const monthInfo = monthLabels.find(m => m.weekIndex === weekIndex);
                        return (
                            <div
                                key={weekIndex}
                                style={{ width: CELL_SIZE }}
                                className="text-[10px] text-zinc-500 dark:text-zinc-400"
                            >
                                {monthInfo?.month || ''}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex">
                {/* Day Labels */}
                <div className="flex flex-col text-[10px] text-zinc-400 dark:text-zinc-500 pr-2">
                    <div style={{ height: CELL_SIZE + CELL_GAP }}></div>
                    <div style={{ height: CELL_SIZE + CELL_GAP }} className="flex items-center">Mon</div>
                    <div style={{ height: CELL_SIZE + CELL_GAP }}></div>
                    <div style={{ height: CELL_SIZE + CELL_GAP }} className="flex items-center">Wed</div>
                    <div style={{ height: CELL_SIZE + CELL_GAP }}></div>
                    <div style={{ height: CELL_SIZE + CELL_GAP }} className="flex items-center">Fri</div>
                    <div style={{ height: CELL_SIZE + CELL_GAP }}></div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-x-auto">
                    <div className="flex" style={{ gap: CELL_GAP }}>
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col" style={{ gap: CELL_GAP }}>
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={`${weekIndex}-${dayIndex}`}
                                        className={`rounded-sm transition-all duration-150 ${day.date
                                            ? `${levelColors[day.level]} cursor-pointer hover:ring-1 hover:ring-zinc-400 dark:hover:ring-zinc-500`
                                            : 'bg-transparent'
                                            }`}
                                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                                        onMouseLeave={handleMouseLeave}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded-md shadow-lg pointer-events-none whitespace-nowrap"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    {tooltip.content}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100"
                    />
                </div>
            )}
        </div>
    );
}
