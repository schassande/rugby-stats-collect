# Tableau synthese d'un match

## Objectif

Ajouter à la page `match-detail` un tableau de synthese d'un match entre des deux équipes, lisible sur mobile.
Ce tableau de bord est un component independant: MatchDashboard Ce widget a 3 parametres d'entrée: Team, Match, Evenement[]. C'est la page match-detail qui lui passe les paramètres.

## Filtre de période

Un filtre placé au-dessus du tableau permet de sélectionner la période affichée :

- **1re mi-temps** : événements dont `periode = 1` ;
- **2e mi-temps** : événements dont `periode = 2` ;
- **Match complet** : événements des deux mi-temps.

L'option **Match complet** est sélectionnée par défaut.
Le filtre est réalisé avec un widget primeNG Select.

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

Le tableau fera au max 400px de large. Il sera centré en largeur sur la page match-detail.

## Contenu des cellules

Dans une ligne de la nature la cellule contient une ligne pour chaque type d'événement de la nature de l'événement.
Sur la ligne on affiche : le nom du type et le nombre d'occurrence de l'événement sur la période choisie (1, 2 ou total)
Exemples :

```text
Essai: 4
Drop: 1
```

Avec le filtre **Match complet**, les événements des deux mi-temps sont regroupés/cumulés

