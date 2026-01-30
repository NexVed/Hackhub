'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/components/AppSidebar';
import { TopBar } from '@/app/components/TopBar';
import {
    ArrowLeft, Users, Shield, Trash2, Copy, Check,
    Loader2, Globe, Lock, Settings2, UserMinus, Crown, Sparkles, Share2,
    Camera, Bell
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import {
    getTeamDetails,
    handleRequest,
    removeMember,
    updateTeam,
    deleteTeam,
    uploadTeamLogo,
    TeamDetails,
    TeamRequest
} from '@/lib/teamService';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function ManageTeamPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const teamId = params.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [team, setTeam] = useState<TeamDetails | null>(null);
    const [requests, setRequests] = useState<TeamRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');
    const [copiedCode, setCopiedCode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    useEffect(() => {
        async function fetchTeam() {
            if (teamId) {
                const data = await getTeamDetails(teamId);
                if (data) {
                    setTeam(data);
                    setRequests(data.requests || []);
                }
            }
            setLoading(false);
        }
        fetchTeam();
    }, [teamId]);

    const handleAcceptRequest = useCallback(async (requestId: string) => {
        setSaving(true);
        const result = await handleRequest(requestId, 'accept');
        if (result.success) {
            const data = await getTeamDetails(teamId);
            if (data) {
                setTeam(data);
                setRequests(data.requests || []);
            }
        }
        setSaving(false);
    }, [teamId]);

    const handleDeclineRequest = useCallback(async (requestId: string) => {
        setSaving(true);
        await handleRequest(requestId, 'decline');
        setRequests(prev => prev.filter(r => r.id !== requestId));
        setSaving(false);
    }, []);

    const handleRemoveMember = useCallback(async (userId: string) => {
        if (!confirm('Remove this member from the team?')) return;
        setSaving(true);
        const result = await removeMember(teamId, userId);
        if (result.success && team) {
            setTeam({ ...team, members: team.members.filter(m => m.user_id !== userId) });
        }
        setSaving(false);
    }, [teamId, team]);

    const handleTogglePublic = useCallback(async () => {
        if (!team) return;
        setSaving(true);
        await updateTeam(teamId, { is_public: !team.is_public });
        setTeam({ ...team, is_public: !team.is_public });
        setSaving(false);
    }, [teamId, team]);

    const handleDeleteTeam = useCallback(async () => {
        if (!confirm('Are you sure you want to delete this team? This cannot be undone.')) return;
        setSaving(true);
        const result = await deleteTeam(teamId);
        if (result.success) router.push('/teams');
        setSaving(false);
    }, [teamId, router]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !team) return;

        setUploadingLogo(true);
        const result = await uploadTeamLogo(team.id, file);
        if (result.success && result.url) {
            setTeam({ ...team, logo_url: result.url });
        }
        setUploadingLogo(false);
    };

    const copyCode = () => {
        if (team?.team_code) {
            navigator.clipboard.writeText(team.team_code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    if (loading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <TopBar><span className="text-lg font-semibold">Manage Team</span></TopBar>
                    <div className="flex-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (!team) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <TopBar><span className="text-lg font-semibold">Manage Team</span></TopBar>
                    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-950">
                        <Users className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4" />
                        <p className="text-zinc-500 mb-4">Team not found</p>
                        <button onClick={() => router.push('/teams')} className="text-violet-600 hover:underline">
                            Back to Teams
                        </button>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    const isOwner = team.owner_id === user?.id;
    const memberColors = ['from-violet-500 to-purple-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600', 'from-blue-500 to-indigo-600'];

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TopBar>
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="p-1.5 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Team Settings</span>
                    </div>
                </TopBar>

                <div className="flex-1 bg-gradient-to-b from-zinc-100 to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 overflow-auto">
                    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">

                        {/* Hero Header */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                            <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                                    <div className="relative group shrink-0">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20 overflow-hidden">
                                            {team.logo_url ? (
                                                <>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                                </>
                                            ) : (
                                                <Shield className="w-12 h-12 text-white" />
                                            )}
                                        </div>
                                        {isOwner && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingLogo}
                                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer"
                                            >
                                                {uploadingLogo ? (
                                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                ) : (
                                                    <Camera className="w-6 h-6 text-white" />
                                                )}
                                            </button>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-2">
                                            <h1 className="text-2xl sm:text-3xl font-bold truncate max-w-[200px] sm:max-w-none">{team.name}</h1>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium backdrop-blur-sm ${team.is_public ? 'bg-green-400/20 text-green-100' : 'bg-white/20 text-white'}`}>
                                                {team.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                {team.is_public ? 'Public' : 'Private'}
                                            </span>
                                        </div>
                                        <p className="text-white/80 text-sm sm:text-lg line-clamp-2 sm:line-clamp-none">{team.description || 'Building something amazing together'}</p>
                                    </div>
                                </div>

                                {/* Invite Code Card */}
                                {team.team_code && (
                                    <div className="w-full sm:w-auto bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 flex flex-col items-center sm:items-start shrink-0">
                                        <div className="flex items-center gap-2 text-white/70 text-xs font-medium mb-2">
                                            <Share2 className="w-3.5 h-3.5" />
                                            INVITE CODE
                                        </div>
                                        <button onClick={copyCode} className="flex items-center gap-3 group">
                                            <span className="font-mono text-2xl font-bold tracking-[0.3em] text-white">{team.team_code}</span>
                                            <div className={`p-2 rounded-lg transition-all ${copiedCode ? 'bg-green-400/30' : 'bg-white/10 group-hover:bg-white/20'}`}>
                                                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="relative flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20 gap-4">
                                <div className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-white/70" />
                                        <span className="font-semibold">{team.members.length}</span>
                                        <span className="text-white/70">members</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-amber-300" />
                                        <span className="font-semibold">{requests.length}</span>
                                        <span className="text-white/70">pending requests</span>
                                    </div>
                                </div>

                                {/* Request Side Panel Trigger */}
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium backdrop-blur-sm border border-white/20">
                                            <Bell className="w-4 h-4" />
                                            View Requests
                                            {requests.length > 0 && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
                                                    {requests.length}
                                                </span>
                                            )}
                                        </button>
                                    </SheetTrigger>
                                    <SheetContent className="w-[90vw] sm:w-[540px]">
                                        <SheetHeader className="mb-6">
                                            <SheetTitle className="flex items-center gap-2 text-xl">
                                                <Sparkles className="w-5 h-5 text-amber-500" />
                                                Join Requests
                                            </SheetTitle>
                                            <SheetDescription>
                                                Manage requests from people who want to join your team.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="flex-1 overflow-y-auto -mx-6 px-6">
                                            {requests.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                                        <Sparkles className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No pending requests</h3>
                                                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                                        When someone requests to join your team, they'll appear here.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {requests.map((request) => {
                                                        const profile = request.profile as any;
                                                        return (
                                                            <div key={request.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                                                <div className="flex items-center gap-4 mb-4">
                                                                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-lg">
                                                                        {(profile?.name?.[0] || profile?.username?.[0] || 'U').toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{profile?.name || profile?.username || 'Unknown User'}</h4>
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {profile?.skills?.slice(0, 3).map((skill: string) => (
                                                                                <span key={skill} className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500">
                                                                                    {skill}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleDeclineRequest(request.id)}
                                                                        disabled={saving}
                                                                        className="flex-1 py-2 text-sm font-medium text-red-600 bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                    >
                                                                        Decline
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAcceptRequest(request.id)}
                                                                        disabled={saving}
                                                                        className="flex-1 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-1 bg-white dark:bg-zinc-900 p-1.5 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 w-fit">
                            {[
                                { id: 'members', label: 'Members', icon: Users, count: team.members.length },
                                { id: 'settings', label: 'Settings', icon: Settings2 },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">

                            {/* Members Tab */}
                            {activeTab === 'members' && (
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {team.members.length === 0 ? (
                                        <div className="p-16 text-center">
                                            <Users className="w-16 h-16 mx-auto mb-4 text-zinc-200 dark:text-zinc-700" />
                                            <p className="text-zinc-500">No members yet</p>
                                        </div>
                                    ) : (
                                        team.members.map((member, index) => {
                                            const isOwnerMember = member.user_id === team.owner_id;
                                            const profile = member.profile as any;
                                            const colorClass = memberColors[index % memberColors.length];

                                            return (
                                                <div key={member.id} className="p-3 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-sm sm:text-xl font-bold shadow-lg overflow-hidden shrink-0`}>
                                                        {profile?.avatar_url ? (
                                                            <>
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            </>
                                                        ) : (
                                                            (profile?.name?.[0] || profile?.username?.[0] || 'M').toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-lg">
                                                                {profile?.name || profile?.username || 'Unknown'}
                                                            </h4>
                                                            {isOwnerMember && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-sm">
                                                                    <Crown className="w-3 h-3" />
                                                                    OWNER
                                                                </span>
                                                            )}
                                                            {member.user_id === user?.id && !isOwnerMember && (
                                                                <span className="text-xs text-zinc-400">(You)</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.role || 'Member'}</p>
                                                        {profile?.skills && profile.skills.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {profile.skills.slice(0, 4).map((skill: string) => (
                                                                    <span key={skill} className="px-2.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                                {profile.skills.length > 4 && (
                                                                    <span className="px-2.5 py-1 text-xs text-zinc-400">+{profile.skills.length - 4} more</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {!isOwnerMember && isOwner && (
                                                        <button
                                                            onClick={() => handleRemoveMember(member.user_id)}
                                                            disabled={saving}
                                                            className="opacity-0 group-hover:opacity-100 p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                        >
                                                            <UserMinus className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* Settings Tab */}
                            {activeTab === 'settings' && (
                                <div className="p-6 space-y-6">
                                    {/* Visibility Setting */}
                                    <div className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            {team.is_public ? (
                                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                                    <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-zinc-200 dark:bg-zinc-700 rounded-xl">
                                                    <Lock className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Team Visibility</h3>
                                                <p className="text-sm text-zinc-500">
                                                    {team.is_public ? 'Anyone can discover and request to join' : 'Only people with the invite code can join'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleTogglePublic}
                                            disabled={saving}
                                            className={`relative w-14 h-8 rounded-full transition-colors ${team.is_public ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${team.is_public ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden">
                                        <div className="px-5 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/50">
                                            <h3 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                                        </div>
                                        <div className="p-5 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Delete Team</h4>
                                                <p className="text-sm text-zinc-500">Permanently delete this team and all its data</p>
                                            </div>
                                            <button
                                                onClick={handleDeleteTeam}
                                                disabled={saving}
                                                className="px-4 py-2.5 text-sm font-medium text-red-600 border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Team
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
