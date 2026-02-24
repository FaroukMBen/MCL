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

export interface UserState {
    xp: number;
    level: number;
    completedItems: string[];
    achievements: Achievement[];
    addCompletedItem: (itemId: string) => void;
    removeCompletedItem: (itemId: string) => void;
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
            completedItems: [],
            achievements: INITIAL_ACHIEVEMENTS,
            addCompletedItem: (itemId) => {
                const state = get();
                if (!state.completedItems.includes(itemId)) {
                    // Check for achievements based on logic eventually
                    set({ completedItems: [...state.completedItems, itemId] });
                }
            },
            removeCompletedItem: (itemId) => {
                const state = get();
                set({ completedItems: state.completedItems.filter((i) => i !== itemId) });
            },
            addXp: (amount) => {
                const state = get();
                const newXp = state.xp + amount;
                const newLevel = Math.floor(newXp / 100) + 1; // 100 xp per level
                set({ xp: newXp, level: newLevel });
            },
            resetProgress: () => {
                set({ xp: 0, level: 1, completedItems: [], achievements: INITIAL_ACHIEVEMENTS });
            },
            importState: (newState) => {
                set({
                    xp: newState.xp || 0,
                    level: newState.level || 1,
                    completedItems: newState.completedItems || [],
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
