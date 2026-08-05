# Fonctionnalité de tableau d'administration de la synchronisation des données

## Implémentation réalisée

L'affichage regroupe désormais la présence et le nombre d'événements dans une colonne locale,
ainsi que la présence et le nombre d'événements dans une colonne serveur, pour améliorer la
lisibilité sur les écrans étroits.

La route `/app/sync` utilise `SyncDashboardComponent` et `SyncDashboardService` pour fusionner
les matches locaux et distants, compter les événements, calculer les actions de synchronisation,
et gérer l'envoi, la nouvelle tentative, le téléchargement incrémental et la suppression locale.
Les événements distants sont chargés par match et rapprochés par `evenement.id`.

`deleteMatch` et `deleteEvent` acceptent `{ localOnly: true }` afin de supprimer localement les
objets, leurs enfants et leurs actions de synchronisation sans créer d'action distante. Le
téléchargement des équipes complète la base locale sans remplacer les équipes existantes.

## Objectif

Offrir à l'utilisateur un moyen de maitriser quelles sont les données locales et les données distantes

## Fonctionnement

La page dashboard permet de gérer la synchronisation d'une équipe. La page contient un selecteur de l'équipe à gérer. Il s'agit de la liste locales des équipes. Il y a un bouton pour télécharger les autres équipes gérées par l'utilisateur.

La page SyncDashboard affiche un tableau des matches de l'équipe séléctionnée. il s'agit des matches existants localement ou sur le serveur. La liste est donc une fusion.
Le tableau comporte 6 colonnes :

- Col 1 : Le match : Date + nom équipe adverse
- Col 2: une coche verte pour savoir si le match est stocké localement
- Col 3: Le nombre d'événement pour le match stocké en local
- Col 4: une coche verte pour savoir si le match est stocké sur le serveur
- Col 5: Le nombre d'événement sur le serveur pour le match
- col 6: les actions possibles en fonction de l'état des données

### Actions possibles

Voici les règles de gestion pour les actions de la colonne 6 dans le tableau des matches :

- S'il y a des SyncAction dont le status n'est pas'synced' concennant un match ou ses événements alors en fonction du statut des SyncAction l'utilisateur peut avoir les boutons suivants :
  - pending : bouton « Envoyer » ;
  - failed : bouton « Réessayer » ;
  - conflict : bouton « Résoudre » ou message explicite ;
  - syncing : action désactivée ;
- S'il n'y a aucune SyncAction dont le status n'est pas'synced' concennant un match ou ses événements alors l'utilisateur a un bouton pour supprimer le match et les événements de la base locale SANS créer des SyncAction et donc sans supprimer les données sur le serveur.
- S'il y a plus de données sur le serveur qu'en local concernant un match et ses événements alors l'utilisateur a un bouton pour télécharger les données dans la base locale. Le téléchargement est interdit si une SyncAction non synchronisée concerne le match ou ses événements. L'utilisateur doit d'abord envoyer, supprimer ou résoudre ces synchronisations.

L'utilisateur doit avoir au dessus du tableau un bouton pour envoyer toutes les données locales non encore synchronisées (status 'pending') vers le serveur.

### Décisions fonctionnelles

