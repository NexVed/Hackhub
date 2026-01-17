import { create } from 'zustand';
import {
    getUserHackathons,
    updateUserHackathon as updateHackathonApi,
    removeUserHackathon as removeHackathonApi,
    registerForHackathon,
    UserHackathon,
    RegisterHackathonData
} from '@/lib/userHackathonService';
import { useActivitiesStore } from './activitiesStore';

interface UserHackathonsState {
    hackathons: UserHackathon[];
    loading: boolean;
    initialized: boolean;
    lastFetched: number | null;
    userId: string | null;

    // Actions
    fetchHackathons: (userId: string, force?: boolean) => Promise<void>;
    updateHackathon: (id: string, updates: Partial<Pick<UserHackathon, 'status' | 'progress' | 'result'>>) => Promise<boolean>;
    removeHackathon: (id: string) => Promise<boolean>;
    addHackathon: (userId: string, hackathon: RegisterHackathonData) => Promise<UserHackathon | null>;
    reset: () => void;
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useUserHackathonsStore = create<UserHackathonsState>((set, get) => ({
    hackathons: [],
    loading: false,
    initialized: false,
    lastFetched: null,
    userId: null,

    fetchHackathons: async (userId: string, force = false) => {
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
            set({ hackathons: [], initialized: false });
        }

        set({ loading: true, userId });

        try {
            const data = await getUserHackathons(userId);
            set({
                hackathons: data,
                loading: false,
                initialized: true,
                lastFetched: Date.now()
            });
        } catch (error) {
            console.error('Error fetching hackathons:', error);
            set({ loading: false });
        }
    },

    updateHackathon: async (id: string, updates) => {
        const state = get();

        // Optimistic update
        set({
            hackathons: state.hackathons.map(h =>
                h.id === id ? { ...h, ...updates } : h
            )
        });

        try {
            const result = await updateHackathonApi(id, updates);
            if (!result.success) {
                // Revert on failure
                set({ hackathons: state.hackathons });
                return false;
            }
            // Invalidate activities so heatmap refreshes on next view
            useActivitiesStore.getState().invalidate();
            return true;
        } catch (error) {
            // Revert on error
            set({ hackathons: state.hackathons });
            console.error('Error updating hackathon:', error);
            return false;
        }
    },

    removeHackathon: async (id: string) => {
        const state = get();

        // Optimistic update
        set({
            hackathons: state.hackathons.filter(h => h.id !== id)
        });

        try {
            const result = await removeHackathonApi(id);
            if (!result.success) {
                // Revert on failure
                set({ hackathons: state.hackathons });
                return false;
            }
            // Invalidate activities so heatmap refreshes on next view
            useActivitiesStore.getState().invalidate();
            return true;
        } catch (error) {
            // Revert on error
            set({ hackathons: state.hackathons });
            console.error('Error removing hackathon:', error);
            return false;
        }
    },

    addHackathon: async (userId: string, hackathon: RegisterHackathonData) => {
        // Create optimistic temporary entry with a temp ID
        const tempId = `temp-${Date.now()}`;
        const optimisticHackathon = {
            id: tempId,
            user_id: userId,
            hackathon_id: hackathon.hackathon_id,
            hackathon_name: hackathon.hackathon_name,
            hackathon_url: hackathon.hackathon_url,
            platform: hackathon.platform,
            tags: hackathon.tags || [],
            start_date: hackathon.start_date,
            end_date: hackathon.end_date,
            status: hackathon.status || 'planned' as const,
            progress: 0,
            registered_at: new Date().toISOString(),
        };

        // Optimistic update - add immediately
        set(state => ({
            hackathons: [optimisticHackathon, ...state.hackathons]
        }));

        try {
            const result = await registerForHackathon(userId, hackathon);
            if (result.success && result.data) {
                // Replace temp entry with real data
                set(state => ({
                    hackathons: state.hackathons.map(h =>
                        h.id === tempId ? result.data! : h
                    )
                }));
                // Invalidate activities so heatmap refreshes on next view
                useActivitiesStore.getState().invalidate();
                return result.data;
            } else {
                // Revert optimistic update on failure
                set(state => ({
                    hackathons: state.hackathons.filter(h => h.id !== tempId)
                }));
                return null;
            }
        } catch (error) {
            // Revert optimistic update on error
            set(state => ({
                hackathons: state.hackathons.filter(h => h.id !== tempId)
            }));
            console.error('Error adding hackathon:', error);
            return null;
        }
    },

    reset: () => {
        set({
            hackathons: [],
            loading: false,
            initialized: false,
            lastFetched: null,
            userId: null
        });
    }
}));
