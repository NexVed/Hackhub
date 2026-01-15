import { Hackathon } from '../types/hackathon';

export const mockHackathons: Hackathon[] = [
    // Unstop
    {
        id: 'hack-unstop-1',
        name: 'Flipkart GRiD 6.0',
        startDate: '2026-02-10',
        endDate: '2026-03-15',
        platform: 'Unstop',
        tags: ['E-commerce', 'Robotics', 'Software'],
        url: 'https://unstop.com/hackathons',
        status: 'upcoming',
        description: 'Flipkart\'s flagship engineering campus challenge for students.',
    },
    {
        id: 'hack-unstop-2',
        name: 'L\u2019Or\u00e9al Brandstorm 2026',
        startDate: '2026-01-20',
        endDate: '2026-04-10',
        platform: 'Unstop',
        tags: ['Innovation', 'Marketing', 'Business'],
        url: 'https://unstop.com/competitions',
        status: 'live',
        description: 'Innovate the future of beauty with L\u2019Or\u00e9al.',
    },

    // Devfolio
    {
        id: 'hack-devfolio-1',
        name: 'ETHGlobal Bangkok',
        startDate: '2026-02-15',
        endDate: '2026-02-17',
        platform: 'Devfolio',
        tags: ['Web3', 'Blockchain', 'DeFi'],
        url: 'https://ethglobal.com/events/bangkok',
        status: 'upcoming',
        description: 'The biggest Web3 hackathon in Southeast Asia.',
    },
    {
        id: 'hack-devfolio-2',
        name: 'BuildForBharat',
        startDate: '2026-01-10',
        endDate: '2026-01-20',
        platform: 'Devfolio',
        tags: ['FinTech', 'India', 'UPI'],
        url: 'https://buildforbharat.devfolio.co',
        status: 'live',
        description: 'Solving India\'s hardest fintech problems.',
    },

    // Devnovate
    {
        id: 'hack-devnovate-1',
        name: 'InnovateX 2026',
        startDate: '2026-03-05',
        endDate: '2026-03-07',
        platform: 'Devnovate',
        tags: ['SaaS', 'Cloud', 'AI'],
        url: '#',
        status: 'upcoming',
        description: 'Build the next generation of SaaS applications.',
    },

    // Hack2Skill
    {
        id: 'hack-h2s-1',
        name: 'Smart India Hackathon',
        startDate: '2026-04-01',
        endDate: '2026-04-05',
        platform: 'Hack2Skill',
        tags: ['GovTech', 'Smart City', 'Education'],
        url: '#',
        status: 'upcoming',
        description: 'World\'s biggest open innovation model.',
    },

    // HackerEarth
    {
        id: 'hack-he-1',
        name: 'AI Agents Hackathon',
        startDate: '2026-01-12',
        endDate: '2026-01-19',
        platform: 'HackerEarth',
        tags: ['AI', 'LLM', 'Agents'],
        url: 'https://hackerearth.com',
        status: 'live',
        description: 'Build autonomous agents that solve real-world tasks.',
    },
    {
        id: 'hack-he-2',
        name: 'IBM Quantum Challenge',
        startDate: '2026-02-01',
        endDate: '2026-02-10',
        platform: 'HackerEarth',
        tags: ['Quantum', 'Research', 'Python'],
        url: 'https://hackerearth.com',
        status: 'upcoming',
        description: 'Explore the frontiers of quantum computing with IBM.',
    },

    // Devpost
    {
        id: 'hack-dp-1',
        name: 'Google Cloud Hackathon',
        startDate: '2026-03-01',
        endDate: '2026-03-03',
        platform: 'Devpost',
        tags: ['Cloud', 'ML', 'GCP'],
        url: 'https://devpost.com/hackathons',
        status: 'upcoming',
        description: 'Build scalable applications using Google Cloud Platform.',
    },
    {
        id: 'hack-dp-2',
        name: 'Gamers Unite',
        startDate: '2026-01-15',
        endDate: '2026-01-25',
        platform: 'Devpost',
        tags: ['GameDev', 'Unity', 'Unreal'],
        url: 'https://devpost.com',
        status: 'live',
        description: 'Create the next indie game hit.',
    },

    // MLH
    {
        id: 'hack-mlh-1',
        name: 'HackMIT 2026',
        startDate: '2026-02-20',
        endDate: '2026-02-22',
        platform: 'MLH',
        tags: ['AI', 'Full Stack', 'Open Innovation'],
        url: 'https://hackmit.org',
        status: 'upcoming',
        description: 'One of the most prestigious student hackathons.',
    },

    // Other
    {
        id: 'hack-other-1',
        name: 'GameDev Jam',
        startDate: '2026-01-10',
        endDate: '2026-01-17',
        platform: 'Other',
        tags: ['Gaming', 'Unity', 'Godot'],
        url: 'https://itch.io/jams',
        status: 'ending-soon',
        description: 'A 7-day game jam for indie developers.',
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
