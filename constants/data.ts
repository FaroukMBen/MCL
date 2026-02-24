export type AppCategory = 'Activités' | 'Coloriage' | 'Jeux';
export type AppType = 'Centre' | 'Periscolaire';

export interface AttachmentFile {
    uri: string;
    name: string;
    type: string; // mime type
}

export interface CatalogItem {
    id: string;
    title: string;
    description: string;
    image: string;
    images?: string[];
    duration?: string;
    location?: string;
    prerequis?: string;
    attachments?: AttachmentFile[];
    category: AppCategory;
    type: AppType;
    // If Centre
    ageGroup?: '3 ans' | '5 ans' | '6 ans' | '7/8 ans' | '9 ans+' | string;
    // If Periscolaire
    schoolLevel?: 'primaire' | 'maternelle';
    schoolClass?: 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2' | 'Petite section' | 'Moyenne section' | 'Grande section' | string;
}

export const CATALOG_DATA: CatalogItem[] = [
    // Centre Items
    {
        id: 'c1',
        title: 'Peinture de Galets',
        description: 'Une activité créative de peinture sur de petits galets.',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80',
        duration: '45 min',
        location: 'Salle d\'arts',
        category: 'Activités',
        type: 'Centre',
        ageGroup: '5 ans',
    },
    {
        id: 'c2',
        title: 'Chasse au Trésor',
        description: 'Grande chasse au trésor dans la cour et le jardin du centre.',
        image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80',
        duration: '60 min',
        location: 'Jardin extérieur',
        category: 'Jeux',
        type: 'Centre',
        ageGroup: '7/8 ans',
    },
    {
        id: 'c3',
        title: 'Coloriage Magique',
        description: 'Coloriage magique avec des chiffres pour révéler le dessin caché.',
        image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&q=80',
        duration: '30 min',
        location: 'Salle de repos',
        category: 'Coloriage',
        type: 'Centre',
        ageGroup: '3 ans',
    },
    // Periscolaire Items
    {
        id: 'p1',
        title: 'Légo Éducatif',
        description: 'Construction de structures avec des modèles liés au cours de géométrie.',
        image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=400&q=80',
        duration: '40 min',
        location: 'Classe de CP',
        category: 'Activités',
        type: 'Periscolaire',
        schoolLevel: 'primaire',
        schoolClass: 'CP',
    },
    {
        id: 'p2',
        title: 'Jeu de Rôle: Les Marchands',
        description: 'Apprendre à compter en jouant à la marchande.',
        image: 'https://images.unsplash.com/photo-1563207153-f404bf782c5f?w=400&q=80',
        duration: '50 min',
        location: 'Salle commune',
        category: 'Jeux',
        type: 'Periscolaire',
        schoolLevel: 'maternelle',
        schoolClass: 'Grande section',
    },
    {
        id: 'p3',
        title: 'Coloriage d\'Automne',
        description: 'Feuilles d\'automne et arbres à colorier avec des couleurs chaudes.',
        image: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=400&q=80',
        duration: '20 min',
        location: 'Classe Maternelle',
        category: 'Coloriage',
        type: 'Periscolaire',
        schoolLevel: 'maternelle',
        schoolClass: 'Moyenne section',
    }
];
