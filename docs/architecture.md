# Architecture de l'application Rugby Stats Collector

## Vue d'ensemble

Application de collecte d'événements de match de rugby avec synchronisation offline-first vers Firestore.

```
┌─────────────────────────────────────────┐
│   Angular PWA - App Interface           │
│   (installable, offline-capable)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Service Layer                         │
│   - AuthService (Firebase)              │
│   - EventService (métier)               │
│   - MatchService (métier)               │
│   - TeamService (métier)                │
│   - SyncService (orchestration)         │
│   - QueueService (queue locale)         │
│   - DatabaseService (Dexie CRUD)        │
│   - FirestoreService (API Firestore)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Data Layer                            │
│   ┌─────────────┐      ┌─────────────┐ │
│   │ IndexedDB   │      │  Firestore  │ │
│   │ (Dexie.js)  │◄────►│   (Cloud)   │ │
│   └─────────────┘      └─────────────┘ │
│   - events                              │
│   - operations_queue                    │
│   - matches, teams, managers            │
│   - sync_metadata                       │
└─────────────────────────────────────────┘
```

## Stack Technologique

| Composant | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | Angular | 18+ |
| **UI Components** | PrimeNG | 18 |
| **Local DB** | Dexie.js | 4+ |
| **Backend** | Firestore | Cloud Firestore |
| **Auth** | Firebase Auth (Cloud) / Local IndexedDB | 10+ |
| **PWA** | Service Worker | Native |
| **Forms** | Reactive Forms | Angular 18 |
| **State** | RxJS Observables | 7+ |
| **Build** | Angular CLI | 18 |
| **Styling** | SCSS | Dart Sass |

## Structure des Dossiers

```
GamesStats/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── database.service.ts
│   │   │   │   ├── firestore.service.ts
│   │   │   │   ├── sync.service.ts
│   │   │   │   ├── queue.service.ts
│   │   │   │   └── navigation.service.ts
│   │   │   ├── models/
│   │   │   │   ├── datamodel.ts
│   │   │   │   └── index.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   └── interceptors/
│   │   │       └── error.interceptor.ts (optionnel)
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── signup/
│   │   │   │   ├── services/
│   │   │   │   │   └── auth.service.ts (delegating)
│   │   │   │   └── auth-routing.module.ts
│   │   │   │
│   │   │   ├── teams/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── team-list/
│   │   │   │   │   ├── team-form/
│   │   │   │   │   └── team-detail/
│   │   │   │   ├── services/
│   │   │   │   │   └── team.service.ts
│   │   │   │   └── team-routing.module.ts
│   │   │   │
│   │   │   ├── matches/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── match-form/
│   │   │   │   │   ├── match-detail/
│   │   │   │   │   └── match-stats/
│   │   │   │   ├── components/
│   │   │   │   │   ├── event-list/
│   │   │   │   │   └── event-item/
│   │   │   │   ├── services/
│   │   │   │   │   └── match.service.ts
│   │   │   │   └── match-routing.module.ts
│   │   │   │
│   │   │   ├── events/
│   │   │   │   ├── pages/
│   │   │   │   │   └── event-form/
│   │   │   │   ├── services/
│   │   │   │   │   └── event.service.ts
│   │   │   │   └── event-routing.module.ts
│   │   │   │
│   │   │   └── menu/
│   │   │       ├── pages/
│   │   │       │   ├── more-menu/
│   │   │       │   └── settings/
│   │   │       └── menu-routing.module.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── app-layout.component.ts
│   │   │   ├── app-layout.component.html
│   │   │   └── app-layout.component.scss
│   │   │
│   │   ├── app.routes.ts
│   │   ├── app.config.ts
│   │   └── app.component.ts
│   │
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── styles.scss
│   │   │   ├── rugby-theme.scss
│   │   │   └── variables.scss
│   │   ├── icons/
│   │   │   ├── icon-192x192.png
│   │   │   ├── icon-512x512.png
│   │   │   └── ...
│   │   └── manifest.webmanifest
│   │
│   ├── public/
│   │   ├── manifest.webmanifest
│   │   └── service-worker.js
│   │
│   ├── main.ts
│   ├── index.html
│   └── styles.scss
│
├── docs/
│   ├── architecture.md (ce fichier)
│   ├── workflows.md
│   ├── ecrans.md
│   ├── services.md
│   ├── datamodel.md
│   ├── offline.md
│   └── changes/
│       ├── 00.overview.md
│       ├── 01.angular_setup.md
│       ├── 02.firebase_auth.md
│       ├── 03.pwa_config.md
│       ├── 04.dexie_database.md
│       ├── 05.layout_navigation.md
│       ├── 06.teams_feature.md
│       ├── 07.matches_feature.md
│       ├── 08.events_feature.md
│       ├── 09.queue_sync.md
│       └── 10.testing_deployment.md
│
├── angular.json
├── tsconfig.json
├── package.json
└── README.md
```

