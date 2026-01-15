'use client';

import { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Plus, Filter, Search, CheckCircle2, Clock, Target, Trophy } from 'lucide-react';
import { mockUserHackathons, UserHackathonWorkflow } from '../data/mockUserData';

const statusConfig = {
    planned: { label: 'Planned', color: 'bg-blue-500', icon: Target },
    active: { label: 'Active', color: 'bg-amber-500', icon: Clock },
    completed: { label: 'Completed', color: 'bg-emerald-500', icon: CheckCircle2 },
};

export default function MyHackathonsPage() {
    const [hackathons] = useState<UserHackathonWorkflow[]>(mockUserHackathons);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const filteredHackathons = hackathons.filter((h) => {
        const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
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
                            {(Object.entries(groupedHackathons) as [keyof typeof groupedHackathons, UserHackathonWorkflow[]][])
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
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                                                                    {hackathon.name}
                                                                </h3>
                                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                                                                    {hackathon.platform} • {hackathon.startDate} - {hackathon.endDate}
                                                                </p>
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
                                                            </div>

                                                            {hackathon.progress !== undefined && (
                                                                <div className="ml-4 text-right">
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

                                                            {hackathon.result && (
                                                                <div className="ml-4 flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                                                    <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                                                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                                                        {hackathon.result}
                                                                    </span>
                                                                </div>
                                                            )}
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
                                    No hackathons found
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
