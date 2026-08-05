# Rendre RugbyStats installable comme PWA

## Objectif

Permettre à un utilisateur d’installer RugbyStats depuis le site déployé sur
Firebase Hosting, sur mobile comme sur desktop, puis de lancer l’application
depuis son écran d’accueil ou son menu d’applications avec une expérience
autonome.

L’application dispose déjà d’une partie de l’infrastructure nécessaire :
`@angular/service-worker`, `provideServiceWorker`, `manifest.webmanifest`, des
icônes et une configuration `ngsw-config.json`. Cette évolution consiste donc
principalement à fiabiliser et compléter l’intégration existante.

## État actuel et points à corriger

- Deux fichiers manifest sont présents (`src/manifest.webmanifest` et
  `public/manifest.webmanifest`). Le build les publie potentiellement sous le
  même nom et rend le manifest effectivement consommé ambigu.
- `src/index.html` déclare deux fois `<link rel="manifest">`.
- Le manifest source ne contient pas de description ni d’icônes `maskable`, et
  ne couvre pas les tailles déjà disponibles dans `public/icons`.
- Le service worker est activé uniquement en production, ce qui est correct,
  mais son enregistrement est différé de 30 secondes sans interface de suivi
  ou de mise à jour.
- Firebase Hosting réécrit toutes les URL vers `index.html`. Cette règle doit
  continuer à servir directement les fichiers statiques du service worker, du
  manifest et des icônes.
- La feuille de style PrimeNG est chargée depuis un CDN. Elle ne doit pas être
  considérée comme une dépendance garantie pour un fonctionnement totalement
  hors ligne.

## Changements à réaliser

### 1. Unifier le manifest

Choisir `src/manifest.webmanifest` comme manifest de référence, car il est
explicitement inclus dans les assets Angular, puis supprimer ou exclure le
manifest concurrent de `public/manifest.webmanifest`.

Le manifest final doit au minimum contenir :

```json
{
  "name": "RugbyStats",
  "short_name": "RugbyStats",
  "description": "Collecte et suivi des statistiques de matchs de rugby",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#0056b3",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

Vérifier que les PNG sont réellement carrés, lisibles et adaptés au masque
des lanceurs Android. Conserver les SVG pour l’utilisation éventuelle dans
l’interface, mais ne pas les utiliser comme seuls pictogrammes d’installation.

### 2. Nettoyer la page HTML

Dans `src/index.html` :

- conserver une seule déclaration `<link rel="manifest" href="manifest.webmanifest">` ;
- conserver le `meta[name="theme-color"]` et le viewport ;
- corriger les caractères mal encodés dans le titre, la description et le
  message `noscript` si nécessaire ;
- ajouter des métadonnées Apple utiles (`apple-mobile-web-app-capable`,
  `apple-mobile-web-app-status-bar-style` et `apple-touch-icon`) si la cible
  iOS est retenue.

### 3. Vérifier l’intégration Angular du service worker

Conserver `provideServiceWorker('ngsw-worker.js', ...)` avec l’activation
conditionnée à la production. Vérifier après build que les fichiers suivants
existent dans `dist/GamesStats/browser` :

- `ngsw-worker.js` ;
- `ngsw.json` ;
- `manifest.webmanifest` ;
- `index.html` ;
- les icônes référencées par le manifest.

Revoir `ngsw-config.json` afin que le shell Angular, le manifest, les styles,
les scripts et les icônes soient mis en cache. Les données Firebase et les
réponses authentifiées ne doivent pas être mises en cache par le service
worker : elles restent gérées par les services Firebase et IndexedDB de
l’application.

Ajouter un mécanisme UX minimal de mise à jour : lorsqu’une nouvelle version
du service worker est disponible, informer l’utilisateur et lui proposer de
recharger l’application. Le rechargement ne doit pas interrompre une saisie
de match ou d’événement en cours.

### 4. Vérifier Firebase Hosting

Conserver le répertoire de publication `dist/GamesStats/browser` et la
réécriture SPA. Vérifier que les fichiers statiques sont servis avant la
réécriture vers `index.html`, notamment :

- `/manifest.webmanifest` avec le type MIME `application/manifest+json` ;
- `/ngsw-worker.js` avec un contenu non vide et sans réécriture HTML ;
- `/ngsw.json` ;
- les fichiers PNG d’icônes.

Déployer avec le build de production existant :

```bash
npm run build
firebase deploy --only hosting
```

Le déploiement doit être effectué en HTTPS sur le domaine final. Aucun
manifest ou service worker ne doit être servi depuis une URL HTTP ou depuis
un chemin différent de la racine configurée (`/`).

### 5. Prendre en compte l’offline-first existant

L’installation PWA ne remplace pas la synchronisation métier. Après
installation :

- l’interface et les ressources statiques doivent rester disponibles hors
  ligne après une première ouverture en ligne ;
- les écritures locales doivent continuer à passer par IndexedDB ;
- la file de synchronisation doit conserver ses opérations en attente ;
- le retour en ligne doit relancer la synchronisation sans perdre les données ;
- une session Firebase ne doit jamais être exposée par un cache partagé.

La dépendance CSS PrimeNG chargée depuis `unpkg.com` doit être embarquée dans
le build ou disposer d’une stratégie de repli si le support hors ligne de
l’interface est exigé dès le premier chargement.

## Critères d’acceptation

- [ ] Chrome/Edge propose l’installation sur desktop après visite du site.
- [ ] Android propose « Installer l’application » ou « Ajouter à l’écran
  d’accueil ».
- [ ] L’application installée s’ouvre en mode `standalone`, sans barre
  d’adresse visible dans le parcours normal.
- [ ] Le nom et l’icône affichés correspondent à RugbyStats.
- [ ] Lighthouse ne signale ni manifest invalide ni service worker absent.
- [ ] `/manifest.webmanifest` renvoie le bon contenu et le bon MIME type.
- [ ] Une navigation directe vers une route Angular fonctionne après
  installation et après rechargement.
- [ ] Après un premier chargement en ligne, le shell de l’application s’ouvre
  hors ligne.
- [ ] Un événement saisi hors ligne reste présent dans IndexedDB et est
  synchronisé au retour de la connexion.
- [ ] Une nouvelle version déployée est détectée et peut être appliquée sans
  suppression manuelle du service worker.
- [ ] La désinstallation puis la réinstallation récupère la dernière version
  du manifest et des assets.

## Plan de vérification

1. Exécuter `npm run build` et inspecter le contenu de
   `dist/GamesStats/browser`.
2. Servir le build de production via HTTPS ou Firebase Hosting de préproduction.
3. Dans DevTools > Application, contrôler le manifest, les icônes, le service
   worker et les caches.
4. Tester l’installation sur Chrome desktop et Chrome Android ; tester Safari
   iOS si iOS fait partie du périmètre.
5. Recharger en mode offline, naviguer dans les écrans principaux et créer un
   événement.
6. Republier une modification, vérifier la détection de mise à jour puis
   contrôler que les données locales et les opérations en attente sont
   conservées.

## Hors périmètre

- La création d’une application native Android/iOS.
- Le remplacement de Firebase Auth ou de Firestore par un backend offline.
- La mise en place de notifications push, qui nécessiterait une conception
  supplémentaire (permission, serveur d’envoi et gestion des tokens).
