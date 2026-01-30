import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getScrapedHackathonsByPlatform, getScrapedHackathons, getScrapedHackathonsOverview } from '@/lib/scrapedHackathonService';
import { getUserHackathons, registerForHackathon, removeUserHackathon, updateUserHackathon, UserHackathon } from '@/lib/userHackathonService';

// Query Keys
import { activityKeys } from './useActivities';

export const hackathonKeys = {
    all: ['hackathons'] as const,
    lists: () => [...hackathonKeys.all, 'list'] as const,
    list: (platform: string) => [...hackathonKeys.lists(), platform] as const,
    user: (userId: string | undefined) => [...hackathonKeys.all, 'user', userId] as const,
};

export function useHackathons(platform?: string) {
    return useInfiniteQuery({
        queryKey: hackathonKeys.list(platform || 'all'),
        queryFn: async ({ pageParam = 0 }) => {
            // Fetch more items per page to show all platforms faster
            const pageSize = 50;
            if (platform) {
                return getScrapedHackathonsByPlatform(platform, pageParam, pageSize);
            } else {
                return getScrapedHackathons(pageParam, pageSize);
            }
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            // If the last page has fewer items than requested, we've reached the end
            if (lastPage.length < 50) return undefined;
            return allPages.length;
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
}

export function useHackathonOverview() {
    return useQuery({
        queryKey: ['hackathons', 'overview'],
        queryFn: getScrapedHackathonsOverview,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useUserHackathons(userId: string | undefined) {
    return useQuery({
        queryKey: hackathonKeys.user(userId),
        queryFn: () => getUserHackathons(userId!),
        enabled: !!userId,
    });
}

export function useRegisterForHackathon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, hackathon }: { userId: string; hackathon: any }) =>
            registerForHackathon(userId, hackathon),
        onMutate: async ({ userId, hackathon }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: hackathonKeys.user(userId) });

            // Snapshot the previous value
            const previousHackathons = queryClient.getQueryData<UserHackathon[]>(hackathonKeys.user(userId));
            const previousActivities = queryClient.getQueryData<any[]>(activityKeys.heatmap(userId));

            // Create optimistic hackathon object
            const newHackathon: UserHackathon = {
                id: 'temp-' + Math.random().toString(36).substr(2, 9),
                user_id: userId,
                hackathon_id: hackathon.hackathon_id,
                hackathon_name: hackathon.hackathon_name,
                hackathon_url: hackathon.hackathon_url,
                platform: hackathon.platform,
                tags: hackathon.tags || [],
                start_date: hackathon.start_date,
                end_date: hackathon.end_date,
                status: hackathon.status || 'planned',
                progress: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Optimistically update hackathons list
            queryClient.setQueryData<UserHackathon[]>(hackathonKeys.user(userId), (old) => {
                return [newHackathon, ...(old || [])];
            });

            // Optimistically update heatmap
            const today = new Date().toISOString().split('T')[0];
            queryClient.setQueryData<any[]>(activityKeys.heatmap(userId), (old) => {
                const newData = [...(old || [])];
                const todayActivity = newData.find((d: any) => d.date === today);

                if (todayActivity) {
                    todayActivity.level = 2; // Set to green
                    todayActivity.activities.push({
                        type: 'hackathon_track',
                        description: `Tracked ${hackathon.hackathon_name}`,
                        hackathonId: hackathon.hackathon_id
                    });
                } else {
                    newData.push({
                        date: today,
                        level: 2,
                        description: `Tracked ${hackathon.hackathon_name}`,
                        activities: [{
                            type: 'hackathon_track',
                            description: `Tracked ${hackathon.hackathon_name}`,
                            hackathonId: hackathon.hackathon_id
                        }]
                    });
                }
                return newData;
            });

            // Return contexts
            return { previousHackathons, previousActivities };
        },
        onError: (err, { userId }, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousHackathons) {
                queryClient.setQueryData(hackathonKeys.user(userId), context.previousHackathons);
            }
            if (context?.previousActivities) {
                queryClient.setQueryData(activityKeys.heatmap(userId), context.previousActivities);
            }
        },
        onSettled: (_, __, { userId }) => {
            // Always refetch after error or success to ensure cache is consistent
            queryClient.invalidateQueries({ queryKey: hackathonKeys.user(userId) });
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
        },
    });
}

// Placeholder hooks to satisfy existing imports if they exist elsewhere or might be needed
// Adjust implementation as needed based on actual service functions
export function useUpdateUserHackathon() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ hackathonId, updates }: { hackathonId: string; updates: any }) =>
            updateUserHackathon(hackathonId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hackathonKeys.all });
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
        }
    });
}

export function useRemoveUserHackathon() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hackathonId: string) => removeUserHackathon(hackathonId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hackathonKeys.all });
        }
    });
}

// MNC Hackathons hook using backend API
export function useMNCHackathons() {
    return useQuery({
        queryKey: ['hackathons', 'mnc'],
        queryFn: async () => {
            const { getMNCHackathons } = await import('@/lib/hackathonService');
            return getMNCHackathons();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Calendar Hackathons hook using backend API
export function useCalendarHackathons() {
    return useQuery({
        queryKey: ['hackathons', 'calendar'],
        queryFn: async () => {
            const { getCalendarHackathons } = await import('@/lib/hackathonService');
            return getCalendarHackathons();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Single hackathon hook
export function useHackathon(id: string) {
    return useQuery({
        queryKey: ['hackathons', 'single', id],
        queryFn: async () => {
            const { getHackathonById } = await import('@/lib/hackathonService');
            return getHackathonById(id);
        },
        enabled: !!id,
    });
}

export function useIsRegistered(id: string) { return false; }
export function useIsMobile() { return false; }

export function useInvalidateHackathons() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: hackathonKeys.all });
}
