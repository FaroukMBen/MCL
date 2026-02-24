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

// ─── Achievement Definitions ─────────────────────────────────────────
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // SF Symbol name
    rarity: AchievementRarity;
    unlocked: boolean;
    dateUnlocked?: number;
    xpReward: number;
    // Condition function params (checked against state)
    condition: {
        type: 'usage_count' | 'unique_activities' | 'unique_etabs' | 'category_count' | 'streak_days' | 'level' | 'custom_activities' | 'etab_count';
        target: number;
        category?: string;
    };
}

export interface Etablissement {
    id: string;
    name: string;
    type: string;
    image?: string;
    location?: string;
}

export interface ActivityUsage {
    id: string;
    activityId: string;
    date: number;
    etablissementId?: string;
}

export interface AchievementNotification {
    id: string;
    achievement: Achievement;
    timestamp: number;
}

// ─── XP & Level System ───────────────────────────────────────────────
export const XP_PER_USAGE = 25;
export const XP_PER_NEW_ACTIVITY = 50;
export const XP_PER_LEVEL_BASE = 100;

export function getXpForLevel(level: number): number {
    return Math.floor(XP_PER_LEVEL_BASE * Math.pow(1.15, level - 1));
}

export function getLevelFromXp(totalXp: number): { level: number; currentLevelXp: number; nextLevelXp: number } {
    let level = 1;
    let xpRemaining = totalXp;
    while (true) {
        const needed = getXpForLevel(level);
        if (xpRemaining < needed) {
            return { level, currentLevelXp: xpRemaining, nextLevelXp: needed };
        }
        xpRemaining -= needed;
        level++;
    }
}

export const LEVEL_TITLES: Record<number, string> = {
    1: 'Débutant',
    3: 'Apprenti',
    5: 'Animateur',
    8: 'Expert',
    10: 'Maître',
    15: 'Légende',
    20: 'Virtuose',
};

export function getLevelTitle(level: number): string {
    let title = 'Débutant';
    for (const [lvl, t] of Object.entries(LEVEL_TITLES)) {
        if (level >= Number(lvl)) title = t;
    }
    return title;
}

export const RARITY_COLORS: Record<AchievementRarity, string> = {
    common: '#78909c',
    rare: '#0a7ea4',
    epic: '#7c4dff',
    legendary: '#ff9100',
};

export const RARITY_LABELS: Record<AchievementRarity, string> = {
    common: 'Commun',
    rare: 'Rare',
    epic: 'Épique',
    legendary: 'Légendaire',
};

