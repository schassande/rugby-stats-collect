export type Id = string;
export type EquipeCode = 'NOUS' | 'ADV';
export type Periode = 1 | 2;

export type TerrainType = 'NATUREL' | 'SYNTHETIQUE' | 'HYBRIDE' | 'AUTRE';
export type ConditionMeteo = 'NORMAL' | 'SEC' | 'PLUIE' | 'VENT' | 'FROID' | 'CHAUD' | 'AUTRE';

export const TerrainTypes: TerrainType[] = ['NATUREL', 'SYNTHETIQUE', 'HYBRIDE', 'AUTRE'];

export const ConditionsMeteo: ConditionMeteo[] = [
  'NORMAL',
  'SEC',
  'PLUIE',
  'VENT',
  'FROID',
  'CHAUD',
  'AUTRE',
];

export type Saison =
  '2026/2027' | '2027/2028' | '2028/2029' | '2029/2030' | '2030/2031' | '2031/2032';
export const Saisons: Saison[] = [
  '2026/2027',
  '2027/2028',
  '2028/2029',
  '2029/2030',
  '2030/2031',
  '2031/2032',
];

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
  conditions?: ConditionMeteo[];
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
  equipe?: EquipeCode;
  nature: NatureEvenement;
  type: TypeEvenement;
  rapporteurId: string;
  complementDiscipline?: ComplementDiscipline;
  fautesPenalite?: FautesPenalite;
  fautesBrasCasse?: FautesBrasCasse;
  commentaire?: string;
  createdAt: string;
  syncedAt?: string;
  numeroJoueur1?: number;
  numeroJoueur2?: number;
  zoneLancee?: ZoneLancee;
  zoneTerrain?: ZoneTerrain;
  positionLargeur?: PositionLargeur;
  choixDeJeuPenalite?: ChoixDeJeuPenalite;
  choixDeJeuBrasCasse?: ChoixDeJeuBrasCasse;
  distanceJeuPied?: number;
  resultatMelee?: ResultatMelee;
  resultatMaul?: ResultatMaul;
  resultatTouche?: ResultatTouche;
  resultRuck?: ResultatRuck;
  recuperation?: Recuperation;
  resultat?: Resultat;
}

export type NatureEvenement = 'TEMPS' |'SCORE' | 'CONQUETE' | 'DISCIPLINE' | 'FAIT_DE_JEU' | 'ERREUR' | 'REMPLACEMENT';

export type TypeEvenement =
  TempsType
  | ScoreType
  | ConqueteType
  | DisciplineType
  | ErreurType
  | FaitDeJeuType
  | Remplacement;
export type TempsType = 'DEBUT_MATCH' | 'FIN_1ERE_MITEMPS' | 'DEBUT_2ND_MITEMPS' | 'FIN_2ND_MITEMPS' | 'PROLONGATION' | 'FIN_MATCH';
export type ScoreType = 'ESSAI' | 'DROP' | 'TRANSFORMATION';
export type ConqueteType = 'TOUCHE' | 'MELEE' | 'MAUL' | 'CHANDELLE' | 'RENVOI' ;
export type DisciplineType = 'PENALITE' | 'BRAS_CASSE';
export type ErreurType = 'EN_AVANT' | 'COUP_EN_TOUCHE_DIRECT' | 'SORTIE_TOUCHE';
export type Remplacement = 'NORMAL' | 'PROTCOLE_COMMOTION' | 'SAIGNEMENT' | 'REOUR_PROTCOLE_COMMOTION' | 'RETOUR_SAIGNEMENT' | 'BLESSURE';

