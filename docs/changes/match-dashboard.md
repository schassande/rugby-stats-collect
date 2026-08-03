# Tableau comparatif du match

## Objectif

Ajouter à la page `match-detail` un tableau comparatif des événements des deux équipes, lisible sur mobile.

## Filtre de période

Un filtre placé au-dessus du tableau permet de sélectionner la période affichée :

- **1re mi-temps** : événements dont `periode = 1` ;
- **2e mi-temps** : événements dont `periode = 2` ;
- **Match complet** : événements des deux mi-temps.

L'option **Match complet** est sélectionnée par défaut.

## Structure du tableau

Le tableau comporte trois colonnes :

| Nature d'événement | Nous | Adversaire |
|---|---|---|
| Score | Événements de notre équipe | Événements de l'adversaire |
| Conquête | Événements de notre équipe | Événements de l'adversaire |
| Discipline | Événements de notre équipe | Événements de l'adversaire |
| Fait de jeu | Événements de notre équipe | Événements de l'adversaire |
| Erreur | Événements de notre équipe | Événements de l'adversaire |
| Remplacement | Événements de notre équipe | Événements de l'adversaire |

Une ligne est dédiée à chaque nature d'événement. La nature `TEMPS` n'est pas affichée : elle sert au chronométrage et à la délimitation des périodes.

## Contenu des cellules

Chaque événement est affiché sur une ligne à l'intérieur de sa cellule, avec :

1. l'heure ou la minute de l'événement ;
2. le type d'événement ;
3. le résultat, lorsqu'il existe.

Exemples :

```text
12:35 · Essai · Réussi
28:10 · Drop · Réussi
```

Les événements sont triés par ordre chronologique. Une cellule sans événement affiche `—`.

Avec le filtre **Match complet**, les événements des deux mi-temps sont regroupés et restent triés chronologiquement.

## Natures utilisées

Les lignes correspondent aux valeurs de `Evenement.nature` :

- `SCORE` — Score ;
- `CONQUETE` — Conquête ;
- `DISCIPLINE` — Discipline ;
- `FAIT_DE_JEU` — Fait de jeu ;
- `ERREUR` — Erreur ;
- `REMPLACEMENT` — Remplacement.

Les événements sont répartis dans les colonnes selon leur équipe (`NOUS` ou `ADV`) et filtrés selon leur période.

## Exemple d'affichage

| Nature d'événement | Nous | Adversaire |
|---|---|---|
| Score | `12:35 · Essai · Réussi`<br>`28:10 · Drop · Réussi` | `19:42 · Essai · Réussi` |
| Conquête | `08:15 · Touche · Gagnée`<br>`22:30 · Mêlée · Gagnée` | `15:05 · Touche · Perdue` |
| Discipline | `25:40 · Pénalité · Commise` | `31:12 · Pénalité · Commise` |
| Fait de jeu | `18:20 · Ruck · Conservé` | `—` |
| Erreur | `34:05 · En-avant` | `11:45 · Sortie en touche` |
| Remplacement | `40:00 · Normal` | `—` |

