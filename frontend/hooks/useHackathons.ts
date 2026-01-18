/**
 * TanStack Query hooks for hackathon-related API calls
 * Provides caching, background refetching, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getMNCHackathons,
    getCalendarHackathons,
    getHackathonById,
    MNCHackathon,
} from '@/lib/hackathonService';
import {
    getUserHackathons,
    registerForHackathon,
    updateUserHackathon,
    removeUserHackathon,
    isRegisteredForHackathon,
    UserHackathon,
    RegisterHackathonData,
} from '@/lib/userHackathonService';

// Query Keys - centralized for consistency
export const hackathonKeys = {
    all: ['hackathons'] as const,
    mnc: () => [...hackathonKeys.all, 'mnc'] as const,
    calendar: () => [...hackathonKeys.all, 'calendar'] as const,
    detail: (id: string) => [...hackathonKeys.all, 'detail', id] as const,
    user: (userId: string) => [...hackathonKeys.all, 'user', userId] as const,
    isRegistered: (userId: string, hackathonId: string) =>
        [...hackathonKeys.all, 'isRegistered', userId, hackathonId] as const,
};

// ============================================
// MNC Hackathons (Public hackathons list)
// ============================================

export function useMNCHackathons() {
    return useQuery({
        queryKey: hackathonKeys.mnc(),
        queryFn: getMNCHackathons,
        staleTime: 10 * 60 * 1000, // 10 minutes - these change less frequently
    });
}

// ============================================
// Calendar Hackathons
// ============================================

export function useCalendarHackathons() {
    return useQuery({
        queryKey: hackathonKeys.calendar(),
        queryFn: getCalendarHackathons,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

// ============================================
// Single Hackathon Detail
// ============================================

export function useHackathon(id: string) {
    return useQuery({
        queryKey: hackathonKeys.detail(id),
        queryFn: () => getHackathonById(id),
        enabled: !!id,
    });
}

// ============================================
// User Hackathons (User's tracked hackathons)
// ============================================

export function useUserHackathons(userId: string | undefined) {
    return useQuery({
        queryKey: hackathonKeys.user(userId || ''),
        queryFn: () => getUserHackathons(userId || ''),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// ============================================
// Check Registration Status
// ============================================

export function useIsRegistered(userId: string | undefined, hackathonId: string) {
    return useQuery({
        queryKey: hackathonKeys.isRegistered(userId || '', hackathonId),
        queryFn: () => isRegisteredForHackathon(userId || '', hackathonId),
        enabled: !!userId && !!hackathonId,
        staleTime: 60 * 1000, // 1 minute
    });
}

// ============================================
// Register for Hackathon Mutation
// ============================================

export function useRegisterForHackathon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, hackathon }: { userId: string; hackathon: RegisterHackathonData }) =>
            registerForHackathon(userId, hackathon),
        onMutate: async ({ userId, hackathon }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: hackathonKeys.user(userId) });

            // Snapshot the previous value
            const previousHackathons = queryClient.getQueryData<UserHackathon[]>(
                hackathonKeys.user(userId)
            );

            // Optimistically update
            if (previousHackathons) {
                const optimisticHackathon: UserHackathon = {
                    id: `temp-${Date.now()}`,
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
                };

                queryClient.setQueryData<UserHackathon[]>(
                    hackathonKeys.user(userId),
                    [optimisticHackathon, ...previousHackathons]
                );
            }

            // Also update isRegistered cache
            queryClient.setQueryData(
                hackathonKeys.isRegistered(userId, hackathon.hackathon_id),
                true
            );

            return { previousHackathons };
        },
        onError: (_err, { userId, hackathon }, context) => {
            // Revert on error
            if (context?.previousHackathons) {
                queryClient.setQueryData(
                    hackathonKeys.user(userId),
                    context.previousHackathons
                );
            }
            queryClient.setQueryData(
                hackathonKeys.isRegistered(userId, hackathon.hackathon_id),
                false
            );
        },
        onSuccess: (result, { userId, hackathon }) => {
            if (result.success && result.data) {
                // Replace temp entry with real data
                queryClient.setQueryData<UserHackathon[]>(
                    hackathonKeys.user(userId),
                    (old) => old?.map((h) =>
                        h.id.startsWith('temp-') && h.hackathon_id === hackathon.hackathon_id
                            ? result.data!
                            : h
                    )
                );
            }
            // Invalidate activities for heatmap refresh
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        },
    });
}

// ============================================
// Update User Hackathon Mutation
// ============================================

export function useUpdateUserHackathon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            hackathonId,
            updates,
        }: {
            hackathonId: string;
            updates: Partial<Pick<UserHackathon, 'status' | 'progress' | 'result'>>;
            userId?: string;
        }) => updateUserHackathon(hackathonId, updates),
        onMutate: async ({ hackathonId, updates }) => {
            // We need to update all user hackathon caches
            // First, find which cache has this hackathon
            const queries = queryClient.getQueriesData<UserHackathon[]>({
                queryKey: hackathonKeys.all,
            });

            let targetUserId: string | null = null;
            let previousHackathons: UserHackathon[] | undefined;

            for (const [key, data] of queries) {
                if (Array.isArray(data)) {
                    const found = data.find((h) => h.id === hackathonId);
                    if (found) {
                        targetUserId = key[2] as string; // user key is at index 2
                        previousHackathons = data;
                        break;
                    }
                }
            }

            if (targetUserId && previousHackathons) {
                await queryClient.cancelQueries({
                    queryKey: hackathonKeys.user(targetUserId),
                });

                queryClient.setQueryData<UserHackathon[]>(
                    hackathonKeys.user(targetUserId),
                    (old) => old?.map((h) => (h.id === hackathonId ? { ...h, ...updates } : h))
                );

                return { targetUserId, previousHackathons };
            }

            return { targetUserId: null, previousHackathons: undefined };
        },
        onError: (_err, _vars, context) => {
            if (context?.targetUserId && context?.previousHackathons) {
                queryClient.setQueryData(
                    hackathonKeys.user(context.targetUserId),
                    context.previousHackathons
                );
            }
        },
        onSuccess: () => {
            // Invalidate activities for heatmap refresh
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        },
    });
}

// ============================================
// Remove User Hackathon Mutation
// ============================================

export function useRemoveUserHackathon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            hackathonId,
        }: {
            hackathonId: string;
            userId?: string;
            hackathonSourceId?: string;
        }) => removeUserHackathon(hackathonId),
        onMutate: async ({ hackathonId }) => {
            // Find and update the correct cache
            const queries = queryClient.getQueriesData<UserHackathon[]>({
                queryKey: hackathonKeys.all,
            });

            let targetUserId: string | null = null;
            let previousHackathons: UserHackathon[] | undefined;
            let removedHackathon: UserHackathon | undefined;

            for (const [key, data] of queries) {
                if (Array.isArray(data)) {
                    const found = data.find((h) => h.id === hackathonId);
                    if (found) {
                        targetUserId = key[2] as string;
                        previousHackathons = data;
                        removedHackathon = found;
                        break;
                    }
                }
            }

            if (targetUserId && previousHackathons) {
                await queryClient.cancelQueries({
                    queryKey: hackathonKeys.user(targetUserId),
                });

                queryClient.setQueryData<UserHackathon[]>(
                    hackathonKeys.user(targetUserId),
                    (old) => old?.filter((h) => h.id !== hackathonId)
                );

                // Update isRegistered cache if we know the hackathon source id
                if (removedHackathon) {
                    queryClient.setQueryData(
                        hackathonKeys.isRegistered(targetUserId, removedHackathon.hackathon_id),
                        false
                    );
                }

                return { targetUserId, previousHackathons, removedHackathon };
            }

            return { targetUserId: null, previousHackathons: undefined, removedHackathon: undefined };
        },
        onError: (_err, _vars, context) => {
            if (context?.targetUserId && context?.previousHackathons) {
                queryClient.setQueryData(
                    hackathonKeys.user(context.targetUserId),
                    context.previousHackathons
                );
            }
            if (context?.targetUserId && context?.removedHackathon) {
                queryClient.setQueryData(
                    hackathonKeys.isRegistered(
                        context.targetUserId,
                        context.removedHackathon.hackathon_id
                    ),
                    true
                );
            }
        },
        onSuccess: () => {
            // Invalidate activities for heatmap refresh
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        },
    });
}

// ============================================
// Utility Hook: Invalidate all hackathon queries
// ============================================

export function useInvalidateHackathons() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () => queryClient.invalidateQueries({ queryKey: hackathonKeys.all }),
        invalidateUser: (userId: string) =>
            queryClient.invalidateQueries({ queryKey: hackathonKeys.user(userId) }),
        invalidateMNC: () =>
            queryClient.invalidateQueries({ queryKey: hackathonKeys.mnc() }),
        invalidateCalendar: () =>
            queryClient.invalidateQueries({ queryKey: hackathonKeys.calendar() }),
    };
}
