import { create } from 'zustand';
import { getUserActivities, ActivityDay } from '@/lib/activityService';

interface ActivitiesState {
    activities: ActivityDay[];
    loading: boolean;
    initialized: boolean;
    lastFetched: number | null;
    userId: string | null;

    // Actions
    fetchActivities: (userId: string, force?: boolean) => Promise<void>;
    invalidate: () => void;
    reset: () => void;
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useActivitiesStore = create<ActivitiesState>((set, get) => ({
    activities: [],
    loading: false,
    initialized: false,
    lastFetched: null,
    userId: null,

    fetchActivities: async (userId: string, force = false) => {
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
            set({ activities: [], initialized: false });
        }

        set({ loading: true, userId });

        try {
            const data = await getUserActivities(userId);
            set({
                activities: data,
                loading: false,
                initialized: true,
                lastFetched: Date.now()
            });
        } catch (error) {
            console.error('Error fetching activities:', error);
            set({ loading: false });
        }
    },

    invalidate: () => {
        // Mark as stale so next fetch will refetch
        set({ lastFetched: null });
    },

    reset: () => {
        set({
            activities: [],
            loading: false,
            initialized: false,
            lastFetched: null,
            userId: null
        });
    }
}));
