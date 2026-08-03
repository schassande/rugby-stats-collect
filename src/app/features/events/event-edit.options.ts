import { ChoixDeJeuBrasCasse, 
  ChoixDeJeuPenalite, 
  ComplementDiscipline, 
  FautesBrasCasse, 
  FautesPenalite, 
  NatureEvenement, 
  PositionLargeur, 
  Resultat, 
  ResultatMelee, 
  ResultatMaul, 
  ResultatRuck, 
  ResultatTouche, 
  Recuperation, 
  ZoneTerrain } from '@core/models/datamodel';

export interface Option<T> {
  label: string;
  value: T; 
  icon?: string;
}
export const ZONE_TERRAIN_OPTIONS: Option<ZoneTerrain>[] = [
  { value: 'NOS_22', label: 'Rouge' },
  { value: 'NOS_22_50', label: 'Orange' },
  { value: 'LEUR_50_22', label: 'Bleu' },
  { value: 'LEUR_22', label: 'Vert' },
] as Option<ZoneTerrain>[];

export const POSITION_LARGEUR_OPTIONS: Option<PositionLargeur>[] = [
  { value: '5mGauche', label: '5m à gauche' },
  { value: '5_15mGauche', label: '5m/15m à gauche' },
  { value: 'Gauche', label: 'Gauche' },
  { value: 'Centre', label: 'Centre' },
  { value: 'Droite', label: 'Droite' },
  { value: '5_15mDroite', label: '5m/15m à droite' },
  { value: '5mDroite', label: '5m à droite' },
] as Option<PositionLargeur>[];

export const COMPLEMENT_DISCIPLINE_OPTIONS: Option<ComplementDiscipline>[] = [
  { value: 'AUCUN',         label: 'Aucun' },
  { value: 'CARTON_BLANC',  label: 'Carton blanc',  icon: '/icons/event/CARTON_BLANC.png' },
  { value: 'CARTON_JAUNE',  label: 'Carton jaune',  icon: '/icons/event/CARTON_JAUNE.png' },
  { value: 'CARTON_ORANGE', label: 'Carton orange', icon: '/icons/event/CARTON_ORANGE.png'},
  { value: 'CARTON_ROUGE',  label: 'Carton rouge',  icon: '/icons/event/CARTON_ROUGE.png' },
] as Option<ComplementDiscipline>[];

