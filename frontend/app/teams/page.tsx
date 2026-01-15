'use client';

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Users, Plus, Search, MessageCircle, Trophy, Calendar, Crown, UserPlus } from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    skills: string[];
}

interface Team {
    id: string;
    name: string;
    description: string;
    members: TeamMember[];
    hackathon?: string;
    status: 'active' | 'recruiting' | 'completed';
}

const mockTeams: Team[] = [
    {
        id: 'team-1',
        name: 'Code Crusaders',
        description: 'Building innovative fintech solutions with AI',
        members: [
            { id: 'm1', name: 'Alex Chen', role: 'Lead Developer', avatar: 'A', skills: ['React', 'Node.js'] },
            { id: 'm2', name: 'Sarah Kim', role: 'UI/UX Designer', avatar: 'S', skills: ['Figma', 'CSS'] },
            { id: 'm3', name: 'Mike Johnson', role: 'Backend Developer', avatar: 'M', skills: ['Python', 'Django'] },
        ],
        hackathon: 'BuildForBharat',
        status: 'active',
    },
    {
        id: 'team-2',
        name: 'AI Architects',
        description: 'Exploring the frontiers of machine learning',
        members: [
            { id: 'm4', name: 'Alex Chen', role: 'ML Engineer', avatar: 'A', skills: ['Python', 'TensorFlow'] },
            { id: 'm5', name: 'Emma Davis', role: 'Data Scientist', avatar: 'E', skills: ['PyTorch', 'Pandas'] },
        ],
        hackathon: 'AI Agents Hackathon',
        status: 'active',
    },
    {
        id: 'team-3',
        name: 'Web3 Warriors',
        description: 'Decentralizing the future one block at a time',
        members: [
            { id: 'm6', name: 'Alex Chen', role: 'Smart Contract Dev', avatar: 'A', skills: ['Solidity', 'Web3.js'] },
        ],
        status: 'recruiting',
    },
];

const statusColors = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    recruiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    completed: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
};

export default function TeamsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTeams = mockTeams.filter((team) =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TopBar>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Teams
                    </span>
                </TopBar>

                <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-auto">
                    <div className="max-w-6xl mx-auto p-6 space-y-6">
                        {/* Header & Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Teams</h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Manage your hackathon teams and find collaborators
                                </p>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors">
                                <Plus className="w-4 h-4" />
                                Create Team
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>

                        {/* Teams Grid */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {filteredTeams.map((team) => (
                                <div
                                    key={team.id}
                                    className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                                >
                                    <div className="p-5">
                                        {/* Team Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                        {team.name}
                                                    </h3>
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[team.status]}`}>
                                                        {team.status === 'recruiting' ? '🔍 Recruiting' : team.status === 'active' ? '🚀 Active' : '✅ Completed'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                            {team.description}
                                        </p>

                                        {/* Hackathon */}
                                        {team.hackathon && (
                                            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                                <Trophy className="w-4 h-4 text-amber-500" />
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                                    {team.hackathon}
                                                </span>
                                            </div>
                                        )}

                                        {/* Members */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {team.members.slice(0, 4).map((member, index) => (
                                                    <div
                                                        key={member.id}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white dark:border-zinc-900 ${index === 0
                                                                ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                                                                : index === 1
                                                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                                                    : 'bg-gradient-to-br from-amber-500 to-orange-600'
                                                            }`}
                                                        title={member.name}
                                                    >
                                                        {member.avatar}
                                                    </div>
                                                ))}
                                                {team.members.length > 4 && (
                                                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300 border-2 border-white dark:border-zinc-900">
                                                        +{team.members.length - 4}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="p-2 text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                                    <MessageCircle className="w-4 h-4" />
                                                </button>
                                                {team.status === 'recruiting' && (
                                                    <button className="p-2 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                                        <UserPlus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Find Team CTA */}
                        <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-200 dark:border-violet-800 p-6 text-center">
                            <Users className="w-12 h-12 mx-auto mb-3 text-violet-600 dark:text-violet-400" />
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                Looking for teammates?
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 max-w-md mx-auto">
                                Browse the community to find skilled developers, designers, and builders for your next hackathon.
                            </p>
                            <button className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors">
                                Browse Community
                            </button>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
