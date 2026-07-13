# Phase 03 - PWA Configuration : état d'avancement

Dernière mise à jour: 2026-07-13

Résumé rapide: Le schéma PWA a été appliqué et la build production génère désormais le service worker. Le projet contient `manifest.webmanifest`, `ngsw-config.json` (créé par le schéma) et `provideServiceWorker` est configuré dans `src/app/app.config.ts`.

## Checklist (issue / état)

- [x] `@angular/pwa` installé — OUI (schéma appliqué via `ng add @angular/pwa`)
- [x] `manifest.webmanifest` configuré — OUI (`src/manifest.webmanifest` présent)
- [x] `ngsw-config.json` présent — OUI (config de base + `dataGroups` Firestore ajouté)
- [x] Service Worker enregistré/configuré — OUI (`provideServiceWorker` dans `src/app/app.config.ts`)
- [x] Build production testé — OUI (`npx ng build --configuration production` a généré `ngsw-worker.js`)
- [ ] Installable sur mobile testé — PARTIEL (manifest présent; tests d'installation non effectués)
- [ ] Offline mode testé — PARTIEL (service worker généré; tests offline manuels non effectués)

## Détails techniques

- `src/manifest.webmanifest` existe et contient les icônes `assets/icons/icon-192x192.png` et `icon-512x512.png`.
`ngsw-config.json` a été (re)créé par le schéma et contient les `assetGroups` nécessaires.

- Le service worker est configuré via `provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), registrationStrategy: 'registerWhenStable:30000' })` dans `src/app/app.config.ts` (doublon supprimé si présent).
- Le schéma `ng add @angular/pwa` a créé `public/manifest.webmanifest` et les icônes sous `public/icons/`.
- `package.json` a été ajusté pour aligner les versions Angular (21.2.x) et `npm install` a été exécuté.

- La build production a été générée dans `dist/GamesStats/browser` et contient maintenant:
	- `ngsw-worker.js`
	- `ngsw.json`
	- `safety-worker.js`
	- `manifest.webmanifest` et `icons/`

J'ai servi la build localement avec `http-server` sur `http://127.0.0.1:8080` pour vérification statique (manifest accessible, fichiers SW présents).

## Prochaines actions proposées

Prochaines actions proposées

- Vérifier l'enregistrement du SW dans le navigateur (DevTools → Application → Service Workers) et tester l'installation (PWA installable).
- Tester la navigation offline et les ressources mises en cache (simuler offline dans DevTools).
- Exécuter `npm audit fix` puis revérifier les dépendances si souhaité.

Commandes utiles pour reprise rapide:

```bash
ng build --configuration production
npx http-server dist/GamesStats/browser -p 8080 -c-1
```

Souhaitez-vous que j'exécute les vérifications interactives (ouvrir le navigateur, tester installation/offline) ?

Souhaitez-vous que je lance `ng add @angular/pwa` maintenant et effectue un build de test ?
