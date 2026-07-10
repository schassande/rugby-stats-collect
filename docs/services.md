# Services de l'Application

## Couche Core Services (partagés)

### 1. AuthService

**Responsabilité:** Gestion de l'authentification Firebase

**Localisation:** `src/app/core/services/auth.service.ts`

**Interface publique:**
```typescript
export class AuthService {
  // Authentification
  signUpWithEmail(email: string, password: string, prenom: string, nom: string): Promise<void>
  signInWithEmail(email: string, password: string): Promise<void>
  signInWithGoogle(): Promise<void>
  signOut(): Promise<void>
  
  // Observables d'état
  currentUser$: Observable<User | null>
  isAuthenticated$: Observable<boolean>
  
  // Getters
  getCurrentUser(): User | null
  getIdToken(): Promise<string>
}
```

**Détails d'implémentation:**
- Déléguer à Firebase Auth SDK
- Créer document `Manager` en Firestore lors première connexion
- Émettre `currentUser$` Observable
- Gérer les erreurs (email existant, mot de passe faible, etc.)

---

### 2. DatabaseService

**Responsabilité:** CRUD local via Dexie.js

**Localisation:** `src/app/core/services/database.service.ts`

**Interface publique:**
```typescript
export class DatabaseService {
  // Events
  addEvent(matchId: number, event: Evenement): Promise<Evenement>
  updateEvent(event: Evenement): Promise<void>
  deleteEvent(eventId: number): Promise<void>
  getEventsByMatch(matchId: number): Promise<Evenement[]>
  getEvent(eventId: number): Promise<Evenement | undefined>
  
  // Matches
  addMatch(match: Match): Promise<Match>
  updateMatch(match: Match): Promise<void>
  deleteMatch(matchId: number): Promise<void>
  getMatchesByTeam(teamId: number): Promise<Match[]>
  getMatch(matchId: number): Promise<Match | undefined>
  
  // Teams
  addTeam(team: Equipe): Promise<Equipe>
  updateTeam(team: Equipe): Promise<void>
  deleteTeam(teamId: number): Promise<void>
  getTeamsByManager(managerId: string): Promise<Equipe[]>
  getTeam(teamId: number): Promise<Equipe | undefined>
  
  // Managers
  addManager(manager: Manager): Promise<Manager>
  getManager(managerId: string): Promise<Manager | undefined>
  
  // Sync metadata
  getSyncMetadata(matchId: number): Promise<SyncMetadata | undefined>
  setSyncMetadata(metadata: SyncMetadata): Promise<void>
  
  // Bulk operations
  clearDatabase(): Promise<void>
  exportDatabase(): Promise<any>
  importDatabase(data: any): Promise<void>
}
```

**Détails d'implémentation:**
- Utiliser Dexie avec schéma indexé
- Transactions pour opérations multiples
- Gestion d'erreurs (DB full, corruption)

---

### 3. QueueService

**Responsabilité:** Gestion de la file d'opérations offline-first

**Localisation:** `src/app/core/services/queue.service.ts`

**Interface publique:**
```typescript
export class QueueService {
  // Opérations sur queue
  addOperation(op: SyncOperation): Promise<void>
  getOperationsByMatch(matchId: number): Promise<SyncOperation[]>
  getPendingOperations(): Promise<SyncOperation[]>
  getConflictedOperations(): Promise<SyncOperation[]>
  
  // Mise à jour statut
  markAsSyncing(opId: string): Promise<void>
  markAsSynced(opId: string, syncedAt: string): Promise<void>
  markAsConflict(opId: string, remoteVersion: Evenement): Promise<void>
  markAsFailed(opId: string, error: string): Promise<void>
  
  // Retry
  canRetry(op: SyncOperation): boolean
  incrementRetryCount(opId: string): Promise<void>
  
  // Observables
  pendingOperations$: Observable<SyncOperation[]>
  conflictedOperations$: Observable<SyncOperation[]>
  syncStatus$: Observable<{ pending: number, synced: number, conflict: number }>
  
  // Bulk
  clearQueue(): Promise<void>
  deleteOperation(opId: string): Promise<void>
}
```

