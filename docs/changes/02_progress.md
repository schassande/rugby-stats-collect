# Phase 02 - Firebase Auth : état d'avancement

Dernière mise à jour: 2026-07-13

Résumé rapide: l'auth Firebase existait déjà. J'ai implémenté une authentification locale optionnelle basée sur IndexedDB (Dexie) pour le développement/offline.

## Checklist (issue / état)

- [x] Vérifier l'existence de la configuration Firebase (`src/app/core/config/firebase.config.ts`) — FAIT
- [x] Vérifier `AuthService` initial — FAIT (présent et complet pour Firebase)
- [x] Créer schéma Dexie `local_users` — FAIT (`src/app/core/db/rugby-stats.database.ts`)
- [x] Implémenter `LocalAuthService` (hash/verify, CRUD) — FAIT (`src/app/core/services/local-auth.service.ts`)
- [x] Ajouter utilitaire `setupLocalUsers` pour créer un utilisateur par défaut — FAIT (`src/app/core/utils/setup-local-users.ts`)
- [x] Intégrer gestion du mode d'auth (`local` vs `firebase`) dans `AuthService` — FAIT (lecture depuis `localStorage`)
 - [x] Ajouter UI pour basculer le mode d'auth (optionnel) — FAIT (`auth-mode-toggle` ajouté et inclus dans les pages `login`/`signup`)
- [ ] Documenter et déployer les règles Firestore (manuel)

## Détails techniques

- Le mode d'auth est déterminé par `localStorage.getItem('auth_mode')`. Si non présent, on tombe sur `firebase` si la configuration Firebase est présente, sinon `local`.
- `LocalAuthService` utilise `crypto.subtle.digest('SHA-256')` pour hacher les mots de passe (fallback JS simple si indisponible).
- Les utilisateurs locaux sont stockés dans IndexedDB table `local_users` (clé primaire `id` = email).
- `AuthService` utilise maintenant `LocalAuthService` quand le mode est `local` pour `signInWithEmail` et `signUpWithEmail`. Le sign-out supprime `auth_mode` en local.

## Prochaines actions proposées

- Ajouter un petit panneau d'option (paramètres) permettant de forcer `auth_mode` entre `local` et `firebase`.
- Déployer les règles Firestore manuellement depuis la console Firebase.
- Voulez-vous que je crée le panneau d'option dans l'app (petit composant `auth-mode-toggle`) et exécute un seed (`setupLocalUsers`) au démarrage en mode `local` ?
 - Le composant `auth-mode-toggle` a été ajouté ; il déclenche `setupLocalUsers` lorsque le mode passe à `local`.
