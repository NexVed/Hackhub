'use client';

import { useState } from 'react';
import { Hackathon } from '../../types/hackathon';
import { getCountdown, getDaysUntilStart } from '../../data/mockHackathons';
import { Plus, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserHackathons, useRegisterForHackathon } from '@/hooks';

interface HackathonCardProps {
    hackathon: Hackathon;
    onRegister?: (id: string) => void;
}

const platformColors: Record<Hackathon['platform'], string> = {
    Unstop: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    Devfolio: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    Devnovate: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    Hack2Skill: 'bg-green-500/10 text-green-600 dark:text-green-400',
    HackerEarth: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    Devpost: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    MLH: 'bg-red-500/10 text-red-600 dark:text-red-400',
    Other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

const statusIndicators: Record<Hackathon['status'], { bg: string; label: string }> = {
    upcoming: { bg: 'bg-blue-500', label: 'Upcoming' },
    live: { bg: 'bg-green-500', label: 'Live' },
    'ending-soon': { bg: 'bg-orange-500', label: 'Ending Soon' },
};

export default function HackathonCard({ hackathon, onRegister }: HackathonCardProps) {
    const { user } = useAuth();

    // Use TanStack Query for user hackathons (auto-fetches & caches)
    const { data: userHackathons = [] } = useUserHackathons(user?.id);

    // Use TanStack Query mutation for registration (optimistic updates built-in)
    const registerMutation = useRegisterForHackathon();

    // Check if already registered using cached query data
    const registered = userHackathons.some(h => h.hackathon_id === hackathon.id);

    // Combines mutation pending state with optimistic registered check
    const isRegistering = registerMutation.isPending &&
        registerMutation.variables?.hackathon.hackathon_id === hackathon.id;

    const handleRegister = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user?.id || registerMutation.isPending || registered) return;

        // Use TanStack Query mutation - optimistic update happens immediately
        registerMutation.mutate(
            {
                userId: user.id,
                hackathon: {
                    hackathon_id: hackathon.id,
                    hackathon_name: hackathon.name,
                    hackathon_url: hackathon.url,
                    platform: hackathon.platform,
                    tags: hackathon.tags || [],
                    start_date: hackathon.startDate,
                    end_date: hackathon.endDate,
                    status: 'planned',
                },
            },
            {
                onSuccess: (result) => {
                    if (result.success) {
                        onRegister?.(hackathon.id);
                    }
                },
            }
        );
    };

    const handleClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) {
            e.preventDefault();
            return;
        }
        window.open(hackathon.url, '_blank', 'noopener,noreferrer');
    };

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    };

    const getTimeIndicator = () => {
        if (hackathon.status === 'upcoming') {
            return getDaysUntilStart(hackathon.startDate);
        }
        return getCountdown(hackathon.endDate);
    };

    return (
        <div
            onClick={handleClick}
            className="group relative flex-none w-[300px] bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-1"
        >
            {/* Header: Platform & Time */}
            <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${platformColors[hackathon.platform] || platformColors.Other}`}>
                    {hackathon.platform}
                </span>
                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusIndicators[hackathon.status].bg} animate-pulse`} />
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                        {getTimeIndicator()}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {hackathon.name}
                </h3>

                {hackathon.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 h-[2.5em]">
                        {hackathon.description}
                    </p>
                )}

                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                    {formatDateRange(hackathon.startDate, hackathon.endDate)}
                </p>
            </div>

            {/* Footer: Tags & Action */}
            <div className="flex items-end justify-between gap-2 mt-auto">
                <div className="flex flex-wrap gap-1 flex-1">
                    {hackathon.tags.slice(0, 2).map((tag, index) => (
                        <span
                            key={`${tag}-${index}`}
                            className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded border border-zinc-200 dark:border-zinc-700"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Track/Register button */}
                {user ? (
                    <button
                        onClick={handleRegister}
                        disabled={isRegistering || registered}
                        className={`flex-none flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm ${registered
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900'
                            }`}
                    >
                        {registered ? (
                            <Check className="w-3 h-3" />
                        ) : isRegistering ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Plus className="w-3 h-3" />
                        )}
                        <span>{registered ? 'Tracked' : 'Track'}</span>
                    </button>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(hackathon.url, '_blank', 'noopener,noreferrer');
                        }}
                        className="flex-none flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                        <span>Register</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
