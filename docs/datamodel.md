# Modèle de Données Persistant

## Source du Modèle

Le modèle complet de données est défini dans `rugby_stats_datamodel.ts`.

---

## Types Énumérés

### Équipes et Période
```typescript
export type EquipeCode = 'NOUS' | 'ADV';
export type Periode = 1 | 2;
```

### Nature des Événements
```typescript
export type NatureEvenement = 'SCORE' | 'CONQUETE' | 'DISCIPLINE' | 'INDICATEUR';
```

### Types d'Événements (par nature)

**SCORE:**
```typescript
export type ScoreType = 'ESSAI' | 'TRANSFORMATION' | 'PENALITE' | 'DROP';
```

**CONQUETE:**
```typescript
export type ConqueteType = 'TOUCHE' | 'MELEE' | 'COUP_ENVOI' | 'RENVOI';
```

**DISCIPLINE:**
```typescript
export type DisciplineType = 'EN_AVANT' | 'PENALITE_COMMIS' | 'COUP_DE_PIED_FRANC';
```

**INDICATEUR:**
```typescript
export type IndicateurType = 'TOUCHE_TROUVEE' | 'TOUCHE_NON_TROUVEE' | 'ESSAI_SAUVE_SUR_MAUL';
```

### Résultats d'Événements
```typescript
export type ResultatEvenement =
  | 'REUSSITE' | 'ECHEC' | 'CONTRE' | 'MARQUE' | 'SUBIE'
  | 'NEUTRE' | 'GAGNEE' | 'PERDUE' | 'PENALISEE' 
  | 'RECUPERE' | 'NON_RECUPERE';
```

### Contexte du Match
```typescript
export type TerrainType = 'NATUREL' | 'SYNTHETIQUE' | 'HYBRIDE' | 'AUTRE';
export type ConditionsMeteo = 'SEC' | 'PLUIE' | 'VENT' | 'FROID' | 'CHAUD' | 'AUTRE';
```

### Types Union
```typescript
export type TypeEvenement = ScoreType | ConqueteType | DisciplineType | IndicateurType;
```

---

## Entités Principales

### Manager
```typescript
export interface Manager {
  id: string;           // Firebase UID (auth)
  prenom: string;
  nom: string;
  email: string;
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

**Stockage:**
- Firestore: `managers/{uid}`
- IndexedDB: table `managers`

---

### Equipe
```typescript
export interface Equipe {
  id: number;           // Dexie auto-increment
  nom: string;
  managerIds: string[]; // Firebase UIDs (ownership)
  saison: string;       // Format: "2024/2025"
  logo?: string;        // URL ou base64
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}
```

**Stockage:**
- Firestore: `teams/{teamId}`
- IndexedDB: table `equipes`

**Indexation Dexie:**
```
'++id, saison'
```

---

### Match
```typescript
export interface Match {
  id: number;                    // Dexie auto-increment
  equipeId: number;              // FK vers Equipe
  managerId: string;             // Firebase UID (qui a créé)
  date: string;                  // ISO 8601 date
  saison: string;                // FK vers Equipe.saison
  lieu?: string;
  terrain?: TerrainType;         // NATUREL | SYNTHETIQUE | HYBRIDE | AUTRE
  nomAdversaire: string;
  conditions?: ConditionsMeteo;  // SEC | PLUIE | VENT | etc.
  debut?: string;                // ISO 8601 date+heure
  fin?: string;                  // ISO 8601 date+heure
  score: {
    nous: number;                // Points calculés depuis événements
    adversaire: number;           // Points calculés depuis événements
  };
  status?: 'scheduled' | 'in_progress' | 'completed';  // Optionnel
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  syncedAt?: string;             // Quand synchronisé avec Firestore
}
```

**Stockage:**
- Firestore: `teams/{teamId}/matches/{matchId}`
- IndexedDB: table `matches`

**Indexation Dexie:**
```
'++id, equipeId, date'
```

---

### Evenement
```typescript
export interface Evenement {
  id: number;                    // Dexie auto-increment
  matchId: number;               // FK vers Match
  periode: Periode;              // 1 | 2
  instant: string;               // ISO 8601 date+heure exact
  minute?: number;               // Minute écoulée depuis début match
  seconde?: number;              // Seconde écoulée depuis début match
  
  equipe: EquipeCode;            // NOUS | ADV (qui a commis l'action)
  nature: NatureEvenement;       // SCORE | CONQUETE | DISCIPLINE | INDICATEUR
  type: TypeEvenement;           // Essai, Touche, En-avant, etc.
  sousType?: string;             // Optionnel, pour futures extensions
  resultat: ResultatEvenement;   // Marqué, Gagnée, Perdue, etc.
  
  commentaire?: string;
  createdAt?: string;            // ISO 8601 (création locale)
  syncedAt?: string;             // ISO 8601 (sync Firestore)
}
```

**Stockage:**
- Firestore: `teams/{teamId}/matches/{matchId}/evenements/{evenementId}`
- IndexedDB: table `evenements`

**Indexation Dexie:**
```
'++id, matchId, instant, createdAt'
```

---

### SyncOperation (Queue)
```typescript
export type OperationStatus = 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';

