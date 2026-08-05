# Export Excel des matchs et de leurs événements

## Objectif

Permettre à l'utilisateur d'exporter les données d'un ou de plusieurs matchs
dans un fichier Excel (`.xlsx`), en incluant les événements associés à chaque
match.

L'export est une opération de consultation : il ne modifie ni les matchs, ni
les événements, ni leur état de synchronisation. Il doit fonctionner avec les
données locales disponibles, y compris lorsque l'application est hors ligne.

## Périmètre fonctionnel

L'utilisateur peut :

- exporter un match depuis l'icône d'export de sa carte dans `team-detail` ;
- sélectionner plusieurs matchs depuis une liste de matchs, puis lancer un
  export groupé ;
- choisir explicitement les matchs à exporter avant de générer le fichier ;
- télécharger le fichier généré depuis le navigateur.

Les matchs exportables sont exclusivement ceux de l'équipe courante et de la
saison déjà sélectionnée ou affichée dans `team-detail`. Les événements exportés sont ceux rattachés aux matchs
sélectionnés via `Evenement.matchId`. Toute donnée orpheline est exclue de
l'export, sans message ni avertissement à l'utilisateur.

## Disponibilité dans l'application

La fonctionnalité est disponible depuis la page `team-detail`, dans la liste
des matchs de l'équipe sélectionnée. Aucun export n'est ajouté à la page
globale de synchronisation ou à une page dédiée.

### Export simple depuis une carte de match

Chaque match est affiché dans une `p-card`. Une icône d'export est ajoutée sur
chaque carte, dans la zone des actions de la carte. Elle permet de télécharger
immédiatement un fichier Excel contenant uniquement le match concerné et ses
événements.

L'icône est fa-file-excel-o sans libellé mais avec une infobulle explicite, par exemple
« Exporter ce match », afin de rester compréhensible et accessible. L'action
doit être désactivée pendant la génération de son export et son état de
chargement doit être visible.

### Mode d'export multiple

Sous la liste des cartes de matchs, ajouter une zone d'actions contenant :

- une checkbox « Export multiple » ;
- un bouton « Sélectionner tous » ;
- un bouton « Exporter [nombre] matchs ».

Lorsque la checkbox « Export multiple » est cochée, une checkbox de sélection
devient visible à gauche, à l'extérieur de chaque `p-card`. L'utilisateur peut alors
sélectionner les matchs à inclure dans le fichier.

La liste des matchs n'est pas paginée. Le bouton « Sélectionner tous » agit
donc sur l'ensemble des matchs correspondant au filtre de saison affiché.

Le bouton « Sélectionner tous » est toujours visible. Il est désactivé lorsque
le mode export multiple n'est pas activé. En mode export multiple, il coche en
une seule action les checkboxes de tous les matchs de la
saison déjà sélectionnée ou affichée dans `team-detail`, correspondant au filtre actif, y compris ceux qui ne seraient
pas actuellement visibles à l'écran, puis met à jour le compteur du bouton
d'export. Il s'agit d'un raccourci d'interface équivalent au fait de cocher
chaque case individuellement.

Les checkboxes individuelles restent indépendantes après cette action :
l'utilisateur peut décocher certains matchs sans modifier la sélection des
autres. Le bouton ne rend donc pas la sélection indivisible. Lorsque tous les
matchs de la saison en cours correspondant au filtre sont sélectionnés, son
libellé devient « Désélectionner tous » ; il permet alors de vider la sélection
en une seule action. Si au moins un match est désélectionné, le libellé revient
à « Sélectionner tous ».

Le bouton d'export multiple est toujours visible dans la zone d'actions :

- affiche le nombre courant de matchs sélectionnés ;
- est désactivé si le mode « Export multiple » n'est pas activé ;
- est désactivé si aucun match n'est sélectionné ;
- lance un seul téléchargement contenant tous les matchs sélectionnés et
  leurs événements.

Lorsque le mode multiple est désactivé, les checkboxes de sélection des cartes
ne sont plus visibles, les boutons d'export multiple restent visibles mais
désactivés, et la sélection est réinitialisée. L'export simple de
chaque carte reste disponible quel que soit l'état du mode multiple.

La sélection est également réinitialisée lorsqu'un filtre de saison est
modifié, lorsque la liste des matchs est rechargée ou lorsque l'utilisateur
change d'équipe. Les matchs sélectionnés doivent donc toujours correspondre à
la liste et au filtre actuellement affichés.

Le compteur affiché dans le bouton est mis à jour immédiatement à chaque
sélection ou désélection. Son libellé attendu est par exemple
« Exporter 3 matchs » ; pour zéro sélection, il peut afficher « Exporter 0
match » mais reste désactivé.

