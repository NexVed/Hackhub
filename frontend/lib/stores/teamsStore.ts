import { create } from 'zustand';
import {
    getMyTeams,
    getPublicTeams,
    createTeam as createTeamApi,
    joinByCode as joinByCodeApi,
    requestToJoin as requestToJoinApi,
    hasPendingRequest,
    TeamWithMembers,
    CreateTeamData,
    Team
} from '@/lib/teamService';

interface TeamsState {
    myTeams: TeamWithMembers[];
    publicTeams: TeamWithMembers[];
    requestedTeamIds: Set<string>;
    loading: boolean;
    initialized: boolean;
    lastFetched: number | null;
    userId: string | null;

    // Actions
    fetchTeams: (userId: string, force?: boolean) => Promise<void>;
    createTeam: (userId: string, data: CreateTeamData) => Promise<Team | null>;
    joinByCode: (userId: string, code: string) => Promise<{ success: boolean; team?: Team; error?: string }>;
    requestToJoin: (userId: string, teamId: string) => Promise<boolean>;
    refreshMyTeams: (userId: string) => Promise<void>;
    reset: () => void;
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useTeamsStore = create<TeamsState>((set, get) => ({
    myTeams: [],
    publicTeams: [],
    requestedTeamIds: new Set(),
    loading: false,
    initialized: false,
    lastFetched: null,
    userId: null,

    fetchTeams: async (userId: string, force = false) => {
        const state = get();

        // Skip if same user and data is fresh
        if (
            !force &&
            state.initialized &&
            state.userId === userId &&
            state.lastFetched &&
            Date.now() - state.lastFetched < STALE_TIME
        ) {
            return;
        }

        // If different user, reset state
        if (state.userId !== userId) {
            set({ myTeams: [], publicTeams: [], requestedTeamIds: new Set(), initialized: false });
        }

        set({ loading: true, userId });

        try {
            const [myTeams, publicTeams] = await Promise.all([
                getMyTeams(userId),
                getPublicTeams(userId)
            ]);

            // Check pending requests for public teams
            const requestedIds = new Set<string>();
            for (const team of publicTeams) {
                if (await hasPendingRequest(userId, team.id)) {
                    requestedIds.add(team.id);
                }
            }

            set({
                myTeams,
                publicTeams,
                requestedTeamIds: requestedIds,
                loading: false,
                initialized: true,
                lastFetched: Date.now()
            });
        } catch (error) {
            console.error('Error fetching teams:', error);
            set({ loading: false });
        }
    },

    createTeam: async (userId: string, data: CreateTeamData) => {
        try {
            const result = await createTeamApi(userId, data);
            if (result.success && result.team) {
                // Refresh my teams to get the full team data with members
                await get().refreshMyTeams(userId);
                return result.team;
            }
            return null;
        } catch (error) {
            console.error('Error creating team:', error);
            return null;
        }
    },

    joinByCode: async (userId: string, code: string) => {
        try {
            const result = await joinByCodeApi(userId, code);
            if (result.success) {
                // Refresh my teams
                await get().refreshMyTeams(userId);
            }
            return result;
        } catch (error) {
            console.error('Error joining team:', error);
            return { success: false, error: 'An error occurred' };
        }
    },

    requestToJoin: async (userId: string, teamId: string) => {
        try {
            const result = await requestToJoinApi(userId, teamId);
            if (result.success) {
                set(state => ({
                    requestedTeamIds: new Set([...state.requestedTeamIds, teamId])
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error requesting to join:', error);
            return false;
        }
    },

    refreshMyTeams: async (userId: string) => {
        try {
            const myTeams = await getMyTeams(userId);
            set({ myTeams, lastFetched: Date.now() });
        } catch (error) {
            console.error('Error refreshing teams:', error);
        }
    },

    reset: () => {
        set({
            myTeams: [],
            publicTeams: [],
            requestedTeamIds: new Set(),
            loading: false,
            initialized: false,
            lastFetched: null,
            userId: null
        });
    }
}));
