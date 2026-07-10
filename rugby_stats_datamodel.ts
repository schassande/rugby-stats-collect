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
  TOUCHE: ['GAGNEE', 'PERDUE', 'CONTRE', 'PENALISEE'],
  MELEE: ['GAGNEE', 'PENALISEE', 'SUBIE', 'CONTRE'],
  COUP_ENVOI: ['RECUPERE', 'NON_RECUPERE'],
  RENVOI: ['RECUPERE', 'NON_RECUPERE']
} as const;

export type TerrainType = 'NATUREL' | 'SYNTHETIQUE' | 'HYBRIDE' | 'AUTRE';

export type ConditionsMeteo = 'SEC' | 'PLUIE' | 'VENT' | 'FROID' | 'CHAUD' | 'AUTRE';

export type NatureEvenement = 'SCORE' | 'CONQUETE' | 'DISCIPLINE' | 'INDICATEUR';



export type DisciplineType =
  | 'EN_AVANT'
  | 'PENALITE_COMMIS'
  | 'COUP_DE_PIED_FRANC';

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
    id: long:
    prenom: string;
    nom: string;
    email: string;
}

export interface Equipe {
    id: long:
    nom: string;
    managerIds: long[];
    saison: string;
}

export interface Match {
  createdAt: string;
  updatedAt: string;
  id: long;
  equipeId: long;
  managerId: long;
  date: string;                // ISO 8601
  saison: string;
  lieu?: string;
  terrain?: TerrainType;
  nomAdversaire: string;
  conditions?: ConditionsMeteo;
  debut?: string; // date et heure
  fin?: string; // date et heure
  score: {
    nous: number;
    adversaire: number;
  };
}

export interface Evenement {
  id: long;
  matchId: long;
  periode: Periode;
  instant: string; // date et heure
  minute?: number; // par rapport au debut du match
  seconde?: number; // par rapport au debut du match

  equipe: EquipeCode;           // l’équipe concernée par l’événement
  nature: NatureEvenement;
  type: TypeEvenement;
  sousType: DisciplineSousType;
  resultat: ResultatEvenement;
  commentaire?: string;
  createdAt?: string;
  syncedAt?: string;
}