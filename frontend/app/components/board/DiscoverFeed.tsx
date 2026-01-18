'use client';

import { useState, useEffect } from 'react';
import { Hackathon } from '../../types/hackathon';
import { getHackathonsGroupedByPlatform } from '@/lib/scrapedHackathonService';
import HackathonSection from './HackathonSection';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface DiscoverFeedProps {
    onRegister: (id: string) => void;
}

const sections: { title: string; platform: Hackathon['platform'] }[] = [
    { title: 'Unstop Hackathons', platform: 'Unstop' },
    { title: 'Devfolio Hackathons', platform: 'Devfolio' },
    { title: 'Devnovate Challenges', platform: 'Devnovate' },
    { title: 'Hack2Skill Events', platform: 'Hack2Skill' },
    { title: 'HackerEarth Challenges', platform: 'HackerEarth' },
    { title: 'Devpost Hackathons', platform: 'Devpost' },
    { title: 'Major League Hacking', platform: 'MLH' },
    { title: 'Other Opportunities', platform: 'Other' },
];

export default function DiscoverFeed({ onRegister }: DiscoverFeedProps) {
    const [hackathonsByPlatform, setHackathonsByPlatform] = useState<Record<string, Hackathon[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHackathons = async () => {
        try {
            setLoading(true);
            setError(null);
            const grouped = await getHackathonsGroupedByPlatform();
            setHackathonsByPlatform(grouped);
        } catch (err) {
            console.error('Failed to fetch hackathons:', err);
            setError('Failed to load hackathons. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHackathons();
    }, []);

    // Calculate total count
    const totalCount = Object.values(hackathonsByPlatform).reduce(
        (sum, arr) => sum + arr.length,
        0
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    Loading hackathons...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6">
                <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
                <p className="text-zinc-700 dark:text-zinc-300 font-medium mb-2">
                    {error}
                </p>
                <button
                    onClick={fetchHackathons}
                    className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    if (totalCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-zinc-400" />
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 font-medium mb-2">
                    No hackathons found
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center max-w-md">
                    We couldn't find any hackathons at the moment. Check back later or refresh the page.
                </p>
                <button
                    onClick={fetchHackathons}
                    className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Discover Hackathons
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {totalCount} hackathons available across platforms
                    </p>
                </div>
                <button
                    onClick={fetchHackathons}
                    className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Sections */}
            <div className="space-y-8">
                {sections.map((section) => {
                    const sectionHackathons = hackathonsByPlatform[section.platform] || [];

                    return (
                        <HackathonSection
                            key={section.title}
                            title={section.title}
                            hackathons={sectionHackathons}
                            onRegister={onRegister}
                        />
                    );
                })}
            </div>
        </div>
    );
}
