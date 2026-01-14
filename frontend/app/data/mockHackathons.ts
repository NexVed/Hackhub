import { Hackathon } from '../types/hackathon';

export const mockHackathons: Hackathon[] = [
    // Upcoming
    {
        id: 'hack-1',
        name: 'ETHGlobal Bangkok',
        startDate: '2026-02-15',
        endDate: '2026-02-17',
        platform: 'Devfolio',
        tags: ['Web3', 'Blockchain', 'DeFi'],
        url: 'https://ethglobal.com/events/bangkok',
        status: 'upcoming',
    },
    {
        id: 'hack-2',
        name: 'HackMIT 2026',
        startDate: '2026-02-20',
        endDate: '2026-02-22',
        platform: 'MLH',
        tags: ['AI', 'Full Stack', 'Open Innovation'],
        url: 'https://hackmit.org',
        status: 'upcoming',
    },
    {
        id: 'hack-3',
        name: 'Google Cloud Hackathon',
        startDate: '2026-03-01',
        endDate: '2026-03-03',
        platform: 'Devpost',
        tags: ['Cloud', 'ML', 'GCP'],
        url: 'https://devpost.com/hackathons',
        status: 'upcoming',
    },

    // Live
    {
        id: 'hack-4',
        name: 'BuildForBharat',
        startDate: '2026-01-10',
        endDate: '2026-01-20',
        platform: 'Devfolio',
        tags: ['FinTech', 'India', 'UPI'],
        url: 'https://buildforbharat.devfolio.co',
        status: 'live',
    },
    {
        id: 'hack-5',
        name: 'AI Agents Hackathon',
        startDate: '2026-01-12',
        endDate: '2026-01-19',
        platform: 'HackerEarth',
        tags: ['AI', 'LLM', 'Agents'],
        url: 'https://hackerearth.com',
        status: 'live',
    },
    {
        id: 'hack-6',
        name: 'React Global Summit',
        startDate: '2026-01-14',
        endDate: '2026-01-21',
        platform: 'Devpost',
        tags: ['React', 'Frontend', 'TypeScript'],
        url: 'https://devpost.com/hackathons',
        status: 'live',
    },

    // Ending Soon
    {
        id: 'hack-7',
        name: 'Sustainability Hack',
        startDate: '2026-01-08',
        endDate: '2026-01-16',
        platform: 'MLH',
        tags: ['CleanTech', 'IoT', 'Sustainability'],
        url: 'https://mlh.io/seasons/2026/events',
        status: 'ending-soon',
    },
    {
        id: 'hack-8',
        name: 'HealthTech Innovation',
        startDate: '2026-01-05',
        endDate: '2026-01-15',
        platform: 'Devfolio',
        tags: ['Healthcare', 'AI', 'Mobile'],
        url: 'https://devfolio.co',
        status: 'ending-soon',
    },
    {
        id: 'hack-9',
        name: 'GameDev Jam',
        startDate: '2026-01-10',
        endDate: '2026-01-17',
        platform: 'Other',
        tags: ['Gaming', 'Unity', 'Godot'],
        url: 'https://itch.io/jams',
        status: 'ending-soon',
    },
];

export const getHackathonsByStatus = (status: Hackathon['status']): Hackathon[] => {
    return mockHackathons.filter((h) => h.status === status);
};

export const getCountdown = (endDate: string): string => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
};

export const getDaysUntilStart = (startDate: string): string => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Starts today';
    if (days === 1) return 'Starts tomorrow';
    return `In ${days} days`;
};
