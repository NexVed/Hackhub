'use client';

import { UserHackathon } from '../../types/hackathon';
import { getCountdown } from '../../data/mockHackathons';

interface UserHackathonCardProps {
    hackathon: UserHackathon;
    onDragStart: (e: React.DragEvent, hackathon: UserHackathon) => void;
    onProgressUpdate?: (id: string, progress: number) => void;
}

const platformColors: Record<UserHackathon['platform'], string> = {
    Unstop: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    Devfolio: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    Devnovate: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    Hack2Skill: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    MLH: 'bg-red-500/10 text-red-600 dark:text-red-400',
    Devpost: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    HackerEarth: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    Other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

const userStatusColors: Record<UserHackathon['userStatus'], string> = {
    planned: 'border-l-blue-500',
    active: 'border-l-green-500',
    submitted: 'border-l-amber-500',
    completed: 'border-l-purple-500',
};

export default function UserHackathonCard({ hackathon, onDragStart, onProgressUpdate }: UserHackathonCardProps) {
    const handleClick = (e: React.MouseEvent) => {
        if (e.defaultPrevented) return;
        window.open(hackathon.url, '_blank', 'noopener,noreferrer');
    };

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    };

    const completedMilestones = hackathon.milestones.filter((m) => m.completed).length;
    const totalMilestones = hackathon.milestones.length;

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, hackathon)}
            onClick={handleClick}
            className={`group relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 border-l-4 ${userStatusColors[hackathon.userStatus]} p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5 active:cursor-grabbing`}
        >
            {/* Drag indicator */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
                <svg className="w-3 h-6 text-zinc-400" viewBox="0 0 6 16" fill="currentColor">
                    <circle cx="1.5" cy="2" r="1.5" />
                    <circle cx="4.5" cy="2" r="1.5" />
                    <circle cx="1.5" cy="8" r="1.5" />
                    <circle cx="4.5" cy="8" r="1.5" />
                    <circle cx="1.5" cy="14" r="1.5" />
                    <circle cx="4.5" cy="14" r="1.5" />
                </svg>
            </div>

            {/* Header row */}
            <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {getCountdown(hackathon.endDate)}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${platformColors[hackathon.platform]}`}>
                    {hackathon.platform}
                </span>
            </div>

            {/* Hackathon name */}
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1 pr-2 line-clamp-2">
                {hackathon.name}
            </h3>

            {/* Date range */}
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                {formatDateRange(hackathon.startDate, hackathon.endDate)}
            </p>

            {/* Progress bar */}
            <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Progress</span>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{hackathon.progress}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${hackathon.progress}%` }}
                    />
                </div>
            </div>

            {/* Milestones preview */}
            {totalMilestones > 0 && (
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {completedMilestones} of {totalMilestones} milestones
                    </span>
                </div>
            )}

            {/* Tech tags */}
            <div className="flex flex-wrap gap-1.5">
                {hackathon.tags.slice(0, 3).map((tag, index) => (
                    <span
                        key={`${tag}-${index}`}
                        className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* External link indicator */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity">
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </div>
        </div>
    );
}