// ─── All Achievements ────────────────────────────────────────────────
const ALL_ACHIEVEMENTS: Achievement[] = [
    // Usage milestones
    { id: 'first_step', title: 'Premier Pas', description: 'Enregistrer votre première utilisation.', icon: 'star.fill', rarity: 'common', unlocked: false, xpReward: 50, condition: { type: 'usage_count', target: 1 } },
    { id: 'getting_started', title: 'Bien Parti', description: 'Enregistrer 5 utilisations.', icon: 'bolt.fill', rarity: 'common', unlocked: false, xpReward: 75, condition: { type: 'usage_count', target: 5 } },
    { id: 'regular', title: 'Habitué', description: 'Enregistrer 10 utilisations.', icon: 'flame.fill', rarity: 'common', unlocked: false, xpReward: 100, condition: { type: 'usage_count', target: 10 } },
    { id: 'dedicated', title: 'Dévoué', description: 'Enregistrer 25 utilisations.', icon: 'heart.fill', rarity: 'rare', unlocked: false, xpReward: 200, condition: { type: 'usage_count', target: 25 } },
    { id: 'veteran', title: 'Vétéran', description: 'Enregistrer 50 utilisations.', icon: 'trophy.fill', rarity: 'epic', unlocked: false, xpReward: 500, condition: { type: 'usage_count', target: 50 } },
    { id: 'legend', title: 'Légende Vivante', description: 'Enregistrer 100 utilisations.', icon: 'crown.fill', rarity: 'legendary', unlocked: false, xpReward: 1000, condition: { type: 'usage_count', target: 100 } },

    // Diversity
    { id: 'explorer', title: 'Explorateur', description: 'Utiliser 3 activités différentes.', icon: 'map.fill', rarity: 'common', unlocked: false, xpReward: 75, condition: { type: 'unique_activities', target: 3 } },
    { id: 'curious', title: 'Curieux', description: 'Utiliser 6 activités différentes.', icon: 'magnifyingglass', rarity: 'rare', unlocked: false, xpReward: 150, condition: { type: 'unique_activities', target: 6 } },
    { id: 'polyvalent', title: 'Polyvalent', description: 'Utiliser 10 activités différentes.', icon: 'sparkles', rarity: 'epic', unlocked: false, xpReward: 300, condition: { type: 'unique_activities', target: 10 } },

    // Categories
    { id: 'artist', title: 'Artiste en Herbe', description: 'Utiliser 3 coloriages.', icon: 'paintbrush.fill', rarity: 'common', unlocked: false, xpReward: 100, condition: { type: 'category_count', target: 3, category: 'Coloriage' } },
    { id: 'gamer', title: 'Joueur Né', description: 'Utiliser 3 jeux.', icon: 'gamecontroller.fill', rarity: 'common', unlocked: false, xpReward: 100, condition: { type: 'category_count', target: 3, category: 'Jeux' } },
    { id: 'animator', title: 'Animateur Pro', description: 'Utiliser 5 activités.', icon: 'bolt.fill', rarity: 'rare', unlocked: false, xpReward: 150, condition: { type: 'category_count', target: 5, category: 'Activités' } },

    // Establishments
    { id: 'first_etab', title: 'Nouveau Lieu', description: 'Créer votre premier établissement.', icon: 'building.2.fill', rarity: 'common', unlocked: false, xpReward: 50, condition: { type: 'etab_count', target: 1 } },
    { id: 'multi_etab', title: 'Multi-Sites', description: 'Avoir 3 établissements.', icon: 'map.fill', rarity: 'rare', unlocked: false, xpReward: 150, condition: { type: 'etab_count', target: 3 } },
    { id: 'nomad', title: 'Nomade', description: 'Enregistrer dans 3 établissements différents.', icon: 'target', rarity: 'rare', unlocked: false, xpReward: 200, condition: { type: 'unique_etabs', target: 3 } },

    // Custom content
    { id: 'creator', title: 'Créateur', description: 'Créer votre première activité personnalisée.', icon: 'pencil', rarity: 'common', unlocked: false, xpReward: 75, condition: { type: 'custom_activities', target: 1 } },
    { id: 'prolific', title: 'Prolifique', description: 'Créer 5 activités personnalisées.', icon: 'folder.fill', rarity: 'rare', unlocked: false, xpReward: 200, condition: { type: 'custom_activities', target: 5 } },

    // Level milestones
    { id: 'level5', title: 'Animateur', description: 'Atteindre le niveau 5.', icon: 'arrow.up.circle.fill', rarity: 'rare', unlocked: false, xpReward: 200, condition: { type: 'level', target: 5 } },
    { id: 'level10', title: 'Maître Animateur', description: 'Atteindre le niveau 10.', icon: 'crown.fill', rarity: 'epic', unlocked: false, xpReward: 500, condition: { type: 'level', target: 10 } },
    { id: 'level20', title: 'Virtuose Absolu', description: 'Atteindre le niveau 20.', icon: 'sparkles', rarity: 'legendary', unlocked: false, xpReward: 1000, condition: { type: 'level', target: 20 } },
];

// ─── State Interface ─────────────────────────────────────────────────
export interface UserState {
    xp: number;
    level: number;
    activityHistory: ActivityUsage[];
    achievements: Achievement[];
    username: string | null;
    customActivities: CatalogItem[];
    etablissements: Etablissement[];
    pendingNotifications: AchievementNotification[];

    setUsername: (username: string) => void;
    addCustomActivity: (activity: CatalogItem) => void;
    updateCustomActivity: (activity: CatalogItem) => void;
    removeCustomActivity: (id: string) => void;
    addEtablissement: (etablissement: Etablissement) => void;
    updateEtablissement: (etablissement: Etablissement) => void;
    removeEtablissement: (id: string) => void;
    recordActivityUsage: (activityId: string, customDate?: number, etablissementId?: string) => void;
    addXp: (amount: number) => void;
    checkAchievements: () => void;
    dismissNotification: (id: string) => void;
    resetProgress: () => void;
    importState: (newState: any) => void;
}

// ─── Achievement Checker ─────────────────────────────────────────────
// Merge persisted achievements with the canonical definitions.
// This ensures new achievements are added, old ones keep their unlocked state,
// and removed achievements are cleaned up.
function mergeAchievements(persisted: Achievement[]): Achievement[] {
    return ALL_ACHIEVEMENTS.map((def) => {
        const saved = persisted.find((p) => p.id === def.id);
        if (saved && saved.unlocked) {
            return { ...def, unlocked: true, dateUnlocked: saved.dateUnlocked };
        }
        return { ...def };
    });
}

