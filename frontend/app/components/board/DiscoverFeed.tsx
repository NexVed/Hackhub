'use client';

import { Hackathon } from '../../types/hackathon';
import { mockHackathons } from '../../data/mockHackathons';
import HackathonSection from './HackathonSection';

interface DiscoverFeedProps {
    onRegister: (id: string) => void;
}

const sections: { title: string; platform: Hackathon['platform'] | 'All' }[] = [
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
    return (
        <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Discover Hackathons
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Explore and register for top hackathons across platforms
                    </p>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
                {sections.map((section) => {
                    const sectionHackathons = mockHackathons.filter(
                        (h) => h.platform === section.platform
                    );

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