**Logique de statuts:**
- `pending`: En attente de sync
- `syncing`: Actuellement en cours d'envoi
- `synced`: Succès
- `conflict`: Conflit détecté (remote ≠ local)
- `failed`: Erreur après max retries

**Retry logic:**
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Max retries: 5
- Après max: Mark as `failed`

---

### 4. SyncService

**Responsabilité:** Orchestration de la synchronisation

**Localisation:** `src/app/core/services/sync.service.ts`

**Interface publique:**
```typescript
export class SyncService {
  // Contrôle
  start(): void
  stop(): void
  syncNow(): Promise<void>
  
  // État
  isOnline$: Observable<boolean>
  isSyncing$: Observable<boolean>
  lastSyncTime$: Observable<Date | null>
  
  // Getters
  isOnline(): boolean
  isSyncing(): boolean
  getLastSyncTime(): Date | null
  
  // Events
  syncCompleted$: Observable<{ success: number, failed: number, conflicts: number }>
  syncError$: Observable<Error>
}
```

**Logique:**
1. Monitor connectivité réseau
2. Si online ET operations pending:
   - Batch par `matchId`
   - Appeler `FirestoreService.sync()`
3. Gérer succès/erreur/conflict
4. Auto-retry avec QueueService

---

### 5. FirestoreService

**Responsabilité:** API vers Firestore

**Localisation:** `src/app/core/services/firestore.service.ts`

**Interface publique:**
```typescript
export class FirestoreService {
  // Write operations
  createEvent(matchId: number, event: Evenement): Promise<void>
  updateEvent(matchId: number, event: Evenement): Promise<void>
  deleteEvent(matchId: number, eventId: number): Promise<void>
  
  createMatch(teamId: number, match: Match): Promise<void>
  updateMatch(teamId: number, match: Match): Promise<void>
  deleteMatch(teamId: number, matchId: number): Promise<void>
  
  createTeam(team: Equipe): Promise<void>
  updateTeam(team: Equipe): Promise<void>
  deleteTeam(teamId: number): Promise<void>
  
  // Read operations
  getEvent(matchId: number, eventId: number): Promise<Evenement | null>
  getMatch(teamId: number, matchId: number): Promise<Match | null>
  getTeam(teamId: number): Promise<Equipe | null>
  getTeamsByManager(managerId: string): Promise<Equipe[]>
  
  // Batch/Sync
  syncOperations(ops: SyncOperation[]): Promise<SyncResult>
  
  // Listeners
  onEventsChanged(matchId: number, callback: (events: Evenement[]) => void): () => void
  onTeamsChanged(managerId: string, callback: (teams: Equipe[]) => void): () => void
}
```

**Gestion des erreurs:**
- Permission denied: 403
- Not found: 404
- Network error: Retry
- Conflict: Compare timestamps

---

## Services Métier

### 6. EventService

**Responsabilité:** Logique métier des événements (orchestration)

**Localisation:** `src/app/features/events/services/event.service.ts`

**Interface publique:**
```typescript
export class EventService {
  // CRUD
  addEvent(matchId: number, event: Partial<Evenement>): Promise<Evenement>
  updateEvent(matchId: number, event: Evenement): Promise<void>
  deleteEvent(matchId: number, eventId: number): Promise<void>
  
  // Observables
  getEventsByMatch(matchId: number): Observable<Evenement[]>
  getEventsByMatchAntiChronological(matchId: number): Observable<Evenement[]>
  getEvent(eventId: number): Observable<Evenement | undefined>
  
  // Filtrage
  filterEvents(matchId: number, filters: EventFilters): Observable<Evenement[]>
  
  // Validation métier
  validateEventData(event: Partial<Evenement>): { valid: boolean, errors: string[] }
  getValidResultsForType(type: TypeEvenement): ResultatEvenement[]
  
  // Calculs
  calculateScore(matchId: number): Promise<{ nous: number, adversaire: number }>
}

interface EventFilters {
  periode?: Periode
  equipe?: EquipeCode
  nature?: NatureEvenement
  type?: TypeEvenement
}
```

