'use client';

import { useState, useCallback, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import UserProfile from '../components/dashboard/UserProfile';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import WorkflowBoard from '../components/dashboard/WorkflowBoard';
import { mockUser, UserHackathonWorkflow } from '../data/mockUserData';
import { useAuth } from '../contexts/AuthContext';
import { getUserActivities, logActivity, ActivityDay } from '@/lib/activityService';
import { getUserHackathons, updateUserHackathon, removeUserHackathon, UserHackathon } from '@/lib/userHackathonService';

// Convert UserHackathon from DB to UserHackathonWorkflow for UI
function toWorkflowFormat(h: UserHackathon): UserHackathonWorkflow {
    return {
        id: h.id,
        name: h.hackathon_name,
        startDate: h.start_date || '',
        endDate: h.end_date || '',
        platform: h.platform || '',
        tags: h.tags || [],
        url: h.hackathon_url || '',
        status: h.status,
        progress: h.progress,
        result: h.result ? h.result.charAt(0).toUpperCase() + h.result.slice(1) : undefined,
    };
}

export default function DashboardPage() {
    const { user, profile } = useAuth();
    const [hackathons, setHackathons] = useState<UserHackathonWorkflow[]>([]);
    const [activities, setActivities] = useState<ActivityDay[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [loadingHackathons, setLoadingHackathons] = useState(true);

    // Fetch user hackathons on mount
    useEffect(() => {
        async function fetchHackathons() {
            if (user?.id) {
                const data = await getUserHackathons(user.id);
                setHackathons(data.map(toWorkflowFormat));
            }
            setLoadingHackathons(false);
        }
        fetchHackathons();
    }, [user?.id]);

    // Fetch user activities on mount
    useEffect(() => {
        async function fetchActivities() {
            if (user?.id) {
                const data = await getUserActivities(user.id);
                setActivities(data);
            } else {
                const mockData = await getUserActivities('');
                setActivities(mockData);
            }
            setLoadingActivities(false);
        }
        fetchActivities();
    }, [user?.id]);

    const handleUpdateStatus = useCallback(async (id: string, newStatus: UserHackathonWorkflow['status']) => {
        const hackathon = hackathons.find(h => h.id === id);

        // Calculate new progress and result
        let newProgress = hackathon?.progress || 0;
        let newResult: string | undefined = hackathon?.result;

        if (newStatus === 'active' && !newProgress) {
            newProgress = 10;
        }
        if (newStatus === 'completed') {
            newProgress = 100;
            if (!newResult) {
                newResult = 'Participated';
            }
        }

        // Update local state immediately for responsive UI
        setHackathons((prev) =>
            prev.map((h) => {
                if (h.id === id) {
                    return { ...h, status: newStatus, progress: newProgress, result: newResult };
                }
                return h;
            })
        );

        // Save to database
        await updateUserHackathon(id, {
            status: newStatus,
            progress: newProgress,
            result: newResult?.toLowerCase() as 'winner' | 'finalist' | 'participated' | undefined
        });

        // Refresh activities
        if (user?.id) {
            const data = await getUserActivities(user.id);
            setActivities(data);
        }
    }, [hackathons, user?.id]);

    // Handle remove hackathon
    const handleRemove = useCallback(async (id: string) => {
        // Remove from local state immediately
        setHackathons(prev => prev.filter(h => h.id !== id));

        // Remove from database
        await removeUserHackathon(id);
    }, []);

    // Create user profile from auth data AND database profile
    const userProfile = user ? {
        id: user.id,
        name: profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        username: profile?.username ? `@${profile.username}` : `@${user.user_metadata?.preferred_username || user.email?.split('@')[0] || 'user'}`,
        bio: profile?.bio || profile?.headline || 'Hackathon enthusiast',
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        social: {
            github: profile?.social_github || undefined,
            linkedin: profile?.social_linkedin || undefined,
            twitter: profile?.social_twitter || undefined,
            instagram: profile?.social_instagram || undefined,
            threads: profile?.social_threads || undefined,
        }
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
                            onRemove={handleRemove}
                            loading={loadingHackathons}
                        />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
