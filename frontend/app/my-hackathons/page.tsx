'use client';

import { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Search, CheckCircle2, Clock, Target, Trophy, Medal, Award, Star, X, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserHackathons, useUpdateUserHackathon, useRemoveUserHackathon } from '@/hooks';
import { UserHackathon } from '@/lib/userHackathonService';

const statusConfig = {
    planned: { label: 'Planned', color: 'bg-blue-500', icon: Target },
    active: { label: 'Active', color: 'bg-amber-500', icon: Clock },
    completed: { label: 'Completed', color: 'bg-emerald-500', icon: CheckCircle2 },
};

const resultOptions = [
    { value: 'winner', label: 'Winner', icon: Trophy, color: 'bg-amber-500 text-amber-950' },
    { value: 'finalist', label: 'Runner-up / Finalist', icon: Medal, color: 'bg-slate-400 text-slate-950' },
    { value: 'participated', label: 'Participated', icon: Star, color: 'bg-zinc-400 text-zinc-950' },
];

export default function MyHackathonsPage() {
    const { user } = useAuth();

    // Use TanStack Query for hackathons - auto-fetches, caches, and syncs
    const { data: hackathons = [], isLoading: loading } = useUserHackathons(user?.id);

    // Mutations with optimistic updates
    const updateMutation = useUpdateUserHackathon();
    const removeMutation = useRemoveUserHackathon();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [resultModal, setResultModal] = useState<{ hackathonId: string; hackathonName: string } | null>(null);

    const handleUpdateStatus = useCallback(async (id: string, newStatus: 'planned' | 'active' | 'completed') => {
        // If moving to completed, show the result modal
        if (newStatus === 'completed') {
            const hackathon = hackathons.find(h => h.id === id);
            if (hackathon && !hackathon.result) {
                setResultModal({ hackathonId: id, hackathonName: hackathon.hackathon_name });
                return;
            }
        }

        // Update via TanStack Query mutation (optimistic update built-in)
        updateMutation.mutate({
            hackathonId: id,
            updates: {
                status: newStatus,
                progress: newStatus === 'completed' ? 100 : (newStatus === 'active' ? 10 : 0)
            },
            userId: user?.id
        });
    }, [hackathons, updateMutation, user?.id]);

    const handleSetResult = useCallback(async (result: 'winner' | 'finalist' | 'participated') => {
        if (!resultModal) return;

        // Update via TanStack Query mutation
        updateMutation.mutate({
            hackathonId: resultModal.hackathonId,
            updates: {
                status: 'completed',
                progress: 100,
                result
            },
            userId: user?.id
        }, {
            onSuccess: () => setResultModal(null)
        });
    }, [resultModal, updateMutation, user?.id]);

    const handleRemove = useCallback(async (id: string) => {
        removeMutation.mutate({
            hackathonId: id,
            userId: user?.id
        });
    }, [removeMutation, user?.id]);

    const filteredHackathons = hackathons.filter((h) => {
        const matchesSearch = h.hackathon_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || h.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const groupedHackathons = {
        planned: filteredHackathons.filter(h => h.status === 'planned'),
        active: filteredHackathons.filter(h => h.status === 'active'),
        completed: filteredHackathons.filter(h => h.status === 'completed'),
    };

    const stats = {
        total: hackathons.length,
        planned: hackathons.filter(h => h.status === 'planned').length,
        active: hackathons.filter(h => h.status === 'active').length,
        completed: hackathons.filter(h => h.status === 'completed').length,
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'TBD';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getResultBadge = (result?: string) => {
        const option = resultOptions.find(o => o.value === result);
        if (!option) return null;
        const Icon = option.icon;
        return (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${option.color}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{option.label}</span>
            </div>
        );
    };

    if (loading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <TopBar>
                        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">My Hackathons</span>
                    </TopBar>
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
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        My Hackathons
                    </span>
                </TopBar>

                <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-auto">
                    <div className="max-w-7xl mx-auto p-6 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total</p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.total}</p>
                            </div>
                            {Object.entries(statusConfig).map(([key, config]) => (
                                <div key={key} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{config.label}</p>
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                        {stats[key as keyof typeof stats]}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search hackathons..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                                />
                            </div>
                            <div className="flex gap-2">
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => setStatusFilter(statusFilter === key ? null : key)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === key
                                            ? `${config.color} text-white`
                                            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        {config.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hackathon List */}
                        <div className="space-y-6">
                            {(Object.entries(groupedHackathons) as [keyof typeof groupedHackathons, UserHackathon[]][])
                                .filter(([_, items]) => items.length > 0)
                                .map(([status, items]) => {
                                    const config = statusConfig[status];
                                    const StatusIcon = config.icon;

                                    return (
                                        <div key={status}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`p-1 rounded ${config.color}`}>
                                                    <StatusIcon className="w-4 h-4 text-white" />
                                                </div>
                                                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                                                    {config.label}
                                                </h2>
                                                <span className="text-xs text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                                    {items.length}
                                                </span>
                                            </div>

                                            <div className="grid gap-3">
                                                {items.map((hackathon) => (
                                                    <div
                                                        key={hackathon.id}
                                                        className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                                                                    {hackathon.hackathon_name}
                                                                </h3>
                                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                                                                    {hackathon.platform || 'Unknown'} • {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                                                                </p>
                                                                {hackathon.tags && hackathon.tags.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {hackathon.tags.map((tag) => (
                                                                            <span
                                                                                key={tag}
                                                                                className="px-2 py-0.5 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-md"
                                                                            >
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {/* Progress for active */}
                                                                {hackathon.status === 'active' && (
                                                                    <div className="text-right">
                                                                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                                            {hackathon.progress}%
                                                                        </span>
                                                                        <div className="w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mt-1 overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-violet-500 rounded-full transition-all"
                                                                                style={{ width: `${hackathon.progress}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Result badge or Set Result button */}
                                                                {hackathon.status === 'completed' && (
                                                                    hackathon.result ? (
                                                                        getResultBadge(hackathon.result)
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => setResultModal({ hackathonId: hackathon.id, hackathonName: hackathon.hackathon_name })}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                                                        >
                                                                            <Award className="w-3.5 h-3.5" />
                                                                            Set Result
                                                                        </button>
                                                                    )
                                                                )}

                                                                {/* Status dropdown */}
                                                                <select
                                                                    value={hackathon.status}
                                                                    onChange={(e) => handleUpdateStatus(hackathon.id, e.target.value as any)}
                                                                    className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none"
                                                                >
                                                                    <option value="planned">Planned</option>
                                                                    <option value="active">Active</option>
                                                                    <option value="completed">Completed</option>
                                                                </select>

                                                                {/* Actions */}
                                                                {hackathon.hackathon_url && (
                                                                    <a
                                                                        href={hackathon.hackathon_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                                                    >
                                                                        <ExternalLink className="w-4 h-4" />
                                                                    </a>
                                                                )}
                                                                <button
                                                                    onClick={() => handleRemove(hackathon.id)}
                                                                    className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Empty State */}
                        {filteredHackathons.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                                    <Search className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                                    {hackathons.length === 0 ? 'No hackathons tracked yet' : 'No hackathons found'}
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {hackathons.length === 0
                                        ? 'Go to Discover or Calendar to track hackathons'
                                        : 'Try adjusting your search or filters'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>

            {/* Result Selection Modal */}
            {resultModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                Hackathon Result
                            </h2>
                            <button
                                onClick={() => setResultModal(null)}
                                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                            How did you do in <strong className="text-zinc-900 dark:text-zinc-100">{resultModal.hackathonName}</strong>?
                        </p>

                        <div className="space-y-3">
                            {resultOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSetResult(option.value as any)}
                                        disabled={updateMutation.isPending}
                                        className="w-full flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all"
                                    >
                                        <div className={`p-2 rounded-full ${option.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {option.label}
                                        </span>
                                        {updateMutation.isPending && (
                                            <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </SidebarProvider>
    );
}
