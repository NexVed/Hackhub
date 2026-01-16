'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Users, Plus, Search, Trophy, UserPlus, Settings, Copy, Check, Globe, Lock, Loader2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    getMyTeams,
    getPublicTeams,
    createTeam,
    joinByCode,
    requestToJoin,
    TeamWithMembers,
    hasPendingRequest
} from '@/lib/teamService';

const statusColors = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    recruiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    completed: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
};

export default function TeamsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [myTeams, setMyTeams] = useState<TeamWithMembers[]>([]);
    const [publicTeams, setPublicTeams] = useState<TeamWithMembers[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');
    const [requestedTeams, setRequestedTeams] = useState<Set<string>>(new Set());

    // Create team modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', description: '', isPublic: false });
    const [creating, setCreating] = useState(false);
    const [createdTeam, setCreatedTeam] = useState<{ name: string; code: string } | null>(null);

    // Join by code modal
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState('');

    // Copied code
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Fetch teams on mount
    useEffect(() => {
        async function fetchTeams() {
            if (user?.id) {
                const [my, pub] = await Promise.all([
                    getMyTeams(user.id),
                    getPublicTeams(user.id)
                ]);
                setMyTeams(my);
                setPublicTeams(pub);

                // Check which teams user has requested
                const requested = new Set<string>();
                for (const team of pub) {
                    if (await hasPendingRequest(user.id, team.id)) {
                        requested.add(team.id);
                    }
                }
                setRequestedTeams(requested);
            }
            setLoading(false);
        }
        fetchTeams();
    }, [user?.id]);

    const handleCreateTeam = async () => {
        if (!user?.id || !createForm.name.trim()) return;

        setCreating(true);
        const result = await createTeam(user.id, {
            name: createForm.name,
            description: createForm.description,
            is_public: createForm.isPublic,
            status: 'recruiting',
        });

        if (result.success && result.team) {
            setCreatedTeam({ name: result.team.name, code: result.team.team_code || '' });
            const teams = await getMyTeams(user.id);
            setMyTeams(teams);
        }
        setCreating(false);
    };

    const handleJoinByCode = async () => {
        if (!user?.id || !joinCode.trim()) return;

        setJoining(true);
        setJoinError('');

        const result = await joinByCode(user.id, joinCode.trim());

        if (result.success) {
            const teams = await getMyTeams(user.id);
            setMyTeams(teams);
            setIsJoinOpen(false);
            setJoinCode('');
        } else {
            setJoinError(result.error || 'Failed to join');
        }
        setJoining(false);
    };

    const handleRequestJoin = async (teamId: string) => {
        if (!user?.id) return;

        const result = await requestToJoin(user.id, teamId);
        if (result.success) {
            setRequestedTeams(prev => new Set([...prev, teamId]));
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const filteredMyTeams = myTeams.filter((team) =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

    const filteredPublicTeams = publicTeams.filter((team) =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

    if (loading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <TopBar><span className="text-lg font-semibold">Teams</span></TopBar>
                    <div className="flex-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TopBar>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Teams</span>
                </TopBar>

                <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-auto">
                    <div className="max-w-6xl mx-auto p-6 space-y-6">
                        {/* Header & Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Teams</h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Create, join, and manage your hackathon teams
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsJoinOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Join by Code
                                </button>
                                <button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Team
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg w-fit">
                            <button
                                onClick={() => setActiveTab('my')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'my'
                                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                                    }`}
                            >
                                My Teams ({myTeams.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('discover')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'discover'
                                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                                    }`}
                            >
                                Discover ({publicTeams.length})
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
                            {(activeTab === 'my' ? filteredMyTeams : filteredPublicTeams).map((team) => {
                                const isOwner = team.owner_id === user?.id;
                                const hasRequested = requestedTeams.has(team.id);

                                return (
                                    <div
                                        key={team.id}
                                        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col"
                                    >
                                        <div className="p-5 flex-1">
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
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[team.status]}`}>
                                                                {team.status === 'recruiting' ? '🔍 Recruiting' : team.status === 'active' ? '🚀 Active' : '✅ Completed'}
                                                            </span>
                                                            {team.is_public ? (
                                                                <span title="Public">
                                                                    <Globe className="w-3.5 h-3.5 text-zinc-400" />
                                                                </span>
                                                            ) : (
                                                                <span title="Private">
                                                                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Team Code (for owners) */}
                                                {isOwner && team.team_code && (
                                                    <button
                                                        onClick={() => copyCode(team.team_code!)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                        title="Copy invite code"
                                                    >
                                                        {copiedCode === team.team_code ? (
                                                            <Check className="w-3.5 h-3.5 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5 text-zinc-500" />
                                                        )}
                                                        {team.team_code}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Description */}
                                            {team.description && (
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                                                    {team.description}
                                                </p>
                                            )}

                                            {/* Members */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex -space-x-2">
                                                    {team.members.slice(0, 4).map((member, index) => (
                                                        <div
                                                            key={member.id}
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white dark:border-zinc-900 ${index === 0 ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                                                                : index === 1 ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                                                    : 'bg-gradient-to-br from-amber-500 to-orange-600'
                                                                }`}
                                                            title={member.profile?.name || 'Member'}
                                                        >
                                                            {(member.profile?.name?.[0] || 'M').toUpperCase()}
                                                        </div>
                                                    ))}
                                                    {team.member_count > 4 && (
                                                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300 border-2 border-white dark:border-zinc-900">
                                                            +{team.member_count - 4}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs text-zinc-500">{team.member_count} members</span>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                            {isOwner ? (
                                                <button
                                                    onClick={() => router.push(`/teams/${team.id}/manage`)}
                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors relative"
                                                >
                                                    <Settings className="w-4 h-4 text-zinc-500" />
                                                    Manage Team
                                                    {(team.pending_requests || 0) > 0 && (
                                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                                            {team.pending_requests}
                                                        </span>
                                                    )}
                                                </button>
                                            ) : activeTab === 'discover' ? (
                                                <button
                                                    onClick={() => handleRequestJoin(team.id)}
                                                    disabled={hasRequested}
                                                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${hasRequested
                                                        ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed dark:bg-zinc-800'
                                                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                                                        }`}
                                                >
                                                    {hasRequested ? 'Request Sent' : <><UserPlus className="w-4 h-4" /> Request to Join</>}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => router.push(`/teams/${team.id}`)}
                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                                                >
                                                    View Team
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Empty States */}
                        {activeTab === 'my' && filteredMyTeams.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 mx-auto mb-3 text-zinc-400" />
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                                    {myTeams.length === 0 ? 'No teams yet' : 'No matching teams'}
                                </h3>
                                <p className="text-sm text-zinc-500 mb-4">
                                    {myTeams.length === 0 ? 'Create a team or join one using an invite code' : 'Try a different search'}
                                </p>
                            </div>
                        )}

                        {activeTab === 'discover' && filteredPublicTeams.length === 0 && (
                            <div className="text-center py-12">
                                <Globe className="w-12 h-12 mx-auto mb-3 text-zinc-400" />
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                                    No public teams recruiting
                                </h3>
                                <p className="text-sm text-zinc-500">
                                    Check back later or create your own team
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>

            {/* Create Team Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        {createdTeam ? (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                        Team Created!
                                    </h2>
                                    <p className="text-zinc-500">Share this code with your teammates</p>
                                </div>
                                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 text-center mb-6">
                                    <p className="text-sm text-zinc-500 mb-2">Invite Code</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">
                                            {createdTeam.code}
                                        </span>
                                        <button
                                            onClick={() => copyCode(createdTeam.code)}
                                            className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                        >
                                            {copiedCode === createdTeam.code ? (
                                                <Check className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Copy className="w-5 h-5 text-zinc-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setIsCreateOpen(false); setCreatedTeam(null); setCreateForm({ name: '', description: '', isPublic: false }); }}
                                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg"
                                >
                                    Done
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Create Team</h2>
                                    <button onClick={() => setIsCreateOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Team Name</label>
                                        <input
                                            type="text"
                                            value={createForm.name}
                                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                            placeholder="Awesome Team"
                                            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                                        <textarea
                                            value={createForm.description}
                                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                            placeholder="What's your team about?"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                        <input
                                            type="checkbox"
                                            checked={createForm.isPublic}
                                            onChange={(e) => setCreateForm({ ...createForm, isPublic: e.target.checked })}
                                            className="w-4 h-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Make team public</p>
                                            <p className="text-xs text-zinc-500">Anyone can discover and request to join</p>
                                        </div>
                                    </label>
                                    <button
                                        onClick={handleCreateTeam}
                                        disabled={creating || !createForm.name.trim()}
                                        className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                                    >
                                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Create Team
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Join by Code Modal */}
            {isJoinOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Join Team</h2>
                            <button onClick={() => { setIsJoinOpen(false); setJoinCode(''); setJoinError(''); }} className="p-1 text-zinc-400 hover:text-zinc-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-zinc-500 mb-4">Enter the 6-character invite code shared by your teammate</p>
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                            placeholder="ABC123"
                            maxLength={6}
                            className="w-full px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-2"
                        />
                        {joinError && <p className="text-sm text-red-500 mb-2">{joinError}</p>}
                        <button
                            onClick={handleJoinByCode}
                            disabled={joining || joinCode.length !== 6}
                            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-medium rounded-lg flex items-center justify-center gap-2 mt-4"
                        >
                            {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            Join Team
                        </button>
                    </div>
                </div>
            )}
        </SidebarProvider>
    );
}