**Logique:**
1. Valider données métier (résultats autorisés par type)
2. Ajouter à DatabaseService + QueueService
3. Émettre Observable
4. Auto-sync via SyncService

---

### 7. MatchService

**Responsabilité:** Logique métier des matchs

**Localisation:** `src/app/features/matches/services/match.service.ts`

**Interface publique:**
```typescript
export class MatchService {
  // CRUD
  addMatch(teamId: number, match: Partial<Match>): Promise<Match>
  updateMatch(teamId: number, match: Match): Promise<void>
  deleteMatch(teamId: number, matchId: number): Promise<void>
  
  // Observables
  getMatchesByTeam(teamId: number): Observable<Match[]>
  getMatch(matchId: number): Observable<Match | undefined>
  
  // Calculs
  calculateScore(matchId: number): Observable<{ nous: number, adversaire: number }>
  getMatchDuration(matchId: number): Observable<{ minutes: number, seconds: number }>
  getMatchStatus(matchId: number): Observable<'scheduled' | 'in_progress' | 'completed'>
  
  // Métier
  startMatch(matchId: number): Promise<void>
  endMatch(matchId: number): Promise<void>
}
```

---

### 8. TeamService

**Responsabilité:** Logique métier des équipes

**Localisation:** `src/app/features/teams/services/team.service.ts`

**Interface publique:**
```typescript
export class TeamService {
  // CRUD
  addTeam(team: Partial<Equipe>): Promise<Equipe>
  updateTeam(team: Equipe): Promise<void>
  deleteTeam(teamId: number): Promise<void>
  
  // Observables
  getTeamsByCurrentManager(): Observable<Equipe[]>
  getTeam(teamId: number): Observable<Equipe | undefined>
  
  // Managers
  addManagerToTeam(teamId: number, managerId: string): Promise<void>
  removeManagerFromTeam(teamId: number, managerId: string): Promise<void>
}
```

---

## Services Utilitaires

### 9. NavigationService

**Responsabilité:** Gestion de la navigation

**Localisation:** `src/app/core/services/navigation.service.ts`

**Interface publique:**
```typescript
export class NavigationService {
  goToTeams(): void
  goToTeamDetail(teamId: number): void
  goToTeamForm(teamId?: number): void
  
  goToMatchDetail(matchId: number): void
  goToMatchForm(teamId: number, matchId?: number): void
  
  goToEventForm(matchId: number, eventId?: number): void
  
  goToSettings(): void
  goToAbout(): void
  
  back(): void
  forward(): void
}
```

---

### 10. NetworkService (optionnel)

**Responsabilité:** Monitor connectivité réseau

**Localisation:** `src/app/core/services/network.service.ts`

**Interface publique:**
```typescript
export class NetworkService {
  isOnline$: Observable<boolean>
  
  isOnline(): boolean
  waitForConnection(): Promise<void>
}
```

---

## Résumé des Dépendances

```
EventFormComponent
    ↓
  EventService
    ↓
  ├─ DatabaseService
  ├─ QueueService
  └─ FirestoreService (async)
       ↓
    SyncService

MatchDetailComponent
    ↓
  ├─ MatchService
  ├─ EventService
  └─ SyncService (observer queue status)

TeamListComponent
    ↓
  TeamService
    ↓
  DatabaseService

AppLayoutComponent
    ↓
  ├─ AuthService (check logged in)
  └─ SyncService (show sync status)
```

---

**Dernier update:** 10 juillet 2026
