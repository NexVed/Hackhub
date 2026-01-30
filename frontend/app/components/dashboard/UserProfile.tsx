'use client';

import { UserProfile } from '../../data/mockUserData';
import React from 'react';
import { GitHubDark, LinkedIn, XDark, Instagram, ThreadsDark } from '@ridemountainpig/svgl-react';

interface UserProfileProps {
    user: UserProfile;
}

const SocialIcon = ({ type, url }: { type: string; url: string }) => {
    const iconComponents: Record<string, React.ReactNode> = {
        github: <GitHubDark className="w-5 h-5 invert dark:invert-0" />,
        linkedin: <LinkedIn className="w-5 h-5" />,
        twitter: <XDark className="w-5 h-5 invert dark:invert-0" />,
        instagram: <Instagram className="w-5 h-5" />,
        threads: <ThreadsDark className="w-5 h-5 invert dark:invert-0" />,
    };

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
            {iconComponents[type]}
        </a>
    );
};

export default function UserProfileComponent({ user }: UserProfileProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 p-0.5">
                    <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full bg-white dark:bg-zinc-900 object-cover"
                    />
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-2 mb-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                        {user.name}
                    </h2>
                    <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                        {user.username}
                    </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-3 sm:mb-4 line-clamp-2">
                    {user.bio}
                </p>

                {/* Social Links */}
                <div className="flex items-center justify-center sm:justify-start gap-1">
                    {user.social.github && <SocialIcon type="github" url={user.social.github} />}
                    {user.social.linkedin && <SocialIcon type="linkedin" url={user.social.linkedin} />}
                    {user.social.twitter && <SocialIcon type="twitter" url={user.social.twitter} />}
                    {user.social.instagram && <SocialIcon type="instagram" url={user.social.instagram} />}
                    {user.social.threads && <SocialIcon type="threads" url={user.social.threads} />}
                </div>
            </div>
        </div>
    );
}
