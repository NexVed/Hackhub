'use client';

import { useState, useCallback, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import UserProfile from '../components/dashboard/UserProfile';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import WorkflowBoard from '../components/dashboard/WorkflowBoard';
import { mockUser, mockUserHackathons, UserHackathonWorkflow } from '../data/mockUserData';
import { useAuth } from '../contexts/AuthContext';
import { getUserActivities, logActivity, ActivityDay } from '@/lib/activityService';

export default function DashboardPage() {
    const { user } = useAuth();
    const [hackathons, setHackathons] = useState<UserHackathonWorkflow[]>(mockUserHackathons);
    const [activities, setActivities] = useState<ActivityDay[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(true);

    // Fetch user activities on mount
    useEffect(() => {
        async function fetchActivities() {
            if (user?.id) {
                const data = await getUserActivities(user.id);
                setActivities(data);
            } else {
                // Use mock data for non-logged in users
                const mockData = await getUserActivities('');
                setActivities(mockData);
            }
            setLoadingActivities(false);
        }
        fetchActivities();
    }, [user?.id]);

    const handleUpdateStatus = useCallback(async (id: string, newStatus: UserHackathonWorkflow['status']) => {
        const hackathon = hackathons.find(h => h.id === id);

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

        // Log activity based on status change
        if (user?.id && hackathon) {
            let activityType: 'hackathon_register' | 'hackathon_progress' | 'hackathon_submit' = 'hackathon_progress';
            let description = `Updated ${hackathon.name}`;

            if (newStatus === 'active') {
                activityType = 'hackathon_progress';
                description = `Started working on ${hackathon.name}`;
            } else if (newStatus === 'completed') {
                activityType = 'hackathon_submit';
                description = `Completed ${hackathon.name}`;
            }

            await logActivity(user.id, activityType, description, id);

            // Refresh activities
            const data = await getUserActivities(user.id);
            setActivities(data);
        }
    }, [hackathons, user?.id]);

    // Create user profile from auth data
    const userProfile = user ? {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        username: `@${user.user_metadata?.preferred_username || user.email?.split('@')[0] || 'user'}`,
        bio: 'Hackathon enthusiast',
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        social: {}
    } : mockUser;

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
                                <UserProfile user={userProfile} />
                            </div>

                            {/* Activity Heatmap - Right */}
                            <div className="lg:col-span-2">
                                <ActivityHeatmap
                                    data={activities}
                                    loading={loadingActivities}
                                />
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

