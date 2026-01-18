/**
 * TanStack Query hooks for team-related API calls
 * Provides caching, background refetching, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getMyTeams,
    getPublicTeams,
    getTeamDetails,
    createTeam,
    joinByCode,
    requestToJoin,
    handleRequest,
    removeMember,
    updateTeam,
    deleteTeam,
    hasPendingRequest,
    uploadTeamLogo,
    Team,
    TeamWithMembers,
    TeamDetails,
    CreateTeamData,
} from '@/lib/teamService';

// Query Keys - centralized for consistency
export const teamKeys = {
    all: ['teams'] as const,
    my: (userId: string) => [...teamKeys.all, 'my', userId] as const,
    public: (userId?: string) => [...teamKeys.all, 'public', userId || 'anon'] as const,
    detail: (teamId: string) => [...teamKeys.all, 'detail', teamId] as const,
    hasPending: (userId: string, teamId: string) =>
        [...teamKeys.all, 'hasPending', userId, teamId] as const,
};

// ============================================
// My Teams
// ============================================

export function useMyTeams(userId: string | undefined) {
    return useQuery({
        queryKey: teamKeys.my(userId || ''),
        queryFn: () => getMyTeams(userId || ''),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// ============================================
// Public Teams (for browsing)
// ============================================

export function usePublicTeams(userId?: string) {
    return useQuery({
        queryKey: teamKeys.public(userId),
        queryFn: () => getPublicTeams(userId),
        staleTime: 3 * 60 * 1000, // 3 minutes
    });
}

// ============================================
// Team Details
// ============================================

export function useTeamDetails(teamId: string | undefined) {
    return useQuery({
        queryKey: teamKeys.detail(teamId || ''),
        queryFn: () => getTeamDetails(teamId || ''),
        enabled: !!teamId,
        staleTime: 60 * 1000, // 1 minute - team details change more frequently
    });
}

// ============================================
// Check Pending Request
// ============================================

export function useHasPendingRequest(userId: string | undefined, teamId: string) {
    return useQuery({
        queryKey: teamKeys.hasPending(userId || '', teamId),
        queryFn: () => hasPendingRequest(userId || '', teamId),
        enabled: !!userId && !!teamId,
        staleTime: 30 * 1000, // 30 seconds
    });
}

// ============================================
// Create Team Mutation
// ============================================

export function useCreateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: CreateTeamData }) =>
            createTeam(userId, data),
        onSuccess: (_result, { userId }) => {
            // Invalidate my teams to refetch
            queryClient.invalidateQueries({ queryKey: teamKeys.my(userId) });
        },
    });
}

// ============================================
// Join Team by Code Mutation
// ============================================

export function useJoinByCode() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, code }: { userId: string; code: string }) =>
            joinByCode(userId, code),
        onSuccess: (_result, { userId }) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.my(userId) });
        },
    });
}

// ============================================
// Request to Join Mutation
// ============================================

export function useRequestToJoin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, teamId }: { userId: string; teamId: string }) =>
            requestToJoin(userId, teamId),
        onSuccess: (_result, { userId, teamId }) => {
            // Update hasPending cache
            queryClient.setQueryData(teamKeys.hasPending(userId, teamId), true);
        },
    });
}

// ============================================
// Handle Join Request Mutation
// ============================================

export function useHandleRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            requestId,
            action,
        }: {
            requestId: string;
            action: 'accept' | 'decline';
            teamId: string;
        }) => handleRequest(requestId, action),
        onSuccess: (_result, { teamId }) => {
            // Invalidate team details to refresh
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
        },
    });
}

// ============================================
// Remove Member Mutation
// ============================================

export function useRemoveMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
            removeMember(teamId, userId),
        onSuccess: (_result, { teamId }) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
        },
    });
}

// ============================================
// Update Team Mutation
// ============================================

export function useUpdateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            teamId,
            updates,
        }: {
            teamId: string;
            updates: Partial<Pick<Team, 'name' | 'description' | 'status' | 'is_public'>>;
        }) => updateTeam(teamId, updates),
        onMutate: async ({ teamId, updates }) => {
            await queryClient.cancelQueries({ queryKey: teamKeys.detail(teamId) });

            const previousData = queryClient.getQueryData<TeamDetails>(teamKeys.detail(teamId));

            if (previousData) {
                queryClient.setQueryData<TeamDetails>(teamKeys.detail(teamId), {
                    ...previousData,
                    ...updates,
                });
            }

            return { previousData };
        },
        onError: (_err, { teamId }, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(teamKeys.detail(teamId), context.previousData);
            }
        },
    });
}

// ============================================
// Delete Team Mutation
// ============================================

export function useDeleteTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId }: { teamId: string; userId?: string }) => deleteTeam(teamId),
        onSuccess: (_result, { userId }) => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: teamKeys.my(userId) });
            }
            queryClient.invalidateQueries({ queryKey: teamKeys.all });
        },
    });
}

// ============================================
// Upload Team Logo Mutation
// ============================================

export function useUploadTeamLogo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, file }: { teamId: string; file: File }) =>
            uploadTeamLogo(teamId, file),
        onSuccess: (_result, { teamId }) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
        },
    });
}

// ============================================
// Utility Hook: Invalidate team queries
// ============================================

export function useInvalidateTeams() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () => queryClient.invalidateQueries({ queryKey: teamKeys.all }),
        invalidateMy: (userId: string) =>
            queryClient.invalidateQueries({ queryKey: teamKeys.my(userId) }),
        invalidatePublic: () =>
            queryClient.invalidateQueries({ queryKey: teamKeys.public() }),
        invalidateDetail: (teamId: string) =>
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) }),
    };
}