- Le rapprochement entre un match local et un match distant se fait exclusivement avec `match.id`. L'identifiant d'un match est unique et constitue la clé de fusion des deux listes.
- Lors du téléchargement d'un match existant localement et sur le serveur, seuls les événements présents sur le serveur mais absents localement sont ajoutés. Les événements locaux existants ne sont pas remplacés.
- Lorsqu'un événement existe localement mais pas sur le serveur, il est conservé localement. S'il possède une `SyncAction`, son envoi est considéré comme le traitement normal de l'incohérence. S'il ne possède aucune `SyncAction`, la situation est détectée comme un conflit et une `SyncAction` de création est recréée afin de permettre l'envoi de l'événement.
- Lorsqu'un match existe localement mais pas sur le serveur, il est conservé localement. S'il possède une `SyncAction`, son envoi normal doit le créer sur le serveur. S'il ne possède aucune `SyncAction`, la situation est considérée comme un conflit et une `SyncAction` de création est recréée.
- Lorsqu'un match existe sur le serveur mais pas localement, il est affiché dans le tableau avec une action « Télécharger ». Il n'est pas importé automatiquement.
- Lorsqu'un match existe localement et sur le serveur mais que ses données diffèrent, la situation est considérée comme un conflit. Aucune version n'est remplacée ou envoyée automatiquement.
- En cas de conflit concernant un match ou un événement, le tableau affiche uniquement un message explicite. La résolution interactive ou automatique des conflits est hors du périmètre de cette fonctionnalité.
- Il ne doit exister qu'une seule `SyncAction` par objet métier (`Equipe`, `Match` ou `Evenement`). Lors d'une nouvelle tentative, l'action existante est mise à jour ; une nouvelle action n'est pas créée. Il n'y a donc pas de priorité à appliquer entre plusieurs actions pour un même objet.
- Le bouton d'envoi global du tableau traite uniquement les `SyncAction` au statut `pending` rattachées à l'équipe sélectionnée. Les actions des autres équipes ne sont pas envoyées.
- Pour une `SyncAction` au statut `failed`, le bouton « Réessayer » relance immédiatement l'envoi de l'action existante, sans confirmation et sans créer une nouvelle action.
- Pour un match présent uniquement sur le serveur, l'action « Télécharger » importe le match et l'ensemble de ses événements en une seule opération.
- Lors d'un téléchargement incrémental, le rapprochement des événements se fait exclusivement avec `evenement.id`. Un événement distant dont l'identifiant n'existe pas localement est ajouté ; un événement local portant le même identifiant n'est pas remplacé.
- Toute suppression locale d'un match doit être précédée d'une confirmation explicite de l'utilisateur.
- La confirmation de suppression précise que les événements enfants seront également supprimés localement et que les données distantes ne seront pas supprimées.
- Avec `localOnly: true`, la suppression supprime toutes les `SyncAction` relatives à l'objet et à ses enfants, quel que soit leur statut, y compris `synced`.
- Lorsqu'un match est présent localement et sur le serveur avec le même nombre d'événements, sans `SyncAction` non synchronisée, l'unique action proposée est « Supprimer localement ».
- Lorsqu'un match existe uniquement sur le serveur, l'unique action affichée est « Télécharger ».
- À l'ouverture du dashboard, la dernière équipe sélectionnée est restaurée si cette information est mémorisée. Sinon, la première équipe locale est sélectionnée.
- Si aucune équipe locale n'existe à l'ouverture du dashboard, un message invite l'utilisateur à télécharger les équipes qu'il gère. Aucun téléchargement automatique n'est effectué.
- En cas d'erreur réseau ou Firestore pendant le chargement distant, le dashboard affiche l'erreur et propose un bouton « Réessayer ».
- Pendant toute opération de chargement, téléchargement, synchronisation ou suppression, une modal avec un spinner est affichée et bloque toutes les actions de l'utilisateur jusqu'à la fin de l'opération.
- La route existante `/app/sync` charge `SyncDashboardComponent`. `SyncListComponent` reste présent dans le projet mais n'est plus référencé par le routage.
- Le bouton « Télécharger les équipes » télécharge toutes les équipes distantes gérées par l'utilisateur. Une équipe locale existante n'est jamais remplacée par la version distante.

## Contraintes d'implementation

- Documenter ici l'implémentation dans un chapitre additionnel (après celui-ci)
- Réaliser un nouveau composant SyncDashboard qui remplacera le composant SyncList. Le composant SyncList ne doit pas être modifié. Il sera mis de coté (plus de routage vers lui)
- Utiliser systématiquement des widget primeNG pour conserver le style de l'application
- Pour gérer la suppression locale, les méthodes actuelles deleteMatch et deleteEvent de DatabaseService prendront un paramètre supplémentaire '{ localOnly: true }'. localOnly = true indique qu'il faut supprimer la donnée et ses enfants sans créer de SyncAction et qu'il faut Supprimer les SyncAction relative à l'objet et ses enfants
- Le chargement des données distantes se fera de manière optimisée : Le chargement utilise une requête pour les matches de l’équipe, puis une requête pour les événements de chaque match affiché. Aucune requête ne doit être effectuée par événement.
- Creer un service dédié : SyncDashboardService. SyncDashboardService construit les lignes du tableau à partir : des matches locaux, des matches distants, du nombre d’événements locaux et distants, et des SyncAction associées. Il détermine également les actions disponibles pour chaque ligne. Il délègue les écritures à DatabaseService et SyncService.