## Patterns Utilisés

### 1. Standalone Components (Angular 18)
Tous les composants sont standalone, important les modules nécessaires.

```typescript
@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [DialogModule, ReactiveFormsModule, ButtonModule, ...]
})
```

### 2. Reactive Forms (FormGroup)
Validation client stricte avec TypeScript et Reactive Forms.

```typescript
this.form = this.fb.group({
  nature: ['SCORE', Validators.required],
  type: ['', Validators.required],
  resultat: ['', Validators.required]
});
```

### 3. RxJS Observables
Communication entre services et composants via Observables.

```typescript
export class EventService {
  private eventSubject = new BehaviorSubject<Evenement[]>([]);
  evenements$ = this.eventSubject.asObservable();
  
  addEvenement(event: Evenement) {
    // Add to DB and emit
    this.eventSubject.next([...current, event]);
  }
}
```

### 4. Offline-first Architecture
1. **Écriture locale d'abord** → IndexedDB + Queue
2. **Sync asynchrone** → Firestore quand connecté
3. **Conflict resolution** → Last-write-wins

### 5. Feature Modules avec Routing
Chaque feature (teams, matches, events) est un module lazy-loaded.

```typescript
const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'teams', loadChildren: () => import('./teams/team.routes').then(m => m.TEAM_ROUTES) },
      { path: 'matches/:matchId', loadChildren: () => import('./matches/match.routes').then(m => m.MATCH_ROUTES) }
    ]
  }
];
```

## Flux de Données

### Création d'un Événement
```
User Input (EventFormComponent)
    ↓
EventService.addEvenement()
    ↓
DatabaseService.addEvenement() → IndexedDB (local)
    ↓
QueueService.addOperation() → Queue (pending)
    ↓
Observable émet le changement → UI mise à jour
    ↓
[Si connecté] SyncService détecte et envoie vers Firestore
    ↓
QueueService.updateStatus() → synced
```

### Synchronisation
```
SyncService (monitor connectivité)
    ↓
Si connecté ET opérations pending:
    ↓
QueueService.getPendingOperations()
    ↓
FirestoreService.syncOperations()
    ↓
Conflit? → QueueService.markAsConflict() + Notification
Succès? → QueueService.markAsSynced()
Erreur? → Retry avec exponential backoff (max 5)
```

## Sécurité

### Authentification

#### Mode Production (Cloud)
- Firebase Authentication
  - Email/Password
  - Google Sign-In (OAuth)
  - Session management via Firebase SDK

#### Mode Offline-Local (Development/Testing)
- Authentification IndexedDB locale
  - Stockage d'utilisateurs en local
  - Hash du mot de passe (simple, pas de crypto lib)
  - **Prérequis:** Utilisateur créé avant + connexion préalable
  - **Utilisation:** Tests offline, démo, développement

### Synchronisation Cloud

**Réauthentification requise:**
- Si utilisateur authenticié **localement uniquement** (pas de Firebase)
- Lors de la première synchronisation (reconnexion)
- L'app demande les credentials Firebase pour vérifier l'identité
- Après vérification: Sync des données IndexedDB vers Firestore

**Flow:**
1. Utilisateur connecté en mode local
2. App passe online → Détecte sync nécessaire
3. Modal: "Réauthentification requise"
4. Utilisateur entre credentials Firebase
5. Vérification + Sync automatique

### Firestore Security Rules
- Basées sur `managerIds` (propriétaires d'équipe)
- Accès match/événement seulement si manager d'équipe
- Applicable uniquement en mode cloud (Firebase Auth)

### Validation Données
- **Client:** TypeScript strict, Reactive Forms validation
- **Server:** Firestore rules + Cloud Functions (optionnel)

## Performance

### PWA & Caching
- Service Worker caching: assets statiques + API responses
- IndexedDB: cache applicatif avec expirations
- Virtual scroll pour listes > 100 items

### Dexie Indexing
```
events: '++id, matchId, instant, createdAt'
operations: '++id, evenementId, matchId, status, createdAt'
```

### Bundle Optimization
- Lazy loading des features
- Tree-shaking des imports
- PrimeNG lazy imports

## Déploiement

### Environments
- `environment.development.ts`: Firebase dev project
- `environment.production.ts`: Firebase production project

### Build & Deploy
```bash
ng build --configuration production
firebase deploy
```

---

**Dernière mise à jour:** 10 juillet 2026