export type ComplementDiscipline = 'AUCUN' |'CARTON_BLANC' | 'CARTON_JAUNE' | 'CARTON_ORANGE' | 'CARTON_ROUGE';
export type FautesPenalite =
  | 'HORS_JEU'
  | 'PLAQUAGE_HAUT'
  | 'PLAQUAGE_DANGEREUX'
  | 'PLAQUAGE_SANS_BALLON'
  | 'PLAQUAGE_CATHEDRALE'
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
  | 'JEU_BRUTAL'
  | 'CONTESTATION_ARBITRE'
  | 'COMPORTEMENT_ANTISPORTIF'
  | 'FAUTES_REPETEES'
  | 'ANTI_JEU'
  | 'RETARD_DE_JEU'
  | 'FAUTE_VOLONTAIRE_ANTI_ESSAI'
  | 'EN_AVANT_VOLONTAIRE'
  | 'EN_AVANT_REPRIS_DEVANT';

export type FautesBrasCasse =
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
  | 'NON_RESPECT_DISTANCE_10M';

export type ResultatMelee = 'GAGNEE' | 'PENALISEE' | 'GAIN_PENALITE' | 'SUBIE' | 'CONTRE';
export type ResultatMaul = 'AVANCEE_FAIBLE' | 'AVANCEE_FORTE' | 'PENALISEE' | 'GAIN_PENALITE' | 'ESSAI';
export type ResultatRuck = 'GAGNE' | 'CONSERVE' | 'PERDU';
export type ResultatTouche = 'GAGNEE' | 'PERDUE' | 'CONTRE' | 'PENALISEE' | 'BRAS_CASSE';
export type Recuperation = 'GAGNE' | 'PERDU';
export type Resultat = 'REUSSITE' | 'ECHEC';
export type ZoneLancee = 1 | 2 | 3;
export type ZoneTerrain = 'NOS_22' | 'NOS_22_50' | 'LEUR_50_22' | 'LEUR_22';
export type PositionLargeur =
  '5mGauche' | '5_15mGauche' | 'Gauche' | 'Centre' | 'Droite' | '5_15mDroite' | '5mDroite';
export type ChoixDeJeuPenalite = 'MAIN' | 'POTEAU' | 'TOUCHE' | 'MELEE';
export type ChoixDeJeuBrasCasse = 'MAIN' | 'TOUCHE' | 'MELEE';

export type FaitDeJeuType = 'DEGAGEMENT_TOUCHE' | 'ESSAI_SAUVE_SUR_MAUL' | '50_22' | 'RUCK' | 'INTERCEPTION' | 'ARRET_VOLEE';


export class ConfigTypeEvenement {
  
  fautesPenalite: boolean = false;
  choixDeJeuPenalite: boolean = false;
  complementDiscipline: boolean = false;
  fautesBrasCasse: boolean = false;
  choixDeJeuBrasCasse: boolean = false;
  numeroJoueur1: boolean = false;
  numeroJoueur2: boolean = false;
  zoneLancee: boolean = false;
  zoneTerrain: boolean = false;
  positionLargeur: boolean = false;
  distanceJeuPied: boolean = false;
  resultatMelee: boolean = false;
  resultatMaul: boolean = false;
  resultatRuck: boolean = false;
  resultatTouche: boolean = false;
  recuperation: boolean = false;
  resultat: boolean = false;
  noIcon = false;
  equipe = false;
  periode = false;
  constructor(
    public nature: NatureEvenement,
    public type: TypeEvenement,
    public label: string
  ) {
  }
  _complementDiscipline(): ConfigTypeEvenement {this.complementDiscipline = true; return this}
  _fautesPenalite(): ConfigTypeEvenement {this.fautesPenalite = true; return this}
  _choixDeJeuPenalite(): ConfigTypeEvenement {this.choixDeJeuPenalite = true; return this}
  _fautesBrasCasse(): ConfigTypeEvenement {this.fautesBrasCasse = true; return this}
  _choixDeJeuBrasCasse(): ConfigTypeEvenement {this.choixDeJeuBrasCasse = true; return this}
  _numeroJoueur1(): ConfigTypeEvenement {this.numeroJoueur1 = true; return this}
  _numeroJoueur2(): ConfigTypeEvenement {this.numeroJoueur2 = true; return this}
  _zoneLancee(): ConfigTypeEvenement {this.zoneLancee = true; return this}
  _zoneTerrain(): ConfigTypeEvenement {this.zoneTerrain = true; return this}
  _positionLargeur(): ConfigTypeEvenement {this.positionLargeur = true; return this}
  _distanceJeuPied(): ConfigTypeEvenement {this.distanceJeuPied = true; return this}
  _resultatMelee(): ConfigTypeEvenement {this.resultatMelee = true; return this}
  _resultatMaul(): ConfigTypeEvenement {this.resultatMaul = true; return this}
  _resultatRuck(): ConfigTypeEvenement {this.resultatRuck = true; return this}
  _resultatTouche(): ConfigTypeEvenement {this.resultatTouche = true; return this}
  _recuperation(): ConfigTypeEvenement {this.recuperation = true; return this}
  _resultat(): ConfigTypeEvenement {this.resultat = true; return this}
  _noIcon(): ConfigTypeEvenement {this.noIcon = true; return this}
  _equipe(): ConfigTypeEvenement {this.equipe = true; return this}
  _periode(): ConfigTypeEvenement {this.periode = true; return this}
}


