'use client';

import { useState } from 'react';
import { ActivityDay } from '../../data/mockUserData';

interface ActivityHeatmapProps {
    data: ActivityDay[];
}

const CELL_SIZE = 12;
const CELL_GAP = 3;
const WEEKS_TO_SHOW = 52;
const ROW_HEIGHT = CELL_SIZE + CELL_GAP;

const levelColors = [
    'bg-zinc-100 dark:bg-zinc-800',
    'bg-emerald-200 dark:bg-emerald-900',
    'bg-emerald-400 dark:bg-emerald-700',
    'bg-emerald-500 dark:bg-emerald-500',
    'bg-emerald-600 dark:bg-emerald-400',
];

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

    // Group data by weeks
    const getWeeksData = () => {
        const weeks: ActivityDay[][] = [];
        const today = new Date();

        // Calculate start date: roughly 1 year ago
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (WEEKS_TO_SHOW * 7));

        // Adjust to start on Sunday
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);

        let currentWeek: ActivityDay[] = [];

        // Iterate day by day from startDate
        // Use a safety break to prevent infinite loops, cover ample range
        const maxDays = (WEEKS_TO_SHOW + 2) * 7;

        for (let i = 0; i < maxDays; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            // Stop if we have gone past today
            if (currentDate > today) break;

            // Use local date string YYYY-MM-DD to match the mock data format (e.g. '2026-01-15')
            // 'en-CA' prints YYYY-MM-DD in local time
            const dateStr = currentDate.toLocaleDateString('en-CA');

            const dayData = data.find(a => a.date === dateStr) || { date: dateStr, level: 0 as const };

            currentWeek.push(dayData);

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Push remaining partial week
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    };

    const weeks = getWeeksData();

    const handleMouseEnter = (e: React.MouseEvent, day: ActivityDay) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const date = new Date(day.date);
        // Be careful with parsing the date string "YYYY-MM-DD" back to Date
        // standard Date("YYYY-MM-DD") is UTC. We want to display it as is.
        // simpler: parse the parts manually or append T12:00:00 to force mid-day local roughly
        // actually, toLocaleDateString of a standard parsed "2024-01-01" will result in "Dec 31" if we are behind UTC.
        // user is +05:30 ahead, so "2024-01-01" (UTC) is "2024-01-01 05:30" (Local) -> Correct day.

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

    // Helper to check if a week starts a new month
    const isNewMonth = (weekIndex: number) => {
        if (weekIndex === 0) return true;
        const currentWeekStart = new Date(weeks[weekIndex][0].date);
        const prevWeekStart = new Date(weeks[weekIndex - 1][0].date);
        return currentWeekStart.getMonth() !== prevWeekStart.getMonth();
    };

    // Helper to get month label
    const getMonthLabel = (weekIndex: number) => {
        const date = new Date(weeks[weekIndex][0].date);
        return date.toLocaleDateString('en-US', { month: 'short' });
    };

    return (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
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

            <div className="flex">
                {/* Day labels (Fixed Left) */}
                {/* Matches the top offset of the grid cells (Label height 20px + margin 4px = 24px) */}
                <div className="flex flex-col pr-3 mt-[24px] text-[10px] text-zinc-400 dark:text-zinc-500 font-medium select-none">
                    {/* Sunday (Index 0) - Spacer */}
                    <div style={{ height: ROW_HEIGHT }} />

                    {/* Monday (Index 1) */}
                    <div style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
                        <span className="leading-none pt-[1px]">Mon</span>
                    </div>

                    {/* Tuesday (Index 2) - Spacer */}
                    <div style={{ height: ROW_HEIGHT }} />

                    {/* Wednesday (Index 3) */}
                    <div style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
                        <span className="leading-none pt-[1px]">Wed</span>
                    </div>

                    {/* Thursday (Index 4) - Spacer */}
                    <div style={{ height: ROW_HEIGHT }} />

                    {/* Friday (Index 5) */}
                    <div style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
                        <span className="leading-none pt-[1px]">Fri</span>
                    </div>
                </div>

                {/* Scrollable Container */}
                <div className="flex-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
                    {/* Gap between columns */}
                    <div className="flex min-w-max" style={{ gap: CELL_GAP }}>
                        {weeks.map((week, weekIndex) => {
                            const showMonthLabel = isNewMonth(weekIndex);

                            return (
                                <div
                                    key={weekIndex}
                                    className={`flex flex-col ${showMonthLabel && weekIndex !== 0 ? 'ml-6' : ''}`}
                                    style={{ gap: CELL_GAP }}
                                >
                                    {/* Month Label Header */}
                                    <div className="h-5 mb-1 relative">
                                        {showMonthLabel && (
                                            <span className="absolute bottom-0 left-0 text-xs text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                {getMonthLabel(weekIndex)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Grid Cells */}
                                    <div className="flex flex-col" style={{ gap: CELL_GAP }}>
                                        {week.map((day, dayIndex) => (
                                            <div
                                                key={`${weekIndex}-${dayIndex}`}
                                                className={`rounded-[2px] transition-colors duration-200 ${levelColors[day.level]} hover:ring-1 hover:ring-zinc-400 dark:hover:ring-zinc-600`}
                                                style={{ width: CELL_SIZE, height: CELL_SIZE }}
                                                onMouseEnter={(e) => handleMouseEnter(e, day)}
                                                onMouseLeave={handleMouseLeave}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
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
