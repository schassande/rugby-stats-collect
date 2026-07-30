export type Id = string;
export type EquipeCode = 'NOUS' | 'ADV';
export type Periode = 1 | 2;

export type NatureEvenement = 'SCORE' | 'CONQUETE' | 'DISCIPLINE' | 'INDICATEUR';

export type TerrainType = 'NATUREL' | 'SYNTHETIQUE' | 'HYBRIDE' | 'AUTRE';
export type ConditionsMeteo = 'SEC' | 'PLUIE' | 'VENT' | 'FROID' | 'CHAUD' | 'AUTRE';

export type Saison = 
    '2026/2027' |
    '2027/2028' |
    '2028/2029' |
    '2029/2030' |
    '2030/2031' |
    '2031/2032' ;
export const Saisons: Saison[] = [ 
    '2026/2027' ,
    '2027/2028' ,
    '2028/2029' ,
    '2029/2030' ,
    '2030/2031' ,
    '2031/2032' ];

export interface Manager {
  id: string; // email
  prenom: string;
  nom: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipe {
  id: number;
  nom: string;
  managerIds: string[];
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: number;
  equipeId: number;
  managerId: string;
  date: string;
  saison: Saison;
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
  fautesPenalite?: FautesPenalite;
  fautesCoupFranc?: FautesCoupFranc;
  commentaire?: string;
  createdAt: string;
  syncedAt?: string;
  numeroJoueur1?: number;
  numeroJoueur2?: number;
  zoneLancee?: ZoneLancee;
  zoneTerrain?: ZoneTerrain;
  positionLargeur?: PositionLargeur;
  choixDeJeuPenalite?: ChoixDeJeuPenalite;
  choixDeJeuCoupFranc?: ChoixDeJeuCoupFranc;
  distanceJeuPied?: number;
  resultatMelee?: ResultatMelee;
  resultatTouche?: ResultatTouche;
  recuperation?: Recuperation;
}

export type TypeEvenement = ScoreType 
  | ConqueteType 
  | DisciplineType 
  | IndicateurType 
  | ErreurType 
  | BlessureType 
  | Remplacement;
export type ScoreType = 'ESSAI' | 'DROP';
export type ConqueteType = 'TOUCHE' | 'MELEE' | 'COUP_ENVOI' | 'RENVOI';
export type ErreurType = 'EN_AVANT' | 'COUP_EN_TOUCHE_DIRECT';
export type DisciplineType = 'PENALITE' | 'COUP_DE_PIED_FRANC';
export type ComplementDiscipline = 'CARTON_JAUNE' | 'CARTON_ORANGE' | 'CARTON_ROUGE';
export type BlessureType = 'PROTCOL_COMMOSSION' | 'SAIGNEMENT';
export type Remplacement = 'REMPLACEMENT';
export type FautesPenalite = 
   | 'HORS_JEU'
   | 'PLAQUAGE_HAUT'
   | 'PLAQUAGE_DANGEREUX'
   | 'PLAQUAGE_SANS_BALLON'
   | 'JOUEUR_PLAQUE_NE_LIBERE_PAS'
   | 'PLAQUEUR_NE_RELACHE_PAS'
   | 'PLAQUEUR_NE_SORT_PAS'
   | 'ENTREE_SUR_LE_COTE'
   | 'RUCK_RETENU_AU_SOL'
   | 'RUCK_GRATTAGE_ILLEGAL'
   | 'RUCK_JEU_A_LA_MAIN'
   | 'RUCK_ENTREE_SUR_LE_COTE'
   | 'RUCK_DEBLAYAGE_DANGEREUX'
   | 'MAUL_EFFONDREMENT'
   | 'MAUL_ENTREE_SUR_LE_COTE'
   | 'MAUL_OBSTRUCTION'
   | 'MAUL_JEU_ILLEGAL_DU_BALLON'
   | 'MELEE_EFFONDREMENT'
   | 'MELEE_POUSSEE_ANTICIPEE'
   | 'MELEE_TOURNEE_VOLONTAIREMENT'
   | 'MELEE_RELEVER_ADVERSAIRE'
   | 'MELEE_INTRODUCTION_INCORRECTE'
   | 'MELEE_PILIER_EN_TRAVERS'
   | 'MELEE_PIED_ILLEGAL'
   | 'MELEE_OBSTRUCTION_DEMI'
   | 'TOUCHE_OBSTRUCTION'
   | 'TOUCHE_LEVEE_ILLICITE'
   | 'TOUCHE_JOUEUR_JOUE_AVANT_RECEPTION'
   | 'TOUCHE_REDUCTION_ILLEGALE_ESPACE'
   | 'OBSTRUCTION'
   | 'CHARGE_SANS_BALLON'
   | 'PLAQUAGE_CATHEDRALE'
   | 'JEU_BRUTAL'
   | 'CONTESTATION_ARBITRE'
   | 'COMPORTEMENT_ANTISPORTIF'
   | 'FAUTES_REPETEES'
   | 'ANTI_JEU'
   | 'RETARD_DE_JEU'
   | 'FAUTE_VOLONTAIRE_ANTI_ESSAI'
   | 'EN_AVANT_VOLONTAIRE'
   | 'EN_AVANT_REPRIS_DEVANT'
;

export type FautesCoupFranc =
  | 'RETARD_FORMATION_MELEE'
  | 'ENGAGEMENT_INCORRECT'
  | 'POUSSEE_SUPERIEURE_A_1M50'
  | 'PIED_HORS_POSITION_MELEE'
  | 'RETARD_FORMATION_TOUCHE'
  | 'ECART_NON_RESPECTE_EN_TOUCHE'
  | 'COUP_DENVOI_INCORRECT'
  | 'RENVOI_INCORRECT'
  | 'JOUER_AVANT_LE_COUP_DE_PIED_DE_MARQUE'
  | 'RETARD_EXCESSIF_REPRISE_JEU'
  | 'NON_RESPECT_DISTANCE_10M'
;

export type ResultatMelee = 'GAGNEE' | 'PENALISEE' | 'SUBIE' | 'CONTRE';
export type ResultatTouche = 'GAGNEE' | 'PERDUE' | 'CONTRE' | 'PENALISEE' | 'COUP_FRANC';
export type Recuperation = 'GAGNE' | 'PERDU';
export type ZoneLancee = 1 | 2 | 3;
export type ZoneTerrain =  'NOS_22' | 'NOS_22_50' | 'LEUR_50_22' | 'LEUR_22';
export type PositionLargeur = '5mGauche' | '5_15mGauche' | 'Gauche' | 'Centre' | 'Droite' | '5_15mDroite' | '5mDroite';
export type ChoixDeJeuPenalite = 'MAIN' | 'POTEAU' | 'TOUCHE' | 'MELEE';
export type ChoixDeJeuCoupFranc = 'MAIN' | 'TOUCHE' | 'MELEE';

export type IndicateurType = 'TOUCHE_TROUVEE' | 'TOUCHE_NON_TROUVEE' | 'ESSAI_SAUVE_SUR_MAUL';

// =============================================================
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
