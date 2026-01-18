'use client';

import React from 'react';
import Image from 'next/image';
import {
    Google,
    Microsoft,
    Meta,
    AmazonWebServicesDark,
    NVIDIADark,
    Adobe,
    Ethereum,
} from '@ridemountainpig/svgl-react';

// Map organizer names to their corresponding svgl icons
const brandIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // MNC Tech Giants
    'Google': Google,
    'Google Developers + DSC': Google,
    'Google Cloud': Google,
    'Microsoft': Microsoft,
    'Meta': Meta,
    'Meta (Facebook)': Meta,
    'Amazon Web Services': AmazonWebServicesDark,
    'Amazon': AmazonWebServicesDark,
    'NVIDIA + AI Nation': NVIDIADark,
    'Adobe': Adobe,

    // Web3/Crypto
    'Ethereum Foundation': Ethereum,

    // AI Research (using Meta for NeurIPS partnership)
    'NeurIPS + Meta AI': Meta,
};

// Local logos from public/hackathons folder
const localLogoMap: Record<string, string> = {
    // India Government - matching database organizer names
    'Ministry of Education + AICTE': '/hackathons/SIH.jpg',
    'Government of India': '/hackathons/SIH.jpg',
    'AICTE + MeitY': '/hackathons/AICTE.png',
    'NITI Aayog': '/hackathons/Atal_Innovation_Mission_logo.png',
    'NITI Aayog (Atal Innovation Mission)': '/hackathons/Atal_Innovation_Mission_logo.png',
    'DRDO': '/hackathons/DRDO.jpg',
    'DRDO (Defence R&D Organisation)': '/hackathons/DRDO.jpg',

    // US Government - matching database organizer names
    'U.S. General Services Administration': '/hackathons/GSA.png',
    'U.S. GSA': '/hackathons/GSA.png',
    'U.S. Department of Treasury': '/hackathons/U.S tresury fintech.png',
    'U.S. Dept of Treasury': '/hackathons/U.S tresury fintech.png',
    'U.S. Department of Energy': '/hackathons/DOE.png',
    'U.S. Dept of Energy': '/hackathons/DOE.png',

    // MNC
    'Walmart': '/hackathons/walmart.png',
};

// Simple Icons CDN fallback for brands not in svgl or local
// Format: https://cdn.simpleicons.org/{slug}
const simpleIconsMap: Record<string, string> = {
    // MNC Tech Giants (fallbacks)
    'Samsung': 'samsung',
    'American Express': 'americanexpress',

    // Hackathon Platforms
    'Major League Hacking': 'majorleaguehacking',

    // Government / Space Agencies
    'NASA + ESA + JAXA': 'nasa',
    'ISRO + IN-SPACE': 'isro',
};

interface BrandIconProps {
    organizer: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

// Organizers that use Dark-variant icons (White by default)
const darkIcons = new Set([
    'Amazon Web Services',
    'Amazon',
    'NVIDIA + AI Nation'
]);

export default function BrandIcon({ organizer, size = 'md', className = '' }: BrandIconProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
    };

    const sizePx = {
        sm: 24,
        md: 32,
        lg: 40,
    };

    // Check if we have an svgl icon
    const IconComponent = brandIconMap[organizer];
    if (IconComponent) {
        const isDarkIcon = darkIcons.has(organizer);
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <IconComponent
                    className={`${sizeClasses[size]} ${isDarkIcon ? 'invert dark:invert-0' : ''}`}
                />
            </div>
        );
    }

    // Check if we have a local logo in public/hackathons
    const localLogoPath = localLogoMap[organizer];
    if (localLogoPath) {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <Image
                    src={localLogoPath}
                    alt={`${organizer} logo`}
                    width={sizePx[size]}
                    height={sizePx[size]}
                    className={`${sizeClasses[size]} object-contain rounded`}
                />
            </div>
        );
    }

    // Check if we have a Simple Icons CDN fallback
    const simpleIconSlug = simpleIconsMap[organizer];
    if (simpleIconSlug) {
        const iconUrl = `https://cdn.simpleicons.org/${simpleIconSlug}`;
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <Image
                    src={iconUrl}
                    alt={`${organizer} logo`}
                    width={sizePx[size]}
                    height={sizePx[size]}
                    className={`${sizeClasses[size]} dark:invert dark:brightness-200`}
                    unoptimized
                />
            </div>
        );
    }

    // Ultimate fallback: First letter in styled container
    return (
        <div className={`flex items-center justify-center ${sizeClasses[size]} rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 text-lg font-bold text-zinc-600 dark:text-zinc-300 ${className}`}>
            {organizer.charAt(0)}
        </div>
    );
}

// Export icon mappings for direct usage if needed
export { brandIconMap, localLogoMap, simpleIconsMap };