export interface SyncOperation {
  id: string;                    // UUID
  evenementId: number;           // FK vers Evenement
  matchId: number;               // Dénormalisation pour performance
  operation: 'create' | 'update' | 'delete';
  status: OperationStatus;
  data: Evenement;               // Snapshot de l'événement
  
  createdAt: string;             // ISO 8601 (quand ajouté à la queue)
  updatedAt: string;             // ISO 8601 (dernière tentative)
  error?: string;                // Message d'erreur si failed
  retryCount: number;            // 0-5
  lastRetry?: string;            // ISO 8601
}
```

**Stockage:**
- IndexedDB uniquement: table `operations_queue`
- Jamais dans Firestore (c'est une queue locale)

**Indexation Dexie:**
```
'++id, evenementId, matchId, status, createdAt'
```

---

### SyncMetadata
```typescript
export interface SyncMetadata {
  id: number;
  matchId: number;
  lastSync: string;              // ISO 8601 (dernière tentative)
  lastFullSync: string;          // ISO 8601 (dernier succès)
  lastSyncedEventId: number;     // Pour reprise
  pendingCount: number;          // Cache du nombre d'opérations pending
}
```

**Stockage:**
- IndexedDB uniquement: table `sync_metadata`

---

## Relations et Hiérarchie

```
Manager (Firebase Auth)
  └─ Equipe (1:N)
      └─ Match (1:N)
          └─ Evenement (1:N)
              └─ SyncOperation (1:N) [Queue]

Match
  └─ SyncMetadata (1:1)
```

---

## Règles de Validation Métier

### Validation des Résultats par Type

```typescript
// Résultats autorisés pour chaque type d'événement

const ValidResultsByType = {
  // SCORE
  'ESSAI': ['MARQUE', 'RATE'],
  'TRANSFORMATION': ['REUSSITE', 'ECHEC'],
  'PENALITE': ['MARQUE', 'RATE'],
  'DROP': ['MARQUE', 'RATE'],
  
  // CONQUETE
  'TOUCHE': ['GAGNEE', 'PERDUE', 'CONTRE', 'PENALISEE'],
  'MELEE': ['GAGNEE', 'PENALISEE', 'SUBIE', 'CONTRE'],
  'COUP_ENVOI': ['RECUPERE', 'NON_RECUPERE'],
  'RENVOI': ['RECUPERE', 'NON_RECUPERE'],
  
  // DISCIPLINE
  'EN_AVANT': ['PENALISEE'],
  'PENALITE_COMMIS': ['PENALISEE'],
  'COUP_DE_PIED_FRANC': ['PENALISEE'],
  
  // INDICATEUR
  'TOUCHE_TROUVEE': ['NEUTRE'],
  'TOUCHE_NON_TROUVEE': ['NEUTRE'],
  'ESSAI_SAUVE_SUR_MAUL': ['GAGNEE']
};
```

### Points de Score (Calcul automatique)

```typescript
const PointsParType = {
  'ESSAI': {
    'MARQUE': 5,
    'RATE': 0
  },
  'TRANSFORMATION': {
    'REUSSITE': 2,
    'ECHEC': 0
  },
  'PENALITE': {
    'MARQUE': 3,
    'RATE': 0
  },
  'DROP': {
    'MARQUE': 3,
    'RATE': 0
  }
};
```

### Calcul du Score du Match

```typescript
// Score = Sum des points SCORE events où type ∈ [ESSAI, TRANSFORMATION, PENALITE, DROP]

function calculateScore(events: Evenement[]): { nous: number, adversaire: number } {
  const scoreEvents = events.filter(e => e.nature === 'SCORE');
  const nous = scoreEvents
    .filter(e => e.equipe === 'NOUS' && PointsParType[e.type]?.[e.resultat])
    .reduce((sum, e) => sum + PointsParType[e.type][e.resultat], 0);
  
  const adversaire = scoreEvents
    .filter(e => e.equipe === 'ADV' && PointsParType[e.type]?.[e.resultat])
    .reduce((sum, e) => sum + PointsParType[e.type][e.resultat], 0);
  
  return { nous, adversaire };
}
```

---

## IndexedDB Schéma Complet

```typescript
export class RugbyStatsDatabase extends Dexie {
  managers!: Table<Manager>;
  equipes!: Table<Equipe>;
  matches!: Table<Match>;
  evenements!: Table<Evenement>;
  operations_queue!: Table<SyncOperation>;
  sync_metadata!: Table<SyncMetadata>;

  constructor() {
    super('RugbyStatsDB');
    this.version(1).stores({
      managers: '++id',
      equipes: '++id, saison',
      matches: '++id, equipeId, date',
      evenements: '++id, matchId, instant, createdAt',
      operations_queue: '++id, evenementId, matchId, status, createdAt',
      sync_metadata: '++id, matchId'
    });
  }
}
```

---

## Migrations Futures

### Version 2.0
- Ajouter photos des événements
- Positions des événements sur le terrain (x, y)
- Joueurs impliqués dans l'événement

### Version 3.0
- Statistiques agrégées par joueur
- Replay/annotations vidéo
- Export PDF du match

---

**Dernier update:** 10 juillet 2026
