'use client';

import { UserHackathonWorkflow } from '../../data/mockUserData';
import { X } from 'lucide-react';

interface WorkflowCardProps {
    hackathon: UserHackathonWorkflow;
    onDragStart: (e: React.DragEvent, hackathon: UserHackathonWorkflow) => void;
    onRemove?: (id: string) => void;
}

const platformColors: Record<string, string> = {
    Devfolio: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    MLH: 'bg-red-500/10 text-red-600 dark:text-red-400',
    Devpost: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    HackerEarth: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    Other: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
};

const resultBadges: Record<string, string> = {
    Winner: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    Finalist: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    Participated: 'bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border-zinc-500/30',
};

export default function WorkflowCard({ hackathon, onDragStart, onRemove }: WorkflowCardProps) {
    const formatDateRange = (start: string, end: string) => {
        if (!start || !end) return 'TBD';
        const startDate = new Date(start);
        const endDate = new Date(end);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    };

    const handleClick = () => {
        if (hackathon.url) {
            window.open(hackathon.url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onRemove) {
            onRemove(hackathon.id);
        }
    };

    const isPlanned = hackathon.status === 'planned';
    const isCompleted = hackathon.status === 'completed';
    const isActive = hackathon.status === 'active';

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, hackathon)}
            onClick={handleClick}
            className={`group relative rounded-lg border p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:cursor-grabbing ${isCompleted
                ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 opacity-80 hover:opacity-100'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
        >
            {/* Drag indicator */}
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
                <svg className="w-3 h-6 text-zinc-400" viewBox="0 0 6 16" fill="currentColor">
                    <circle cx="1.5" cy="2" r="1.5" />
                    <circle cx="4.5" cy="2" r="1.5" />
                    <circle cx="1.5" cy="8" r="1.5" />
                    <circle cx="4.5" cy="8" r="1.5" />
                    <circle cx="1.5" cy="14" r="1.5" />
                    <circle cx="4.5" cy="14" r="1.5" />
                </svg>
            </div>

            {/* Remove button for planned hackathons */}
            {isPlanned && onRemove && (
                <button
                    onClick={handleRemove}
                    className="absolute top-2 right-2 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all z-10"
                    title="Remove from tracking"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${platformColors[hackathon.platform] || platformColors.Other}`}>
                    {hackathon.platform || 'Other'}
                </span>
                {isCompleted && hackathon.result && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${resultBadges[hackathon.result]}`}>
                        {hackathon.result}
                    </span>
                )}
            </div>

            {/* Name */}
            <h4 className={`font-medium mb-1 line-clamp-2 ${isCompleted ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                }`}>
                {hackathon.name}
            </h4>

            {/* Date */}
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                {formatDateRange(hackathon.startDate, hackathon.endDate)}
            </p>

            {/* Progress bar for active */}
            {isActive && hackathon.progress !== undefined && (
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
            )}

            {/* Tags */}
            {hackathon.tags && hackathon.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {hackathon.tags.slice(0, 2).map((tag, index) => (
                        <span
                            key={`${tag}-${index}`}
                            className={`text-xs px-2 py-0.5 rounded ${isCompleted
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                                }`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* External link indicator */}
            {hackathon.url && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity">
                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </div>
            )}
        </div>
    );
}
