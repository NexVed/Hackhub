'use client';

import { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import UserProfile from '../components/dashboard/UserProfile';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import WorkflowBoard from '../components/dashboard/WorkflowBoard';
import { mockUser, mockActivityData, mockUserHackathons, UserHackathonWorkflow } from '../data/mockUserData';

export default function DashboardPage() {
    const [hackathons, setHackathons] = useState<UserHackathonWorkflow[]>(mockUserHackathons);

    const handleUpdateStatus = useCallback((id: string, newStatus: UserHackathonWorkflow['status']) => {
        setHackathons((prev) =>
            prev.map((h) => {
                if (h.id === id) {
                    const updated: UserHackathonWorkflow = { ...h, status: newStatus };

                    // Update progress based on status
                    if (newStatus === 'active' && !updated.progress) {
                        updated.progress = 10;
                    }
                    if (newStatus === 'completed') {
                        updated.progress = 100;
                        if (!updated.result) {
                            updated.result = 'Participated';
                        }
                    }

                    return updated;
                }
                return h;
            })
        );
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TopBar>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</span>
                </TopBar>

                <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Top Section: Profile & Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* User Profile - Left */}
                            <div className="lg:col-span-1">
                                <UserProfile user={mockUser} />
                            </div>

                            {/* Activity Heatmap - Right */}
                            <div className="lg:col-span-2">
                                <ActivityHeatmap data={mockActivityData} />
                            </div>
                        </div>

                        {/* Bottom Section: Workflow Board */}
                        <WorkflowBoard
                            hackathons={hackathons}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