## Description de l'implementation a realiser

### Composants et routage

Creer `src/app/features/sync/sync-dashboard.component.ts` et son template. Le composant remplace `SyncListComponent` sur `/app/sync`; `SyncListComponent` reste present mais n'est plus route. Utiliser les widgets PrimeNG `Select`, `Table`, `Button`, `Dialog` et les composants de message.

Le composant gere l'equipe selectionnee, restaure la derniere equipe memorisee et recharge le tableau a chaque changement. S'il n'existe aucune equipe locale, il affiche un message et l'action de telechargement des equipes.

### SyncDashboardService

Creer `src/app/core/services/sync-dashboard.service.ts`. Le service construit les lignes a partir des matches locaux et distants, des comptes d'evenements et des `SyncAction`. Il determine les actions disponibles et delegue les ecritures a `DatabaseService` et `SyncService`.

Prevoir des operations pour charger une equipe, telecharger les equipes gerees, envoyer les actions `pending` de l'equipe, reessayer une action `failed`, telecharger un match et ses evenements, completer les evenements manquants et supprimer localement un match.

### Chargement et fusion

Pour l'equipe selectionnee, charger les matches locaux, puis les matches distants avec une requete Firestore filtree par `equipeId` et `managerId`. Construire l'union avec `match.id` comme cle unique. Pour chaque match affiche, executer une requete d'evenements distants par match, jamais une requete par evenement. Compter les evenements locaux par `matchId` et les rapprocher par `evenement.id`.

Un match ou evenement local absent du serveur est conserve. Avec une `SyncAction`, son envoi normal retablit la coherence. Sans action, signaler un conflit et recreer une action de creation. Une difference entre les champs d'un match present des deux cotes est aussi un conflit, sans remplacement automatique.

Un match uniquement distant est affiche avec l'action « Telecharger »; le telechargement importe le match et tous ses evenements. Pour un match deja local, seuls les evenements distants dont l'`id` est absent localement sont ajoutes. Les equipes distantes sont toutes telechargees, mais une equipe locale existante n'est jamais remplacee.

### Calcul des actions

- `pending` : bouton « Envoyer » ;
- `failed` : bouton « Reessayer », qui relance l'action existante ;
- `syncing` : action desactivee ;
- conflit : message explicite uniquement ;
- match distant absent localement : « Telecharger » ;
- match coherent, sans action non `synced` : « Supprimer localement ».

Le telechargement est interdit si une action non `synced` concerne le match ou un evenement enfant. Il ne doit exister qu'une seule `SyncAction` par objet metier ; une nouvelle tentative met a jour l'action existante.

### Ecritures et suppression locale

Ajouter `localOnly?: boolean` a `DatabaseService.deleteMatch` et `deleteEvent`, avec `false` par defaut. Avec `localOnly: true`, supprimer l'objet, ses enfants et toutes leurs `SyncAction`, quel que soit leur statut, sans creer d'action de suppression. Utiliser une transaction IndexedDB lorsque cela est possible.

La suppression locale est precedee d'une confirmation indiquant que les evenements enfants seront supprimes localement et que les donnees distantes resteront intactes.

### Interface et erreurs

Toute operation de chargement, telechargement, synchronisation ou suppression affiche une modal non fermable avec spinner et bloque toutes les actions. En cas d'erreur reseau ou Firestore, afficher l'erreur et un bouton « Reessayer ».

### Tests attendus

Ajouter des tests pour la fusion par `match.id`, l'affichage des matches locaux/distants, le rapprochement incremental par `evenement.id`, les conflits, le calcul des actions, l'envoi limite a l'equipe selectionnee, la suppression locale en cascade, la non-substitution des donnees locales et les erreurs de chargement.