export const configsTypeEvenemnt : ConfigTypeEvenement[] = [

  new ConfigTypeEvenement('TEMPS', 'DEBUT_MATCH', 'Début du match', ),
  new ConfigTypeEvenement('TEMPS', 'FIN_1ERE_MITEMPS', 'Fin 1ère période', ),
  new ConfigTypeEvenement('TEMPS', 'DEBUT_2ND_MITEMPS', 'Début 2nd période', ),
  new ConfigTypeEvenement('TEMPS', 'FIN_MATCH', 'Fin du match', ),
  new ConfigTypeEvenement('TEMPS', 'PROLONGATION', 'Prolongation', ),

  new ConfigTypeEvenement('SCORE', 'ESSAI', 'Essai', )._numeroJoueur1()._positionLargeur()._equipe()._periode(),
  new ConfigTypeEvenement('SCORE', 'TRANSFORMATION', 'Transfo')._numeroJoueur1()._positionLargeur()._periode()
    ._distanceJeuPied()._resultat()._equipe()._periode(),
  new ConfigTypeEvenement('SCORE', 'DROP', 'Drop')._numeroJoueur1()._positionLargeur()._distanceJeuPied()._equipe()
    ._zoneTerrain()._resultat()._periode(),

  new ConfigTypeEvenement('CONQUETE', 'TOUCHE', 'Touche')._zoneTerrain()._zoneLancee()._resultatTouche()._equipe()._periode(),
  new ConfigTypeEvenement('CONQUETE', 'MELEE', 'Mêlée')._zoneTerrain()._positionLargeur()._resultatMelee()._equipe()._periode(),
  new ConfigTypeEvenement('CONQUETE', 'MAUL', 'Maul')._zoneTerrain()._positionLargeur()._resultatMaul()._equipe()._periode(),
  new ConfigTypeEvenement('CONQUETE', 'CHANDELLE', 'Chandelle')._zoneTerrain()._positionLargeur()._recuperation()._equipe()._periode(),
  new ConfigTypeEvenement('CONQUETE', 'RENVOI', 'Renvoi')._zoneTerrain()._positionLargeur()._recuperation()._equipe()._periode(),

  new ConfigTypeEvenement('ERREUR', 'EN_AVANT', 'En avant')._zoneTerrain()._positionLargeur()._numeroJoueur1()._equipe()._periode()._noIcon(),
  new ConfigTypeEvenement('ERREUR', 'COUP_EN_TOUCHE_DIRECT', 'Touche direct')._zoneTerrain()._positionLargeur()._equipe()
    ._numeroJoueur1()._periode()._noIcon(),
  new ConfigTypeEvenement('ERREUR', 'SORTIE_TOUCHE', 'Sortie')._zoneTerrain()._numeroJoueur1()._equipe()._periode()._noIcon(),

  new ConfigTypeEvenement('FAIT_DE_JEU', 'RUCK', 'Ruck')._resultatRuck()._zoneTerrain()._numeroJoueur1()._noIcon()._equipe()._periode(),
  new ConfigTypeEvenement('FAIT_DE_JEU', 'DEGAGEMENT_TOUCHE', 'Dégagement Touche')._zoneTerrain()
    ._distanceJeuPied()._numeroJoueur1()._resultat()._noIcon()._equipe()._periode(),
  new ConfigTypeEvenement('FAIT_DE_JEU', 'ARRET_VOLEE', 'Arrêt de volée')._positionLargeur()._numeroJoueur1()._noIcon()._equipe()._periode(),
  new ConfigTypeEvenement('FAIT_DE_JEU', 'INTERCEPTION', 'Interception')._zoneTerrain()._numeroJoueur1()._noIcon()._equipe()._periode(),
  new ConfigTypeEvenement('FAIT_DE_JEU', '50_22', '50-22')._numeroJoueur1()._noIcon()._equipe()._periode(),
  new ConfigTypeEvenement('FAIT_DE_JEU', 'ESSAI_SAUVE_SUR_MAUL', 'Essai sauvé sur maul')._numeroJoueur1()._noIcon()._equipe()._periode(),

  new ConfigTypeEvenement('DISCIPLINE', 'PENALITE', 'Pénalité')._fautesPenalite()._complementDiscipline()
    ._choixDeJeuPenalite()._zoneTerrain()._positionLargeur()._numeroJoueur1()._resultat()._equipe()._periode(),
  new ConfigTypeEvenement('DISCIPLINE', 'BRAS_CASSE', 'Bras cassé')._fautesBrasCasse()._choixDeJeuBrasCasse()._zoneTerrain()
    ._positionLargeur()._numeroJoueur1()._equipe()._periode(),

  new ConfigTypeEvenement('REMPLACEMENT', 'NORMAL', 'Normal')._numeroJoueur1()._numeroJoueur2()._equipe()._periode(),
  new ConfigTypeEvenement('REMPLACEMENT', 'BLESSURE', 'Sur blessure')._numeroJoueur1()._numeroJoueur2()._equipe()._periode(),
  new ConfigTypeEvenement('REMPLACEMENT', 'SAIGNEMENT', 'Sang')._numeroJoueur1()._numeroJoueur2()._equipe()._periode(),
  new ConfigTypeEvenement('REMPLACEMENT', 'RETOUR_SAIGNEMENT', 'Retour sang')._numeroJoueur1()._numeroJoueur2()._equipe()._periode(),
  new ConfigTypeEvenement('REMPLACEMENT', 'PROTCOLE_COMMOTION', 'Protocole Commo')._numeroJoueur1()._numeroJoueur2()._equipe()._periode(),
  new ConfigTypeEvenement('REMPLACEMENT', 'REOUR_PROTCOLE_COMMOTION', 'Retour Commo')._numeroJoueur1()._numeroJoueur2()._equipe()._periode(),
];

export const DEFAUT_TYPE_EVENEMENT : { nature: NatureEvenement, type: TypeEvenement }[]= [
  {nature: 'TEMPS', type: 'DEBUT_MATCH'},
  {nature: 'SCORE', type: 'ESSAI'},
  {nature: 'CONQUETE', type: 'TOUCHE'},
  {nature: 'FAIT_DE_JEU', type: 'RUCK'},
  {nature: 'ERREUR', type: 'EN_AVANT'},
  {nature: 'DISCIPLINE', type: 'PENALITE'},
  {nature: 'REMPLACEMENT', type: 'NORMAL'}
];
// =============================================================
export type SyncObjectType = 'Equipe' | 'Match' | 'Evenement'
export type SyncActionType = 'create' | 'update' | 'delete'
export type SyncActionStatus = 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';
export interface SyncAction {
  id: number;
  objectType: SyncObjectType;
  objectId: number;
  actionType: SyncActionType;
  status: SyncActionStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
  retryCount?: number;
  lastRetry?: string;
}