## Parcours utilisateur

### Export d'un match

Depuis `team-detail`, l'utilisateur clique sur l'icône d'export de la carte du
match. Le match et ses événements associés sont chargés, puis le fichier est
téléchargé.

### Export de plusieurs matchs

Depuis `team-detail`, l'utilisateur active « Export multiple », sélectionne une
ou plusieurs cartes, puis clique sur le bouton dont le libellé indique le
nombre sélectionné.

Avant le téléchargement, l'application :

1. charge les données des matchs sélectionnés ;
2. charge leurs événements locaux ;
3. construit le classeur Excel ;
4. déclenche le téléchargement du fichier.

Un seul export peut être généré à la fois. Pendant la génération, toutes les
actions d'export de `team-detail` sont désactivées et un indicateur de
chargement est affiché. Une erreur est présentée sans perdre la sélection des
matchs.

## Contenu du classeur

Un export contient les feuilles suivantes : `Matchs` et `Evenements`.

### Feuille `Matchs`

Une ligne par match sélectionné, avec les colonnes :

| Colonne | Source |
|---|---|
| Identifiant du match | `Match.id` |
| Date | `Match.date` |
| Saison | `Match.saison` |
| Équipe | nom de l'équipe liée au match |
| Adversaire | `Match.nomAdversaire` |
| Lieu | `Match.lieu` |
| Terrain | `Match.terrain` |
| Conditions météo | `Match.conditions` |
| Début | `Match.debut` au format `AAAA/MM/JJ HH:mm:ss` |
| Fin | `Match.fin` au format `AAAA/MM/JJ HH:mm:ss` |
| Score nous | `Match.score.nous` |
| Score adversaire | `Match.score.adversaire` |
| Statut | `Match.status` |
| Nombre d'événements | nombre d'événements exportés pour le match |

Les valeurs facultatives absentes restent vides. Les scores et le nombre
d'événements sont exportés comme des nombres Excel.

### Feuille `Evenements`

Une ligne par événement, avec les colonnes :

| Colonne | Source |
|---|---|
| Identifiant de l'événement | `Evenement.id` |
| Identifiant du match | `Evenement.matchId` |
| Date du match | `Match.date` |
| Adversaire | `Match.nomAdversaire` |
| Période | `Evenement.periode` |
| Instant | `Evenement.instant` |
| Minute | `Evenement.minute` |
| Seconde | `Evenement.seconde` |
| Équipe | `Evenement.equipe` |
| Nature | `Evenement.nature` |
| Type | `Evenement.type` |
| Identifiant du rapporteur | `Evenement.rapporteurId` |
| Complément discipline | `Evenement.complementDiscipline` |
| Faute pénalité | `Evenement.fautesPenalite` |
| Faute bras cassé | `Evenement.fautesBrasCasse` |
| Numéro joueur 1 | `Evenement.numeroJoueur1` |
| Numéro joueur 2 | `Evenement.numeroJoueur2` |
| Zone lancée | `Evenement.zoneLancee` |
| Zone terrain | `Evenement.zoneTerrain` |
| Position largeur | `Evenement.positionLargeur` |
| Choix de jeu pénalité | `Evenement.choixDeJeuPenalite` |
| Choix de jeu bras cassé | `Evenement.choixDeJeuBrasCasse` |
| Distance jeu au pied | `Evenement.distanceJeuPied` |
| Résultat mêlée | `Evenement.resultatMelee` |
| Résultat maul | `Evenement.resultatMaul` |
| Résultat touche | `Evenement.resultatTouche` |
| Résultat transformation | `Evenement.resultatTransformation` |
| Résultat ruck | `Evenement.resultRuck` |
| Récupération | `Evenement.recuperation` |
| Résultat | `Evenement.resultat` |
| Commentaire | `Evenement.commentaire` |

Les événements sont triés par identifiant de match, puis par période et par
instant croissant. Lorsqu'un instant ne peut pas être comparé, l'ordre de
lecture local est conservé pour les événements concernés.

### Formats de dates et champs techniques

Les attributs techniques `createdAt`, `updatedAt` et `syncedAt` ne sont pas
exportés, aussi bien pour les matchs que pour les événements.

Les autres valeurs temporelles sont exportées avec les formats suivants :

| Entité | Attribut | Format Excel |
|---|---|---|
| Match | `date` | `AAAA/MM/JJ` |
| Match | `debut`, `fin` | `AAAA/MM/JJ HH:mm:ss` |
| Événement | `instant` | `AAAA/MM/JJ HH:mm:ss` |
| Événement | `minute`, `seconde` | nombre simple |

