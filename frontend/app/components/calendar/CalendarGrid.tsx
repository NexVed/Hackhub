'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Hackathon } from '../../types/hackathon';
import { FlagshipHackathon, flagshipHackathons } from '../../data/flagshipHackathons';
import { mockHackathons } from '../../data/mockHackathons';
import CalendarDayCell, { CalendarEvent } from './CalendarDayCell';
import HackathonDetailModal from './HackathonDetailModal';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | FlagshipHackathon | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const days: Date[] = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            days.push(new Date(year, month - 1, prevMonthLastDay - i));
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        // Next month days (fill up to 42)
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push(new Date(year, month + 1, i));
        }

        return days;
    }, [year, month]);

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

    const isCurrentMonth = (date: Date) => date.getMonth() === month;

    const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] text-zinc-200 rounded-xl overflow-hidden border border-zinc-800/50 shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-[#0a0a0c] border-b border-zinc-800/50">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">{monthLabel}</h2>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-md transition-all"
                    >
                        Today
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={goToPreviousMonth} className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={goToNextMonth} className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-zinc-800/50 bg-[#0a0a0c]">
                {WEEKDAYS.map(day => (
                    <div key={day} className="py-3 text-center text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 bg-zinc-900/20">
                {calendarDays.map((date, index) => (
                    <CalendarDayCell
                        key={index}
                        date={date}
                        isCurrentMonth={isCurrentMonth(date)}
                        isToday={isToday(date)}
                        events={getEventsForDay(date)}
                        onEventClick={handleEventClick}
                    />
                ))}
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
