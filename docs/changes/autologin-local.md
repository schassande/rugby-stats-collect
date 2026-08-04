# Fonctionnalité d'auto login local

## Objectif
Eviter que l'utilisateur doivent cliquer sur les pages d'accueil ou de login pour accéder à l'application.

## Fonctionnement
Lorsqu'il y a un et un seul utilisateur présent en BD local alors l'application se connecte automatique avec cet utilisateur en utilisant fonction AuthService.loginLocal(localUser).
Condition : Le mode auto login local doit être préalable activé.

## Le mode auto login local
- La page de login en model local contient une case à cocher (PrimeNG) permettant l'activation ou nous de l'auto login
- Le mode autoLoginLocal est par défaut à false. 
- Il est stocké dans le local storage pour l'utilisateur. 
- Lorsque l'utilisateur se déconnecte le mode auto login local est remis à false dans le local storage

## Solution d'implémentation retenue : gestion dans AuthService

La gestion de l'auto-login local est centralisée dans `AuthService`. Le composant racine de l'application ne fait qu'appeler la méthode d'initialisation du service au démarrage.

### Stockage du paramètre

Le paramètre est stocké dans `localStorage` sous une clé globale, par exemple `auto_login_local`.

Les valeurs acceptées sont :

- `true` : l'auto-login local est activé ;
- `false` ou absence de valeur : l'auto-login local est désactivé.

Une clé globale est suffisante, car l'auto-login ne s'applique que lorsqu'un seul utilisateur local est présent dans la base locale.

`AuthService` expose deux opérations pour ce paramètre : lire l'état courant et modifier puis persister cet état. Le composant de login utilise ces opérations pour initialiser et mettre à jour la case à cocher PrimeNG.

### Initialisation au démarrage

`AuthService` expose une méthode asynchrone d'initialisation de l'auto-login local, appelée au démarrage de l'application.

Le traitement suit les règles suivantes :

1. Si l'auto-login local est désactivé, aucune action n'est effectuée.
2. Les utilisateurs locaux sont lus depuis IndexedDB via `getLocalUsers()`.
3. Si la liste ne contient pas exactement un utilisateur, aucune connexion automatique n'est effectuée.
4. Si la liste contient exactement un utilisateur, `loginLocal(localUser)` est appelé.
5. En cas d'erreur de lecture ou de connexion, l'erreur est journalisée et l'utilisateur reste sur le parcours de connexion normal.

Cette logique reste dans `AuthService` afin de conserver la responsabilité de l'authentification au même endroit que `loginLocal`, `getLocalUsers` et `signOut`.

### Ordre d'initialisation

L'appel à l'initialisation de l'auto-login doit être effectué avant la première évaluation des routes protégées par `authGuard`.

L'initialisation Firebase existante et l'initialisation locale devront donc être coordonnées dans le bootstrap de l'application. L'objectif est que `currentManagerSubject` soit alimenté avant qu'une navigation vers une route protégée ne soit redirigée vers la page de login.

L'auto-login local ne doit pas déconnecter ni remplacer une session Firebase déjà restaurée. Si une session Firebase valide existe, elle reste prioritaire.

### Activation depuis la page de login

Dans le mode d'authentification local, la page de login affiche une case à cocher PrimeNG.

- La valeur initiale de la case est lue depuis `AuthService`.
- Toute modification de la case est immédiatement persistée dans `localStorage`.
- La case n'est pas affichée dans le mode Firebase.
- L'activation du paramètre autorise l'auto-login lors d'un prochain démarrage.

### Déconnexion

`AuthService.signOut()` remet l'auto-login local à `false`.

Ainsi, une déconnexion volontaire empêche la reconnexion automatique au prochain chargement de l'application. Les données de l'utilisateur local restent présentes dans IndexedDB ; seule la préférence d'auto-login est réinitialisée.

### Scénarios de test

- Auto-login désactivé : aucune connexion automatique.
- Auto-login activé avec zéro utilisateur local : aucune connexion automatique.
- Auto-login activé avec un utilisateur local : appel de `loginLocal` et accès à l'application.
- Auto-login activé avec plusieurs utilisateurs locaux : aucune connexion automatique et affichage de la page de login.
- Déconnexion : le paramètre est remis à `false`.
- Rechargement après déconnexion : aucune reconnexion automatique.
- Session Firebase restaurée : elle reste prioritaire sur l'auto-login local.
- Erreur IndexedDB : l'application reste utilisable via le parcours de login normal.


