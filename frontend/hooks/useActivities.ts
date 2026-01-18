/**
 * TanStack Query hooks for activity-related API calls
 * Provides caching for the activity heatmap data
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserActivities, ActivityDay } from '@/lib/activityService';

// Query Keys
export const activityKeys = {
    all: ['activities'] as const,
    heatmap: (userId: string) => [...activityKeys.all, 'heatmap', userId] as const,
};

// ============================================
// Activity Heatmap Data
// ============================================

export function useActivityHeatmap(userId: string | undefined) {
    return useQuery({
        queryKey: activityKeys.heatmap(userId || ''),
        queryFn: () => getUserActivities(userId || ''),
        enabled: !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        // Activities are time-sensitive for the heatmap
    });
}

// ============================================
// Utility Hook: Invalidate activity queries
// ============================================

export function useInvalidateActivities() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () => queryClient.invalidateQueries({ queryKey: activityKeys.all }),
        invalidateHeatmap: (userId: string) =>
            queryClient.invalidateQueries({ queryKey: activityKeys.heatmap(userId) }),
    };
}
