import { create } from 'zustand';
import { getMNCHackathons, getCalendarHackathons, MNCHackathon } from '@/lib/hackathonService';

interface HackathonsState {
    hackathons: MNCHackathon[];
    loading: boolean;
    initialized: boolean;
    lastFetched: number | null;

    // Actions
    fetchHackathons: (force?: boolean) => Promise<void>;
    fetchCalendarHackathons: (force?: boolean) => Promise<void>;
    reset: () => void;
}

const STALE_TIME = 10 * 60 * 1000; // 10 minutes (these change less frequently)

export const useHackathonsStore = create<HackathonsState>((set, get) => ({
    hackathons: [],
    loading: false,
    initialized: false,
    lastFetched: null,

    fetchHackathons: async (force = false) => {
        const state = get();

        // Skip if data is fresh
        if (
            !force &&
            state.initialized &&
            state.lastFetched &&
            Date.now() - state.lastFetched < STALE_TIME
        ) {
            return;
        }

        set({ loading: true });

        try {
            const data = await getMNCHackathons();
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

    fetchCalendarHackathons: async (force = false) => {
        const state = get();

        // Skip if data is fresh
        if (
            !force &&
            state.initialized &&
            state.lastFetched &&
            Date.now() - state.lastFetched < STALE_TIME
        ) {
            return;
        }

        set({ loading: true });

        try {
            const data = await getCalendarHackathons();
            set({
                hackathons: data,
                loading: false,
                initialized: true,
                lastFetched: Date.now()
            });
        } catch (error) {
            console.error('Error fetching calendar hackathons:', error);
            set({ loading: false });
        }
    },

    reset: () => {
        set({
            hackathons: [],
            loading: false,
            initialized: false,
            lastFetched: null
        });
    }
}));