export const FAUTES_PENALITE_OPTIONS: Option<FautesPenalite>[] = [
  ['HORS_JEU', 'Hors-jeu'],
  ['PLAQUAGE_HAUT', 'Plaquage haut'],
  ['PLAQUAGE_DANGEREUX', 'Plaquage dangereux'],
  ['PLAQUAGE_SANS_BALLON', 'Plaquage sans ballon'],
  ['JOUEUR_PLAQUE_NE_LIBERE_PAS', 'Joueur plaqué ne libère pas'],
  ['PLAQUEUR_NE_RELACHE_PAS', 'Plaqueur ne relâche pas'],
  ['PLAQUEUR_NE_SORT_PAS', 'Plaqueur ne sort pas'],
  ['ENTREE_SUR_LE_COTE', 'Entrée sur le côté'],
  ['RUCK_RETENU_AU_SOL', 'Ruck retenu au sol'],
  ['RUCK_GRATTAGE_ILLEGAL', 'Ruck : grattage illégal'],
  ['RUCK_JEU_A_LA_MAIN', 'Ruck : jeu à la main'],
  ['RUCK_ENTREE_SUR_LE_COTE', 'Ruck : entrée sur le côté'],
  ['RUCK_DEBLAYAGE_DANGEREUX', 'Ruck : déblayage dangereux'],
  ['MAUL_EFFONDREMENT', 'Maul : effondrement'],
  ['MAUL_ENTREE_SUR_LE_COTE', 'Maul : entrée sur le côté'],
  ['MAUL_OBSTRUCTION', 'Maul : obstruction'],
  ['MAUL_JEU_ILLEGAL_DU_BALLON', 'Maul : jeu illégal du ballon'],
  ['MELEE_EFFONDREMENT', 'Mêlée : effondrement'],
  ['MELEE_POUSSEE_ANTICIPEE', 'Mêlée : poussée anticipée'],
  ['MELEE_TOURNEE_VOLONTAIREMENT', 'Mêlée : tournée volontairement'],
  ['MELEE_RELEVER_ADVERSAIRE', 'Mêlée : relever adversaire'],
  ['MELEE_INTRODUCTION_INCORRECTE', 'Mêlée : introduction incorrecte'],
  ['MELEE_PILIER_EN_TRAVERS', 'Mêlée : pilier en travers'],
  ['MELEE_PIED_ILLEGAL', 'Mêlée : pied illégal'],
  ['MELEE_OBSTRUCTION_DEMI', 'Mêlée : obstruction du demi'],
  ['TOUCHE_OBSTRUCTION', 'Touche : obstruction'],
  ['TOUCHE_LEVEE_ILLICITE', 'Touche : levée illicite'],
  ['TOUCHE_JOUEUR_JOUE_AVANT_RECEPTION', 'Touche : joueur joue avant réception'],
  ['TOUCHE_REDUCTION_ILLEGALE_ESPACE', 'Touche : réduction illégale de l espace'],
  ['OBSTRUCTION', 'Obstruction'],
  ['CHARGE_SANS_BALLON', 'Charge sans ballon'],
  ['PLAQUAGE_CATHEDRALE', 'Plaquage cathédrale'],
  ['JEU_BRUTAL', 'Jeu brutal'],
  ['CONTESTATION_ARBITRE', 'Contestation de l arbitre'],
  ['COMPORTEMENT_ANTISPORTIF', 'Comportement antisportif'],
  ['FAUTES_REPETEES', 'Fautes répétées'],
  ['ANTI_JEU', 'Anti-jeu'],
  ['RETARD_DE_JEU', 'Retard de jeu'],
  ['FAUTE_VOLONTAIRE_ANTI_ESSAI', 'Faute volontaire anti-essai'],
  ['EN_AVANT_VOLONTAIRE', 'En-avant volontaire'],
  ['EN_AVANT_REPRIS_DEVANT', 'En-avant repris devant'],
].map(([value, label]) => ({ value, label })) as Option<FautesPenalite>[];

export const FAUTES_BRAS_CASSE_OPTIONS: Option<FautesBrasCasse>[] = [
  ['RETARD_FORMATION_MELEE', 'Retard formation mêlée'],
  ['ENGAGEMENT_INCORRECT', 'Engagement incorrect'],
  ['POUSSEE_SUPERIEURE_A_1M50', 'Poussée supérieure à 1,50 m'],
  ['PIED_HORS_POSITION_MELEE', 'Pied hors position en mêlée'],
  ['RETARD_FORMATION_TOUCHE', 'Retard formation touche'],
  ['ECART_NON_RESPECTE_EN_TOUCHE', 'Écart non respecté en touche'],
  ['COUP_DENVOI_INCORRECT', "Coup d'envoi incorrect"],
  ['RENVOI_INCORRECT', 'Renvoi incorrect'],
  ['JOUER_AVANT_LE_COUP_DE_PIED_DE_MARQUE', 'Jouer avant le coup de pied de marque'],
  ['RETARD_EXCESSIF_REPRISE_JEU', 'Retard excessif à la reprise du jeu'],
  ['NON_RESPECT_DISTANCE_10M', 'Non-respect de la distance de 10m'],
].map(([value, label]) => ({ value, label })) as Option<FautesBrasCasse>[];

export const CHOIX_DE_JEU_PENALITE_OPTIONS: Option<ChoixDeJeuPenalite>[] = [
  { value: 'POTEAU', label: 'Poteau', icon:'/icons/event/POTEAU.png'},
  { value: 'TOUCHE', label: 'Touche', icon:'/icons/event/TOUCHE.png' },
  { value: 'MAIN', label: 'Main',     icon:'/icons/event/MAIN.png'},
  { value: 'MELEE', label: 'Mêlée',   icon:'/icons/event/MELEE.png' },
];

