export interface UserProfile {
    id: string;
    name: string;
    username: string;
    bio: string;
    avatarUrl: string;
    social: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        instagram?: string;
        threads?: string;
    };
}

export interface ActivityDay {
    date: string;
    level: 0 | 1 | 2 | 3 | 4; // 0 = no activity, 4 = high activity
    description?: string;
}

export interface UserHackathonWorkflow {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    platform: string;
    tags: string[];
    url: string;
    status: 'planned' | 'active' | 'completed';
    progress?: number;
    result?: string; // For completed: 'Winner', 'Finalist', 'Participated'
}

export const mockUser: UserProfile = {
    id: 'user-1',
    name: 'Alex Chen',
    username: '@alexcodes',
    bio: 'Full-stack developer passionate about building products that matter. Open source contributor & hackathon enthusiast.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    social: {
        github: 'https://github.com/alexchen',
        linkedin: 'https://linkedin.com/in/alexchen',
        twitter: 'https://twitter.com/alexcodes',
        instagram: 'https://instagram.com/alexcodes',
        threads: 'https://threads.net/@alexcodes',
    },
};

// Generate activity data for the past year
const generateActivityData = (): ActivityDay[] => {
    const activities: ActivityDay[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 365);

    const activityDescriptions = [
        'Registered for hackathon',
        'Updated project progress',
        'Submitted project',
        'Joined team discussion',
        'Reviewed hackathon details',
        'Completed milestone',
        'Started new hackathon',
    ];

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];

        // Random activity level with higher chance of 0
        const rand = Math.random();
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (rand > 0.7) level = 1;
        if (rand > 0.85) level = 2;
        if (rand > 0.92) level = 3;
        if (rand > 0.97) level = 4;

        activities.push({
            date: dateStr,
            level,
            description: level > 0
                ? activityDescriptions[Math.floor(Math.random() * activityDescriptions.length)]
                : undefined,
        });
    }

    return activities;
};

export const mockActivityData = generateActivityData();

export const mockUserHackathons: UserHackathonWorkflow[] = [
    // Planned
    {
        id: 'wf-1',
        name: 'ETHGlobal Bangkok',
        startDate: '2026-02-15',
        endDate: '2026-02-17',
        platform: 'Devfolio',
        tags: ['Web3', 'Blockchain'],
        url: 'https://ethglobal.com/events/bangkok',
        status: 'planned',
    },
    {
        id: 'wf-2',
        name: 'Google Cloud Hackathon',
        startDate: '2026-03-01',
        endDate: '2026-03-03',
        platform: 'Devpost',
        tags: ['Cloud', 'ML'],
        url: 'https://devpost.com',
        status: 'planned',
    },

    // Active
    {
        id: 'wf-3',
        name: 'BuildForBharat',
        startDate: '2026-01-10',
        endDate: '2026-01-20',
        platform: 'Devfolio',
        tags: ['FinTech', 'India'],
        url: 'https://buildforbharat.devfolio.co',
        status: 'active',
        progress: 65,
    },
    {
        id: 'wf-4',
        name: 'AI Agents Hackathon',
        startDate: '2026-01-12',
        endDate: '2026-01-19',
        platform: 'HackerEarth',
        tags: ['AI', 'LLM'],
        url: 'https://hackerearth.com',
        status: 'active',
        progress: 40,
    },

    // Completed
    {
        id: 'wf-5',
        name: 'HackMIT 2025',
        startDate: '2025-09-15',
        endDate: '2025-09-17',
        platform: 'MLH',
        tags: ['AI', 'Education'],
        url: 'https://hackmit.org',
        status: 'completed',
        result: 'Finalist',
    },
    {
        id: 'wf-6',
        name: 'DevRev Hackathon',
        startDate: '2025-08-01',
        endDate: '2025-08-10',
        platform: 'Devfolio',
        tags: ['Developer Tools'],
        url: 'https://devfolio.co',
        status: 'completed',
        result: 'Winner',
    },
    {
        id: 'wf-7',
        name: 'React Global Summit',
        startDate: '2025-06-20',
        endDate: '2025-06-25',
        platform: 'Devpost',
        tags: ['React', 'Frontend'],
        url: 'https://devpost.com',
        status: 'completed',
        result: 'Participated',
    },
];