Les dates et heures doivent être écrites comme de véritables valeurs date/heure
Excel, avec un format d'affichage explicite (`yyyy/mm/dd` ou
`yyyy/mm/dd hh:mm:ss`), et non comme du texte. Cette approche garantit leur
lecture, leur tri et leur utilisation dans les formules Excel, indépendamment
des paramètres régionaux de l'ordinateur. Les attributs absents restent vides.

### Feuille `Evenements` — attributs exportés

La feuille `Evenements` reprend tous les attributs métier de `Evenement`.
Les attributs techniques `createdAt` et `syncedAt` restent exclus. Les
informations `Date du match` et `Adversaire` sont ajoutées pour faciliter la
lecture et le rattachement à la rencontre.

## Format et nom du fichier

Le fichier est au format `.xlsx`, avec une première ligne d'en-tête dans chaque
feuille, des colonnes dimensionnées et des filtres automatiques. La première
ligne est figée.

Le nom suit le format, avec la date et l'heure locales de génération
(`YYYY-MM-DD-HH-mm-ss`) :

```text
rugby-stats-{nom-equipe}-{saison}-YYYY-MM-DD-HH-mm-ss.xlsx
```

Le nom de l'équipe et la saison sont nettoyés pour supprimer les caractères
interdits dans un nom de fichier. Si le nom de l'équipe est introuvable ou
devient vide après nettoyage, la valeur `equipe-inconnue` est utilisée. Le nom
est identique pour un export simple ou multiple ; les noms des adversaires ne
sont pas ajoutés.

## Règles métier

- Les matchs sont triés par date décroissante, puis par identifiant.
- Un match sans événement reste présent dans `Matchs`.
- L'export part exclusivement des matchs de l'équipe courante et de la saison
  en cours ; les données orphelines ne sont pas exportées et sont ignorées
  silencieusement.
- Les données locales sont la source de vérité ; aucune synchronisation n'est
  forcée avant l'export.
- Les valeurs métier sont exportées telles qu'elles sont stockées, sans
  traduction ambiguë.

## Gestion des erreurs

Si la génération échoue, aucun téléchargement partiel ne doit être déclenché.
L'utilisateur voit un message explicite et peut relancer l'opération.

Les données orphelines sont ignorées silencieusement, sans information affichée
à l'utilisateur. Les erreurs de lecture locale interrompent l'export.

Après génération, un message indique le nombre de matchs et d'événements
exportés ainsi que le nom du fichier.

## Contraintes d'implémentation

- Utiliser la bibliothèque `xlsx` (SheetJS) pour générer les fichiers `.xlsx`
  dans Angular et le navigateur.
- Isoler la construction du classeur dans un service dédié:  `ExportExcelService`.
- Le service ne doit effectuer aucune écriture dans IndexedDB ou Firestore.
- Mutualiser la préparation des données pour l'export simple et groupé.
- Aucune limite fonctionnelle de taille n'est définie pour l'export ; il doit
  être généré quelle que soit sa volumétrie.
- Utiliser les composants PrimeNG existants pour boutons, sélection, messages
  et indicateurs de chargement.
- Couvrir uniquement les cas principaux dans les tests d'interface : export
  simple depuis une carte, activation du mode multiple, sélection de plusieurs
  matchs, bouton « Sélectionner tous », désélection individuelle, compteur et
  activation du bouton d'export.
- Tester côté service la sélection simple et multiple, l'absence d'événements,
  le tri, les champs facultatifs et les erreurs de lecture.

## Hors périmètre

- import ou réimport du fichier Excel ;
- export des équipes, managers ou opérations de synchronisation ;
- synchronisation automatique avant export ;
- export PDF ;
- modification des données depuis le classeur.

## Critères d'acceptation

- Un export `.xlsx` est possible depuis l'icône d'export de chaque carte de
  match dans `team-detail`.
- Plusieurs matchs peuvent être sélectionnés et exportés dans un seul fichier.
- Le fichier contient les feuilles `Matchs` et `Evenements`, sans feuille de
  synthèse.
- La feuille `Evenements` contient toutes les colonnes correspondant aux
  attributs métier de `Evenement`, ainsi que la date du match et l'adversaire.
- Chaque événement est rattaché au bon match par `matchId`.
- Un match sans événement est exporté sans erreur.
- L'export fonctionne hors ligne avec les données locales.
- Aucune donnée applicative n'est modifiée pendant l'opération.
- Une erreur n'entraîne pas de téléchargement incomplet.
