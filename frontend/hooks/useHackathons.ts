import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getScrapedHackathonsByPlatform, getScrapedHackathons } from '@/lib/scrapedHackathonService';
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
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: hackathonKeys.user(variables.userId) });
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