export const CHOIX_DE_JEU_BRAS_CASSE_OPTIONS: Option<ChoixDeJeuBrasCasse>[] = [
  { value: 'MAIN', label: 'Main', icon: '/icons/event/MAIN.png' },
  { value: 'MELEE', label: 'Mêlée', icon: '/icons/event/MELEE.png' },
  { value: 'TOUCHE', label: 'Touche', icon: '/icons/event/TOUCHE.png' },
];

export const RESULTAT_MELEE_OPTIONS: Option<ResultatMelee>[] = [
  ['GAGNEE', 'Dominante', '/icons/event/REUSSITE.png'], 
  ['SUBIE', 'Subie', '/icons/event/ECHEC.png'], 
  ['CONTRE', 'Contre', '/icons/event/ECHEC.png'],
  ['GAIN_PENALITE', 'Gain pénalité', '/icons/event/GAIN_PENALITE.png'], 
  ['PENALISEE', 'Pénalisée', '/icons/event/DISCIPLINE_PENALITE.png'],
  ['ESSAI', 'Essai', '/icons/event/SCORE_ESSAI.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<ResultatMelee>[];

export const RESULTAT_MAUL_OPTIONS: Option<ResultatMaul>[] = [
  ['AVANCEE_FAIBLE', 'Avancée faible', '/icons/event/REUSSITE.png'],
  ['AVANCEE_FORTE', 'Avancée forte', '/icons/event/REUSSITE.png'],
  ['PENALISEE', 'Pénalisée', '/icons/event/DISCIPLINE_PENALITE.png'],
  ['GAIN_PENALITE', 'Gain pénalité', '/icons/event/GAIN_PENALITE.png'], 
  ['ESSAI', 'Essai', '/icons/event/SCORE_ESSAI.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<ResultatMaul>[];

export const RESULTAT_RUCK_OPTIONS: Option<ResultatRuck>[] = [
  ['GAGNE', 'Gagné', '/icons/event/REUSSITE.png'],
  ['CONSERVE', 'Conservé', '/icons/event/REUSSITE.png'],
  ['PERDU', 'Perdu', '/icons/event/ECHEC.png'],
  ['GAIN_PENALITE', 'Gain pénalité', '/icons/event/GAIN_PENALITE.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<ResultatRuck>[];

export const RESULTAT_TOUCHE_OPTIONS: Option<ResultatTouche>[] = [
  ['GAGNEE', 'Gagnée', '/icons/event/REUSSITE.png'], 
  ['PERDUE', 'Perdue', '/icons/event/ECHEC.png'], 
  ['PENALISEE', 'Pénalisée', '/icons/event/DISCIPLINE_PENALITE.png'], 
  ['GAIN_PENALITE', 'Gain pénalité', '/icons/event/GAIN_PENALITE.png'],
  ['BRAS_CASSE', 'Bras cassé', '/icons/event/DISCIPLINE_BRAS_CASSE.png'],
  ['GAIN_BRAS_CASSE', 'Gain Bras cassé', '/icons/event/GAIN_BRAS_CASSE.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<ResultatTouche>[];

export const RECUPERATION_OPTIONS: Option<Recuperation>[] = [
  ['GAGNE', 'Gagné', '/icons/event/REUSSITE.png'],
  ['PERDU', 'Perdu', '/icons/event/ECHEC.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<Recuperation>[];

export const RESULTAT_OPTIONS: Option<Resultat>[] = [
  ['REUSSITE', 'Réussite', '/icons/event/REUSSITE.png'], 
  ['ECHEC', 'Échec', '/icons/event/ECHEC.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<Resultat>[];

export const EVENT_NATURE_OPTIONS : Option<NatureEvenement>[] = [
  { nature: 'SCORE',        label: 'Score'          },
  { nature: 'CONQUETE',     label: 'Conquête'       },
  { nature: 'FAIT_DE_JEU',  label: 'Fait de jeu'    },
  { nature: 'ERREUR',       label: 'Erreur'         },
  { nature: 'DISCIPLINE',   label: 'Discipline'     },
  { nature: 'REMPLACEMENT', label: 'Rempl'   }
  ].map(nat => { 
    return { 
      label: nat.label,  
      value: nat.nature as NatureEvenement,  
      icon: `/icons/event/${nat.nature}.png` 
    } as Option<NatureEvenement>; 
  });

