// ─── Changelog ───────────────────────────────────────────────────────
// Ajoutez vos entrées ici avant chaque publication de mise à jour.
// L'ordre est du plus récent au plus ancien.

export const APP_VERSION = '1.0.0';

export interface ChangelogEntry {
    version: string;
    date: string; // Format: 'YYYY-MM-DD'
    title: string;
    changes: string[];
    type: 'major' | 'minor' | 'patch';
}

export const CHANGELOG: ChangelogEntry[] = [
    {
        version: '1.0.0',
        date: '2025-02-25',
        title: 'Lancement initial',
        type: 'major',
        changes: [
            'Catalogue d\'activités avec vue carte et liste',
            'Enregistrement d\'utilisation avec date et établissement',
            'Système d\'XP et de niveaux',
            'Succès et badges à débloquer',
            'Gestion des établissements',
            'Création d\'activités personnalisées',
            'Statistiques détaillées',
            'Export et import de progression',
            'Profil personnalisable avec photo',
        ],
    },
];
