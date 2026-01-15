'use client';

import { FlagshipHackathon, getStatusColor, getStatusLabel } from '../../data/flagshipHackathons';
import { ExternalLink } from 'lucide-react';

interface FlagshipCardProps {
    hackathon: FlagshipHackathon;
}

export default function FlagshipCard({ hackathon }: FlagshipCardProps) {
    return (
        <a
            href={hackathon.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-400 dark:hover:border-violet-500 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
        >
            {/* Gradient accent border on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 transition-all duration-300" />

            <div className="relative p-4">
                {/* Header: Logo + Status */}
                <div className="flex items-start justify-between mb-3">
                    {/* Logo placeholder - using organizer initial as fallback */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 text-lg font-bold text-zinc-600 dark:text-zinc-300">
                        {hackathon.organizer.charAt(0)}
                    </div>

                    {/* Status pill */}
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(hackathon.status)} ${hackathon.status === 'live' ? 'animate-pulse' : ''}`}>
                        {getStatusLabel(hackathon.status)}
                    </span>
                </div>

                {/* Hackathon name */}
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {hackathon.name}
                </h3>

                {/* Organizer */}
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    {hackathon.organizer}
                </p>

                {/* Timeline */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                        {hackathon.timeline}
                    </span>

                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-500 transition-colors" />
                </div>
            </div>
        </a>
    );
}
