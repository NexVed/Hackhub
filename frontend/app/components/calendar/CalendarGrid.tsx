'use client';

import { useState, useMemo } from 'react';
import { Hackathon } from '../../types/hackathon';
import { FlagshipHackathon, flagshipHackathons } from '../../data/flagshipHackathons';
import { mockHackathons } from '../../data/mockHackathons';
import CalendarDayCell, { CalendarEvent } from './CalendarDayCell';
import HackathonDetailModal from './HackathonDetailModal';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarGrid() {
    const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | FlagshipHackathon | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fixed year 2026 as per requirements
    const year = 2026;

    const generateDaysForMonth = (monthIndex: number) => {
        const firstDayOfMonth = new Date(year, monthIndex, 1);
        const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const days: (Date | null)[] = [];

        // Empty slots for previous month days (to align start of week)
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, monthIndex, i));
        }

        return days;
    };

    const allEvents = useMemo(() => {
        const regularEvents: (Hackathon | FlagshipHackathon)[] = [...mockHackathons];
        const flagshipEvents: (Hackathon | FlagshipHackathon)[] = flagshipHackathons.filter(h => h.startDate);
        return [...regularEvents, ...flagshipEvents];
    }, []);

    const getEventsForDay = (date: Date): CalendarEvent[] => {
        const dateStr = date.toLocaleDateString('en-CA');
        return allEvents
            .filter((event) => {
                const startDate = 'startDate' in event ? event.startDate : undefined;
                const endDate = 'endDate' in event ? event.endDate : startDate;
                if (!startDate) return false;
                return dateStr >= startDate && dateStr <= (endDate || startDate);
            })
            .map((event) => {
                const startDate = 'startDate' in event ? event.startDate : undefined;
                const endDate = 'endDate' in event ? event.endDate : startDate;
                return {
                    event,
                    isStart: dateStr === startDate,
                    isEnd: dateStr === endDate,
                    isMultiDay: startDate !== endDate,
                };
            });
    };

    const handleEventClick = (event: Hackathon | FlagshipHackathon) => {
        setSelectedHackathon(event);
        setIsModalOpen(true);
    };

    const today = new Date();
    const isToday = (date: Date) =>
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] text-zinc-200 rounded-xl overflow-hidden border border-zinc-800/50 shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-[#0a0a0c] border-b border-zinc-800/50 z-10 relative shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">{year} Calendar</h2>
                    <span className="text-xs font-medium text-zinc-500 px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">
                        Year View
                    </span>
                </div>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto bg-zinc-900/20 scroll-smooth">
                <div className="flex flex-col gap-12 p-6">
                    {MONTHS.map((monthName, monthIndex) => {
                        const days = generateDaysForMonth(monthIndex);

                        return (
                            <div key={monthName} className="flex flex-col gap-4">
                                {/* Month Sticky Header? Optional, let's keep it simple inline first */}
                                <h3 className="text-xl font-semibold text-zinc-100 pl-1 sticky top-0 bg-[#0a0a0c]/90 backdrop-blur-sm py-2 z-10 w-full border-b border-zinc-800/50">
                                    {monthName}
                                </h3>

                                {/* Weekday Headers (Repeated for clarity or just once at top? Repeated is better for long scroll) */}
                                <div className="grid grid-cols-7 mb-2">
                                    {WEEKDAYS.map(day => (
                                        <div key={day} className="text-center text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Month Grid */}
                                <div className="grid grid-cols-7 auto-rows-fr gap-px bg-zinc-800/30 border border-zinc-800/50 rounded-lg overflow-hidden">
                                    {/* Make sure we render exactly cells for the month grid */}
                                    {days.map((date, index) => {
                                        if (!date) {
                                            return <div key={`empty-${index}`} className="bg-[#0a0a0c]/50 min-h-[100px]" />;
                                        }
                                        return (
                                            <CalendarDayCell
                                                key={date.toISOString()}
                                                date={date}
                                                isCurrentMonth={true}
                                                isToday={isToday(date)}
                                                events={getEventsForDay(date)}
                                                onEventClick={handleEventClick}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            <HackathonDetailModal
                hackathon={selectedHackathon}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
