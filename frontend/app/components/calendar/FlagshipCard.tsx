'use client';

import { useState } from 'react';
import { FlagshipHackathon, getStatusColor, getStatusLabel } from '../../data/flagshipHackathons';
import { ExternalLink, Plus, Check, Loader2 } from 'lucide-react';
import BrandIcon from '../ui/BrandIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useUserHackathonsStore } from '@/lib/stores';

interface FlagshipCardProps {
    hackathon: FlagshipHackathon;
    onRegister?: () => void;
}

export default function FlagshipCard({ hackathon, onRegister }: FlagshipCardProps) {
    const { user } = useAuth();
    const { hackathons, addHackathon } = useUserHackathonsStore();
    const [registering, setRegistering] = useState(false);

    // Check if already registered using store data (no API call needed)
    const registered = hackathons.some(h => h.hackathon_id === hackathon.id);

    const handleRegister = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user?.id || registering || registered) {
            console.log('Skipping registration:', { userId: user?.id, registering, registered });
            return;
        }

        console.log('Starting registration for:', hackathon.name);
        setRegistering(true);
        try {
            // Use Zustand store's addHackathon so dashboard updates automatically
            const result = await addHackathon(user.id, {
                hackathon_id: hackathon.id,
                hackathon_name: hackathon.name,
                hackathon_url: hackathon.url,
                platform: hackathon.organizer,
                tags: [],
                start_date: hackathon.startDate,
                end_date: hackathon.endDate,
                status: 'planned',
            });

            console.log('Registration result:', result);

            if (result) {
                onRegister?.();
            } else {
                console.error('Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-400 dark:hover:border-violet-500 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
            {/* Gradient accent border on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 transition-all duration-300" />

            <div className="relative p-4">
                {/* Header: Logo + Status */}
                <div className="flex items-start justify-between mb-3">
                    {/* Brand logo using svgl icons */}
                    <BrandIcon organizer={hackathon.organizer} size="sm" />

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
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                    {hackathon.organizer}
                </p>

                {/* Timeline + Actions */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                        {hackathon.timeline}
                    </span>

                    <div className="flex items-center gap-2">
                        {/* Register button */}
                        {user && (
                            <button
                                onClick={handleRegister}
                                disabled={registering || registered}
                                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${registered
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50'
                                    }`}
                            >
                                {registering ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : registered ? (
                                    <Check className="w-3 h-3" />
                                ) : (
                                    <Plus className="w-3 h-3" />
                                )}
                                {registered ? 'Tracked' : 'Track'}
                            </button>
                        )}

                        {/* External link */}
                        <a
                            href={hackathon.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-500 transition-colors" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