function evaluateAchievements(state: UserState): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const { activityHistory, etablissements, customActivities } = state;
    const levelInfo = getLevelFromXp(state.xp);

    const updatedAchievements = state.achievements.map((ach) => {
        if (ach.unlocked) return ach;

        // Guard: skip achievements without a valid condition (legacy data)
        if (!ach.condition || !ach.condition.type) return ach;

        let conditionMet = false;
        const { condition } = ach;

        switch (condition.type) {
            case 'usage_count':
                conditionMet = activityHistory.length >= condition.target;
                break;
            case 'unique_activities': {
                const uniqueIds = new Set(activityHistory.map((h) => h.activityId));
                conditionMet = uniqueIds.size >= condition.target;
                break;
            }
            case 'unique_etabs': {
                const uniqueEtabs = new Set(activityHistory.filter((h) => h.etablissementId).map((h) => h.etablissementId));
                conditionMet = uniqueEtabs.size >= condition.target;
                break;
            }
            case 'category_count': {
                const { CATALOG_DATA } = require('@/constants/data');
                const allActivities = [...CATALOG_DATA, ...customActivities];
                const categoryUsages = activityHistory.filter((h) => {
                    const activity = allActivities.find((a: CatalogItem) => a.id === h.activityId);
                    return activity && activity.category === condition.category;
                });
                conditionMet = categoryUsages.length >= condition.target;
                break;
            }
            case 'etab_count':
                conditionMet = etablissements.length >= condition.target;
                break;
            case 'custom_activities':
                conditionMet = customActivities.length >= condition.target;
                break;
            case 'level':
                conditionMet = levelInfo.level >= condition.target;
                break;
        }

        if (conditionMet) {
            const unlocked = { ...ach, unlocked: true, dateUnlocked: Date.now() };
            newlyUnlocked.push(unlocked);
            return unlocked;
        }
        return ach;
    });

    return newlyUnlocked.length > 0 ? updatedAchievements : state.achievements;
}

// ─── Store ───────────────────────────────────────────────────────────
export const useStore = create<UserState>()(
    persist(
        (set, get) => ({
            xp: 0,
            level: 1,
            username: null,
            customActivities: [],
            etablissements: [],
            activityHistory: [],
            achievements: ALL_ACHIEVEMENTS,
            pendingNotifications: [],

            setUsername: (username) => set({ username }),

            addCustomActivity: (activity) => {
                const state = get();
                set({ customActivities: [...state.customActivities, activity] });
                // Check achievements after adding
                setTimeout(() => get().checkAchievements(), 100);
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
                setTimeout(() => get().checkAchievements(), 100);
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
                const newXp = state.xp + XP_PER_USAGE;
                const newLevelInfo = getLevelFromXp(newXp);
                set({
                    activityHistory: [...state.activityHistory, newUsage],
                    xp: newXp,
                    level: newLevelInfo.level,
                });
                // Check achievements after recording
                setTimeout(() => get().checkAchievements(), 100);
            },

            addXp: (amount) => {
                const state = get();
                const newXp = state.xp + amount;
                const newLevelInfo = getLevelFromXp(newXp);
                set({ xp: newXp, level: newLevelInfo.level });
            },

            checkAchievements: () => {
                const state = get();
                const oldAchievements = state.achievements;
                const newAchievements = evaluateAchievements(state);

                if (newAchievements !== oldAchievements) {
                    // Find newly unlocked
                    const newlyUnlocked = newAchievements.filter(
                        (a) => a.unlocked && !oldAchievements.find((o) => o.id === a.id)?.unlocked
                    );

                    // Create notifications
                    const newNotifications: AchievementNotification[] = newlyUnlocked.map((a) => ({
                        id: `notif_${a.id}_${Date.now()}`,
                        achievement: a,
                        timestamp: Date.now(),
                    }));

                    // Award XP for achievements
                    let bonusXp = 0;
                    newlyUnlocked.forEach((a) => { bonusXp += a.xpReward; });

                    const totalXp = state.xp + bonusXp;
                    const levelInfo = getLevelFromXp(totalXp);

                    set({
                        achievements: newAchievements,
                        pendingNotifications: [...state.pendingNotifications, ...newNotifications],
                        xp: totalXp,
                        level: levelInfo.level,
                    });

                    // Re-check in case level-based achievements were unlocked by XP reward
                    if (bonusXp > 0) {
                        setTimeout(() => get().checkAchievements(), 200);
                    }
                }
            },

            dismissNotification: (id) => {
                const state = get();
                set({ pendingNotifications: state.pendingNotifications.filter((n) => n.id !== id) });
            },

            resetProgress: () => {
                set({
                    username: null,
                    xp: 0,
                    level: 1,
                    activityHistory: [],
                    achievements: ALL_ACHIEVEMENTS,
                    customActivities: [],
                    etablissements: [],
                    pendingNotifications: [],
                });
            },

            importState: (newState) => {
                set({
                    username: newState.username || null,
                    customActivities: newState.customActivities || [],
                    etablissements: newState.etablissements || [],
                    xp: newState.xp || 0,
                    level: newState.level || 1,
                    activityHistory: newState.activityHistory || [],
                    achievements: newState.achievements || ALL_ACHIEVEMENTS,
                    pendingNotifications: [],
                });
            },
        }),
        {
            name: 'mcl-user-storage',
            version: 2, // Bump this when achievement schema changes
            storage: createJSONStorage(() => fileStorage),
            partialize: (state) => ({
                ...state,
                pendingNotifications: [],
            }),
            migrate: (persistedState: any, version: number) => {
                if (version < 2) {
                    // Old achievements don't have conditions — merge with new definitions
                    persistedState.achievements = mergeAchievements(persistedState.achievements || []);
                }
                return persistedState;
            },
        }
    )
);
