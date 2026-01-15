'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/components/AppSidebar';
import { TopBar } from '@/app/components/TopBar';
import { ArrowLeft, Users, Shield, UserPlus, XCircle, CheckCircle, Trash2 } from 'lucide-react';

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
    requests: TeamMember[];
}

// Mock data (in a real app, fetch this via API based on params.id)
const mockTeamData: Team = {
    id: 'team-1',
    name: 'Code Crusaders',
    description: 'Building innovative fintech solutions with AI',
    members: [
        { id: 'm1', name: 'Alex Chen', role: 'Lead Developer', avatar: 'A', skills: ['React', 'Node.js'] },
        { id: 'm2', name: 'Sarah Kim', role: 'UI/UX Designer', avatar: 'S', skills: ['Figma', 'CSS'] },
        { id: 'me', name: 'You', role: 'Owner', avatar: 'Me', skills: [] }
    ],
    requests: [
        { id: 'req1', name: 'David Lee', role: 'Full Stack', avatar: 'D', skills: ['Next.js', 'PostgreSQL'] },
        { id: 'req2', name: 'Maria Garcia', role: 'Frontend Dev', avatar: 'M', skills: ['Vue', 'Tailwind'] }
    ]
};

export default function ManageTeamPage() {
    const router = useRouter();
    const params = useParams();
    const [team, setTeam] = useState<Team>(mockTeamData);
    const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');

    // handlers
    const handleAcceptRequest = (userId: string) => {
        const request = team.requests.find(r => r.id === userId);
        if (!request) return;

        setTeam(prev => ({
            ...prev,
            members: [...prev.members, { ...request, role: 'Member' }],
            requests: prev.requests.filter(r => r.id !== userId)
        }));
    };

    const handleDeclineRequest = (userId: string) => {
        setTeam(prev => ({
            ...prev,
            requests: prev.requests.filter(r => r.id !== userId)
        }));
    };

    const handleRemoveMember = (userId: string) => {
        setTeam(prev => ({
            ...prev,
            members: prev.members.filter(m => m.id !== userId)
        }));
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TopBar>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="p-1 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Manage Team
                        </span>
                    </div>
                </TopBar>

                <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-auto">
                    <div className="max-w-4xl mx-auto p-6 space-y-6">

                        {/* Header */}
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                                    <Shield className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                </div>
                                {team.name}
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 ml-[52px]">
                                {team.description}
                            </p>
                        </div>

                        {/* Stats/Tabs */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'members'
                                    ? 'bg-white dark:bg-zinc-900 border-violet-500 ring-1 ring-violet-500 shadow-sm'
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700'
                                    }`}
                            >
                                <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">Total Members</div>
                                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{team.members.length}</div>
                            </button>

                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`p-4 rounded-xl border text-left transition-all relative ${activeTab === 'requests'
                                    ? 'bg-white dark:bg-zinc-900 border-violet-500 ring-1 ring-violet-500 shadow-sm'
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700'
                                    }`}
                            >
                                {team.requests.length > 0 && (
                                    <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                        {team.requests.length}
                                    </span>
                                )}
                                <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">Pending Requests</div>
                                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{team.requests.length}</div>
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {activeTab === 'members' ? 'Team Members' : 'Join Requests'}
                                </h2>
                                {activeTab === 'members' && (
                                    <button className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 flex items-center gap-1">
                                        <UserPlus className="w-3.5 h-3.5" />
                                        Add Member
                                    </button>
                                )}
                            </div>

                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {activeTab === 'members' ? (
                                    team.members.map((member) => (
                                        <div key={member.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-inner">
                                                    {member.avatar}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{member.name}</h4>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.role}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        {member.skills.map(skill => (
                                                            <span key={skill} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {member.role !== 'Owner' && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            {member.role === 'Owner' && (
                                                <span className="text-xs font-medium px-2.5 py-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded-full">
                                                    Owner
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    team.requests.length === 0 ? (
                                        <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>No pending requests at the moment.</p>
                                        </div>
                                    ) : (
                                        team.requests.map((request) => (
                                            <div key={request.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-medium">
                                                        {request.avatar}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{request.name}</h4>
                                                        <div className="flex gap-2 mt-1">
                                                            {request.skills.map(skill => (
                                                                <span key={skill} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDeclineRequest(request.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Decline
                                                    </button>
                                                    <button
                                                        onClick={() => handleAcceptRequest(request.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Accept
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
