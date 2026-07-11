export type Id = string;
export type EquipeCode = 'NOUS' | 'ADV';
export type Periode = 1 | 2;

export type NatureEvenement = 'SCORE' | 'CONQUETE' | 'DISCIPLINE' | 'INDICATEUR';

export type ResultatEvenement =
  | 'REUSSITE'
  | 'ECHEC'
  | 'CONTRE'
  | 'MARQUE'
  | 'SUBIE'
  | 'NEUTRE'
  | 'GAGNEE'
  | 'PERDUE'
  | 'PENALISEE'
  | 'RECUPERE'
  | 'NON_RECUPERE';

export type ScoreType = 'ESSAI' | 'TRANSFORMATION' | 'PENALITE' | 'DROP';

export type ConqueteType = 'TOUCHE' | 'MELEE' | 'COUP_ENVOI' | 'RENVOI';

export const ConqueteResultats = {
  TOUCHE: ['GAGNEE', 'PERDUE', 'CONTRE', 'PENALISEE'] as const,
  MELEE: ['GAGNEE', 'PENALISEE', 'SUBIE', 'CONTRE'] as const,
  COUP_ENVOI: ['RECUPERE', 'NON_RECUPERE'] as const,
  RENVOI: ['RECUPERE', 'NON_RECUPERE'] as const
};

export type TerrainType = 'NATUREL' | 'SYNTHETIQUE' | 'HYBRIDE' | 'AUTRE';
export type ConditionsMeteo = 'SEC' | 'PLUIE' | 'VENT' | 'FROID' | 'CHAUD' | 'AUTRE';

export type DisciplineType = 'EN_AVANT' | 'PENALITE_COMMIS' | 'COUP_DE_PIED_FRANC';

export type DisciplineSousType =
  | 'HORS_JEU'
  | 'PLAQUAGE_HAUT'
  | 'BALLON_GARDE_AU_SOL'
  | 'ENTREE_LATERALE_RUCK'
  | 'AUTRE'
  | 'MELEE'
  | 'TOUCHE'
  | 'AUTRE_DESTINATION';

export type IndicateurType =
  | 'TOUCHE_TROUVEE'
  | 'TOUCHE_NON_TROUVEE'
  | 'ESSAI_SAUVE_SUR_MAUL';

export type TypeEvenement = ScoreType | ConqueteType | DisciplineType | IndicateurType;

export interface Manager {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipe {
  id: number;
  nom: string;
  managerIds: string[];
  saison: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: number;
  equipeId: number;
  managerId: string;
  date: string;
  saison: string;
  lieu?: string;
  terrain?: TerrainType;
  nomAdversaire: string;
  conditions?: ConditionsMeteo;
  debut?: string;
  fin?: string;
  score: {
    nous: number;
    adversaire: number;
  };
  status?: 'scheduled' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface Evenement {
  id: number;
  matchId: number;
  periode: Periode;
  instant: string;
  minute?: number;
  seconde?: number;
  equipe: EquipeCode;
  nature: NatureEvenement;
  type: TypeEvenement;
  sousType?: DisciplineSousType | string;
  resultat: ResultatEvenement;
  commentaire?: string;
  createdAt?: string;
  syncedAt?: string;
}

export type OperationStatus = 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';

export interface SyncOperation {
  id: string;
  evenementId: number;
  matchId: number;
  operation: 'create' | 'update' | 'delete';
  status: OperationStatus;
  data: Evenement;
  createdAt: string;
  updatedAt: string;
  error?: string;
  retryCount: number;
  lastRetry?: string;
}
