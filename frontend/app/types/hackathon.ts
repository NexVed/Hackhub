export interface Hackathon {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  platform: 'Devfolio' | 'MLH' | 'Devpost' | 'HackerEarth' | 'Other';
  tags: string[];
  url: string;
  status: 'upcoming' | 'live' | 'ending-soon';
}

export interface UserHackathon extends Hackathon {
  userStatus: 'planned' | 'active' | 'submitted' | 'completed';
  progress: number; // 0-100
  milestones: Milestone[];
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export type GlobalColumnStatus = 'upcoming' | 'live' | 'ending-soon';
export type UserColumnStatus = 'planned' | 'active' | 'submitted' | 'completed';
