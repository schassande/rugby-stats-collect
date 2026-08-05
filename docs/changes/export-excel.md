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

- exporter un match depuis sa page de détail ;
- sélectionner plusieurs matchs depuis une liste de matchs, puis lancer un
  export groupé ;
- choisir explicitement les matchs à exporter avant de générer le fichier ;
- télécharger le fichier généré depuis le navigateur.

Les événements exportés sont ceux rattachés aux matchs sélectionnés via
`Evenement.matchId`. Tous les événements sont exportés, quelle que soit leur
nature, leur équipe, leur période ou leur résultat.

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
doit être désactivée pendant la génération de l'export et son état de
chargement doit être visible.

### Mode d'export multiple

Sous la liste des cartes de matchs, ajouter une zone d'actions contenant :

- une checkbox « Export multiple » ;
- un bouton « Sélectionner tous » ;
- un bouton « Exporter [nombre] matchs ».

Lorsque la checkbox « Export multiple » est cochée, une checkbox de sélection
devient visible à gauche de chaque `p-card`. L'utilisateur peut alors
sélectionner les matchs à inclure dans le fichier.

Le bouton « Sélectionner tous » est visible et actif uniquement en mode export
multiple. Il coche en une seule action les checkboxes de tous les matchs
affichés dans la liste et met à jour le compteur du bouton d'export. Il s'agit
d'un raccourci d'interface équivalent au fait de cocher chaque case
individuellement.

Les checkboxes individuelles restent indépendantes après cette action :
l'utilisateur peut décocher certains matchs sans modifier la sélection des
autres. Le bouton ne doit donc pas rendre la sélection indivisible. Il n'y a pas d'état « tous sélectionnés », seulemenent des états individuels de chaque case à cocher.

Le bouton d'export multiple :

- affiche le nombre courant de matchs sélectionnés ;
- est désactivé si le mode « Export multiple » n'est pas activé ;
- est désactivé si aucun match n'est sélectionné ;
- lance un seul téléchargement contenant tous les matchs sélectionnés et
  leurs événements.

Lorsque le mode multiple est désactivé, les checkboxes de sélection des cartes
ne sont plus visibles et la sélection est réinitialisée. L'export simple de
chaque carte reste disponible quel que soit l'état du mode multiple.

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

Pendant la génération, l'action est désactivée et un indicateur de chargement
est affiché. Une erreur est présentée sans perdre la sélection des matchs.

## Contenu du classeur

Un export contient au minimum les feuilles suivantes.

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
| Début | `Match.debut` |
| Fin | `Match.fin` |
| Score nous | `Match.score.nous` |
| Score adversaire | `Match.score.adversaire` |
| Statut | `Match.status` |
| Nombre d'événements | nombre d'événements exportés pour le match |

Les valeurs facultatives absentes restent vides. Les scores et le nombre
d'événements sont exportés comme des nombres Excel.

### Feuille `Événements`

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
| Sous-type | `Evenement.sousType` |
| Résultat | `Evenement.resultat` |
| Commentaire | `Evenement.commentaire` |

Les événements sont triés par identifiant de match, puis par période et par
instant croissant. Lorsqu'un instant ne peut pas être comparé, l'ordre de
lecture local est conservé pour les événements concernés.

### Feuille `Synthèse`

Une feuille de synthèse regroupe par match, équipe et nature/type le nombre
d'événements exportés. Elle contient notamment : `Match`, `Adversaire`,
`Équipe`, `Nature`, `Type`, `Nombre`.

Les natures et types sans occurrence ne sont pas ajoutés à cette feuille.

## Format et nom du fichier

Le fichier est au format `.xlsx`, avec une première ligne d'en-tête dans chaque
feuille, des colonnes dimensionnées et des filtres automatiques. La première
ligne est figée.

Le nom suit le format :

```text
rugby-stats-matchs-YYYY-MM-DD.xlsx
```

Pour un export d'un seul match, le nom de l'adversaire peut être ajouté après
le préfixe, après nettoyage des caractères interdits. Pour plusieurs matchs,
aucun adversaire ne doit être utilisé dans le nom.

## Règles métier

- Les matchs sont triés par date décroissante, puis par identifiant.
- Un match sans événement reste présent dans `Matchs`.
- Un événement orphelin ou dont le match est introuvable n'est pas exporté et
  ne doit pas être signalé.
- Les données locales sont la source de vérité ; aucune synchronisation n'est
  forcée avant l'export.
- Les valeurs métier sont exportées telles qu'elles sont stockées, sans
  traduction ambiguë.

## Gestion des erreurs

Si la génération échoue, aucun téléchargement partiel ne doit être déclenché.
L'utilisateur voit un message explicite et peut relancer l'opération.

Si certains événements sont ignorés, le téléchargement reste possible sans message d'information. Les erreurs de lecture locale interrompent l'export.

Après génération, un message indique le nombre de matchs et d'événements
exportés ainsi que le nom du fichier.

## Contraintes d'implémentation

- Utiliser une bibliothèque `.xlsx` compatible avec Angular et le navigateur,
  à valider avec les dépendances existantes avant ajout.
- Isoler la construction du classeur dans un service dédié:  `ExportExcelService`.
- Le service ne doit effectuer aucune écriture dans IndexedDB ou Firestore.
- Mutualiser la préparation des données pour l'export simple et groupé.
- Utiliser les composants PrimeNG existants pour boutons, sélection, messages
  et indicateurs de chargement.
- Tester la sélection simple et multiple, l'absence d'événements, le tri, les
  champs facultatifs et les erreurs de lecture.

## Hors périmètre

- import ou réimport du fichier Excel ;
- export des équipes, managers ou opérations de synchronisation ;
- synchronisation automatique avant export ;
- export PDF ;
- modification des données depuis le classeur.

## Critères d'acceptation

- Un export `.xlsx` est possible depuis la page de détail d'un match.
- Plusieurs matchs peuvent être sélectionnés et exportés dans un seul fichier.
- Le fichier contient les feuilles `Matchs`, `Événements` et `Synthèse`.
- Chaque événement est rattaché au bon match par `matchId`.
- Un match sans événement est exporté sans erreur.
- L'export fonctionne hors ligne avec les données locales.
- Aucune donnée applicative n'est modifiée pendant l'opération.
- Une erreur n'entraîne pas de téléchargement incomplet.
