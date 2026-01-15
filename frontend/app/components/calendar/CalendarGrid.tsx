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

    // Navigate months
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Calculate calendar days
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const days: Date[] = [];

        // Previous month days to fill first week
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            days.push(new Date(year, month - 1, prevMonthLastDay - i));
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        // Next month days to complete 6 weeks (42 days)
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push(new Date(year, month + 1, i));
        }

        return days;
    }, [year, month]);

    // Combine all hackathons
    const allEvents = useMemo(() => {
        const regularEvents: (Hackathon | FlagshipHackathon)[] = [...mockHackathons];
        const flagshipEvents: (Hackathon | FlagshipHackathon)[] = flagshipHackathons.filter(h => h.startDate);
        return [...regularEvents, ...flagshipEvents];
    }, []);

    // Get events for a specific day
    const getEventsForDay = (date: Date): CalendarEvent[] => {
        const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format

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

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedHackathon(null);
    };

    const today = new Date();
    const isToday = (date: Date) =>
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    const isCurrentMonth = (date: Date) => date.getMonth() === month;

    const monthLabel = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="flex flex-col h-full">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {monthLabel}
                    </h2>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                        Today
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        aria-label="Next month"
                    >
                        <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-hidden">
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

            {/* Detail Modal */}
            <HackathonDetailModal
                hackathon={selectedHackathon}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
}
