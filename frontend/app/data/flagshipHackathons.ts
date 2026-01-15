export interface FlagshipHackathon {
    id: string;
    name: string;
    organizer: string;
    logoUrl: string;
    timeline: string;
    status: 'upcoming' | 'open' | 'live';
    url: string;
    description?: string;
    isFlagship: true;
    // Optional specific dates for calendar display
    startDate?: string;
    endDate?: string;
}

export const flagshipHackathons: FlagshipHackathon[] = [
    {
        id: 'flagship-sih',
        name: 'Smart India Hackathon 2026',
        organizer: 'Government of India',
        logoUrl: '/logos/india.svg',
        timeline: 'Aug - Dec 2026',
        status: 'upcoming',
        url: 'https://sih.gov.in',
        description: 'India\'s largest open innovation hackathon with problem statements from government ministries.',
        isFlagship: true,
        startDate: '2026-08-15',
        endDate: '2026-12-20',
    },
    {
        id: 'flagship-gsoc',
        name: 'Google Summer of Code',
        organizer: 'Google',
        logoUrl: '/logos/google.svg',
        timeline: 'Mar - Sep 2026',
        status: 'open',
        url: 'https://summerofcode.withgoogle.com',
        description: 'Global program offering stipends to contributors working with open source organizations.',
        isFlagship: true,
        startDate: '2026-03-01',
        endDate: '2026-09-30',
    },
    {
        id: 'flagship-imagine-cup',
        name: 'Microsoft Imagine Cup',
        organizer: 'Microsoft',
        logoUrl: '/logos/microsoft.svg',
        timeline: 'Jan - May 2026',
        status: 'live',
        url: 'https://imaginecup.microsoft.com',
        description: 'Annual competition empowering students to use technology to address global challenges.',
        isFlagship: true,
        startDate: '2026-01-10',
        endDate: '2026-05-15',
    },
    {
        id: 'flagship-meta-hacker',
        name: 'Meta Hacker Cup',
        organizer: 'Meta',
        logoUrl: '/logos/meta.svg',
        timeline: 'Jul - Oct 2026',
        status: 'upcoming',
        url: 'https://www.facebook.com/codingcompetitions/hacker-cup',
        description: 'Annual worldwide programming competition organized by Meta.',
        isFlagship: true,
        startDate: '2026-07-01',
        endDate: '2026-10-31',
    },
    {
        id: 'flagship-hashcode',
        name: 'Google Hash Code',
        organizer: 'Google',
        logoUrl: '/logos/google.svg',
        timeline: 'Feb - Apr 2026',
        status: 'open',
        url: 'https://codingcompetitions.withgoogle.com/hashcode',
        description: 'Team-based programming competition organized by Google for students and professionals.',
        isFlagship: true,
        startDate: '2026-02-15',
        endDate: '2026-04-30',
    },
    {
        id: 'flagship-aws-deepracer',
        name: 'AWS DeepRacer League',
        organizer: 'Amazon Web Services',
        logoUrl: '/logos/aws.svg',
        timeline: 'Year-round',
        status: 'live',
        url: 'https://aws.amazon.com/deepracer',
        description: 'Global autonomous racing league powered by reinforcement learning.',
        isFlagship: true,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
    },
    {
        id: 'flagship-mlh',
        name: 'MLH Global Hack Week',
        organizer: 'Major League Hacking',
        logoUrl: '/logos/mlh.svg',
        timeline: 'Feb 2026',
        status: 'upcoming',
        url: 'https://ghw.mlh.io',
        description: 'Week-long celebration of building with thousands of hackers worldwide.',
        isFlagship: true,
        startDate: '2026-02-03',
        endDate: '2026-02-10',
    },
    {
        id: 'flagship-ethglobal',
        name: 'ETHGlobal',
        organizer: 'Ethereum Foundation',
        logoUrl: '/logos/ethereum.svg',
        timeline: 'Multiple events',
        status: 'upcoming',
        url: 'https://ethglobal.com',
        description: 'Premier series of Ethereum hackathons held worldwide.',
        isFlagship: true,
        startDate: '2026-02-15',
        endDate: '2026-02-17',
    },
];

export const getStatusColor = (status: FlagshipHackathon['status']): string => {
    switch (status) {
        case 'live':
            return 'bg-red-500 text-white';
        case 'open':
            return 'bg-emerald-500 text-white';
        case 'upcoming':
            return 'bg-blue-500 text-white';
        default:
            return 'bg-zinc-500 text-white';
    }
};

export const getStatusLabel = (status: FlagshipHackathon['status']): string => {
    switch (status) {
        case 'live':
            return 'Live Now';
        case 'open':
            return 'Open';
        case 'upcoming':
            return 'Upcoming';
        default:
            return status;
    }
};
