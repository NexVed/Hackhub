'use client';

import { X, ExternalLink, Calendar, Building2, Tag } from 'lucide-react';
import { Hackathon } from '../../types/hackathon';
import { FlagshipHackathon, getStatusColor, getStatusLabel } from '../../data/flagshipHackathons';

interface HackathonDetailModalProps {
    hackathon: Hackathon | FlagshipHackathon | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function HackathonDetailModal({ hackathon, isOpen, onClose }: HackathonDetailModalProps) {
    if (!isOpen || !hackathon) return null;

    const isFlagship = 'isFlagship' in hackathon && hackathon.isFlagship;
    const organizer = 'organizer' in hackathon ? hackathon.organizer : hackathon.platform;
    const status = 'status' in hackathon ? hackathon.status : 'upcoming';
    const tags = 'tags' in hackathon ? hackathon.tags : [];
    const description = 'description' in hackathon ? hackathon.description : undefined;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border ${isFlagship ? 'border-violet-300 dark:border-violet-700' : 'border-zinc-200 dark:border-zinc-800'} overflow-hidden`}>
                {/* Gradient header for flagship */}
                {isFlagship && (
                    <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
                )}

                <div className="p-6">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                        {/* Logo placeholder */}
                        <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${isFlagship ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600'} text-xl font-bold text-white`}>
                            {organizer.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0 pr-8">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                                {hackathon.name}
                            </h2>
                            <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(status as 'upcoming' | 'open' | 'live')}`}>
                                {getStatusLabel(status as 'upcoming' | 'open' | 'live')}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                        {/* Organizer */}
                        <div className="flex items-center gap-3 text-sm">
                            <Building2 className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-600 dark:text-zinc-400">
                                Organized by <span className="font-medium text-zinc-900 dark:text-zinc-100">{organizer}</span>
                            </span>
                        </div>

                        {/* Dates */}
                        {'startDate' in hackathon && hackathon.startDate && (
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="w-4 h-4 text-zinc-400" />
                                <span className="text-zinc-600 dark:text-zinc-400">
                                    {formatDate(hackathon.startDate)}
                                    {('endDate' in hackathon && hackathon.endDate && hackathon.endDate !== hackathon.startDate) && (
                                        <> — {formatDate(hackathon.endDate)}</>
                                    )}
                                </span>
                            </div>
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex items-start gap-3 text-sm">
                                <Tag className="w-4 h-4 text-zinc-400 mt-0.5" />
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action button */}
                    <a
                        href={hackathon.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${isFlagship
                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20'
                                : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                            }`}
                    >
                        Visit Official Site
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}
