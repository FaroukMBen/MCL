import { CatalogItem } from '@/constants/data';
import * as FileSystem from 'expo-file-system/legacy';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

const FILE_URI = `${FileSystem.documentDirectory}profile_data.json`;

const fileStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(FILE_URI);
            if (fileInfo.exists) {
                const content = await FileSystem.readAsStringAsync(FILE_URI);
                const parsed = JSON.parse(content);
                return JSON.stringify(parsed[name]);
            }
            return null;
        } catch (e) {
            console.error('Error reading state from file', e);
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            let content: Record<string, any> = {};
            const fileInfo = await FileSystem.getInfoAsync(FILE_URI);
            if (fileInfo.exists) {
                content = JSON.parse(await FileSystem.readAsStringAsync(FILE_URI));
            }
            content[name] = JSON.parse(value);
            await FileSystem.writeAsStringAsync(FILE_URI, JSON.stringify(content, null, 2));
        } catch (e) {
            console.error('Error writing state to file', e);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(FILE_URI);
            if (fileInfo.exists) {
                const content = JSON.parse(await FileSystem.readAsStringAsync(FILE_URI));
                delete content[name];
                await FileSystem.writeAsStringAsync(FILE_URI, JSON.stringify(content, null, 2));
            }
        } catch (e) {
            console.error('Error removing state from file', e);
        }
    },
};

export interface Achievement {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    dateUnlocked?: number;
}

export interface Etablissement {
    id: string;
    name: string;
    type: string; // 'centre', 'ecole', etc.
    image?: string;
    location?: string;
}

export interface ActivityUsage {
    id: string;
    activityId: string;
    date: number;
    etablissementId?: string;
}

export interface UserState {
    xp: number;
    level: number;
    activityHistory: ActivityUsage[];
    achievements: Achievement[];
    username: string | null;
    customActivities: CatalogItem[];
    etablissements: Etablissement[];
    setUsername: (username: string) => void;
    addCustomActivity: (activity: CatalogItem) => void;
    updateCustomActivity: (activity: CatalogItem) => void;
    removeCustomActivity: (id: string) => void;
    addEtablissement: (etablissement: Etablissement) => void;
    updateEtablissement: (etablissement: Etablissement) => void;
    removeEtablissement: (id: string) => void;
    recordActivityUsage: (activityId: string, customDate?: number, etablissementId?: string) => void;
    addXp: (amount: number) => void;
    resetProgress: () => void;
    importState: (newState: any) => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 'first_activity', title: 'Premier pas', description: 'Terminer une première activité.', unlocked: false },
    { id: 'artist', title: 'Artiste en herbe', description: 'Terminer un coloriage.', unlocked: false },
    { id: 'gamer', title: 'Joueur', description: 'Terminer un jeu.', unlocked: false },
];

export const useStore = create<UserState>()(
    persist(
        (set, get) => ({
            xp: 0,
            level: 1,
            username: null,
            customActivities: [],
            etablissements: [],
            activityHistory: [],
            achievements: INITIAL_ACHIEVEMENTS,
            setUsername: (username) => set({ username }),
            addCustomActivity: (activity) => {
                const state = get();
                set({ customActivities: [...state.customActivities, activity] });
            },
            updateCustomActivity: (activity) => {
                const state = get();
                set({ customActivities: state.customActivities.map((a) => a.id === activity.id ? activity : a) });
            },
            removeCustomActivity: (id) => {
                const state = get();
                set({ customActivities: state.customActivities.filter((a) => a.id !== id) });
            },
            addEtablissement: (etablissement) => {
                const state = get();
                set({ etablissements: [...state.etablissements, etablissement] });
            },
            updateEtablissement: (etablissement) => {
                const state = get();
                set({ etablissements: state.etablissements.map((e) => e.id === etablissement.id ? etablissement : e) });
            },
            removeEtablissement: (id) => {
                const state = get();
                set({ etablissements: state.etablissements.filter((e) => e.id !== id) });
            },
            recordActivityUsage: (activityId, customDate, etablissementId) => {
                const state = get();
                const newUsage: ActivityUsage = {
                    id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    activityId,
                    date: customDate || Date.now(),
                    etablissementId: etablissementId || undefined,
                };
                set({ activityHistory: [...state.activityHistory, newUsage] });
            },
            addXp: (amount) => {
                const state = get();
                const newXp = state.xp + amount;
                const newLevel = Math.floor(newXp / 100) + 1; // 100 xp per level
                set({ xp: newXp, level: newLevel });
            },
            resetProgress: () => {
                set({ username: null, xp: 0, level: 1, activityHistory: [], achievements: INITIAL_ACHIEVEMENTS, customActivities: [], etablissements: [] });
            },
            importState: (newState) => {
                set({
                    username: newState.username || null,
                    customActivities: newState.customActivities || [],
                    etablissements: newState.etablissements || [],
                    xp: newState.xp || 0,
                    level: newState.level || 1,
                    activityHistory: newState.activityHistory || [],
                    achievements: newState.achievements || INITIAL_ACHIEVEMENTS,
                });
            },
        }),
        {
            name: 'mcl-user-storage',
            storage: createJSONStorage(() => fileStorage),
        }
    )
);
