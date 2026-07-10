# Mode Offline-First et Synchronisation

## Principes Offline-First

L'application est conçue selon l'architecture **offline-first**:

1. **Écriture locale d'abord:** Toute modification est d'abord enregistrée localement (IndexedDB)
2. **Sync asynchrone:** La synchronisation avec Firestore se fait en arrière-plan
3. **Queue locale:** Les opérations en attente sont stockées dans une queue
4. **Disponibilité garantie:** L'app fonctionne **complètement offline**

---

## Authentification & Synchronisation

### Modes d'Authentification

#### 🔵 Mode Local (Development/Testing)
- Authentification via IndexedDB local
- **Utilisateur:** Doit exister avant dans la base locale
- **Pré-requis:** S'être connecté préalablement sur le mobile/PC
- **Hash du mot de passe:** Stocké en local (sans librairie crypto)
- **Synchronisation:** ❌ Impossible (pas de Firebase)
- **Avantage:** 100% offline, pas de dépendance serveur

#### ☁️ Mode Cloud (Production)
- Authentification Firebase
- Email/Password ou Google Sign-In
- Synchronisation automatique vers Firestore
- Accessible partout (online required)

### Transition Local → Cloud (Réauthentification)

**Scénario:** Utilisateur authenticité localement, puis reconnecté à internet

```
Timeline:
─────────────────────────────────────────────────────
T0: Utilisateur créé 3 événements (offline, mode local)
    └─ IndexedDB: 3 opérations en queue "pending"

T1: Connexion internet établie (online)
    └─ App détecte changement + opérations pending

T2: SyncService lance sync automatique
    └─ Essai firebase.auth().currentUser → Null!
    └─ Conflit détecté: Auth locale ≠ Firebase

T3: Modal "Réauthentification requise"
    └─ Titre: "Synchroniser avec le cloud"
    └─ Message: "Entrez vos identifiants Firebase"
    └─ Champs: Email + Mot de passe Firebase

T4: Utilisateur saisit credentials
    └─ Vérification Firebase Auth
    └─ Si correct: Token généré

T5: SyncService relance sync
    └─ + Token Firebase
    └─ Firestore reçoit les 3 événements
    └─ Status opérations → "synced"
    └─ Utilisateur notifié: "3 événements synchronisés"
```

---

## Architecture Offline

```
┌─────────────────────────────────┐
│ User Interaction (EventForm)    │
├─────────────────────────────────┤
│ EventService.addEvent()         │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 1. DatabaseService.add()    │ │
│ │    └─ IndexedDB (immediate) │ │
│ ├─────────────────────────────┤ │
│ │ 2. QueueService.add()       │ │
│ │    └─ Queue (pending)       │ │
│ ├─────────────────────────────┤ │
│ │ 3. Observable.emit()        │ │
│ │    └─ UI update (immediate) │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [ASYNC] SyncService monitors    │
│ ┌─────────────────────────────┐ │
│ │ Si connecté + pending ops   │ │
│ │ → FirestoreService.sync()   │ │
│ │    └─ Firestore upload      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Temps de réponse:**
- Création événement: **< 100ms** (local)
- Sync vers cloud: **1-5s** (si connecté)

---

## État de Connexion

### Détection de la Connectivité

```typescript
// NetworkService.ts
export class NetworkService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  isOnline$ = this.isOnlineSubject.asObservable();

  constructor() {
    window.addEventListener('online', () => this.isOnlineSubject.next(true));
    window.addEventListener('offline', () => this.isOnlineSubject.next(false));
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}
```

### Indicateur UI

L'application affiche clairement l'état connecté/offline:

```
┌─────────────────────────────┐
│ 🟢 Online                   │ ◄─── Online (vert)
│ COXS 5 - 5 ADV              │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 🔴 Offline - 3 en attente   │ ◄─── Offline (rouge)
│ COXS 5 - 5 ADV              │
└─────────────────────────────┘
```

---

## Flux de Synchronisation

### Étape 1: Création Locale (Immédiat)

```typescript
// EventService
async addEvent(event: Partial<Evenement>) {
  // 1. Générer ID unique (Dexie auto-increment)
  const newEvent = {
    ...event,
    id: undefined, // Dexie génère
    createdAt: new Date().toISOString(),
    syncedAt: undefined
  };

  // 2. Ajouter à IndexedDB
  const dbEvent = await this.db.addEvent(newEvent);

  // 3. Créer opération queue
  const operation: SyncOperation = {
    id: uuid(),
    evenementId: dbEvent.id,
    matchId: event.matchId,
    operation: 'create',
    status: 'pending',
    data: dbEvent,
    createdAt: now(),
    updatedAt: now(),
    retryCount: 0
  };
  await this.queue.addOperation(operation);

  // 4. Émettre à l'UI
  this.eventSubject.next([...current, dbEvent]);

  return dbEvent;
}
```

**UI immédiate:**
- Événement apparaît dans la liste avec badge "⏳ Syncing..."
- Score recalculé instantanément
- Pas de spinner/loading

---

### Étape 2: Synchronisation en Arrière-Plan

```typescript
// SyncService
start() {
  // Monitor connectivité + queue
  combineLatest([
    this.network.isOnline$,
    this.queue.pendingOperations$
  ])
  .pipe(
    debounceTime(1000), // Attendre stabilisation réseau
    filter(([online, ops]) => online && ops.length > 0),
    switchMap(() => this.performSync())
  )
  .subscribe(result => this.handleSyncResult(result));
}

async performSync() {
  const ops = await this.queue.getPendingOperations();
  
  // Grouper par matchId (batching)
  const byMatch = groupBy(ops, 'matchId');
  
  for (const [matchId, matchOps] of Object.entries(byMatch)) {
    try {
      // Envoyer vers Firestore
      await this.firestore.syncOperations(matchOps);
      
      // Marquer comme synced
      for (const op of matchOps) {
        await this.queue.markAsSynced(op.id);
      }
    } catch (error) {
      // Gérer erreur/retry
      await this.handleSyncError(matchOps, error);
    }
  }
}
```

**Retry Logic:**

```typescript
// QueueService
async handleRetry(op: SyncOperation) {
  if (op.retryCount >= 5) {
    // Max retries atteint
    await this.markAsFailed(op.id, 'Max retries exceeded');
    this.notifyFailure(op);
    return;
  }

  // Exponential backoff
  const delays = [1000, 2000, 4000, 8000, 16000];
  const delay = delays[op.retryCount];
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Incrémenter retry count
  await this.incrementRetryCount(op.id);
  
  // Laisser SyncService reprendre
}
```

---

## Gestion des Conflits

### Détection de Conflit

Un conflit survient quand:
- **Même événement modifié** localement ET à distance
- **Versions différentes** (timestamps divergent)

```typescript
// FirestoreService
async updateEvent(event: Evenement) {
  try {
    // Récupérer version Firestore
    const remote = await this.firestore
      .collection('teams')
      .doc(event.teamId)
      .collection('matches')
      .doc(event.matchId)
      .collection('evenements')
      .doc(event.id)
      .get()
      .then(doc => doc.data() as Evenement);

    // Comparer timestamps
    if (remote?.updatedAt && remote.updatedAt > event.syncedAt) {
      // Conflit!
      throw new ConflictError(remote);
    }

    // Procéder avec update
    await this.updateRemote(event);
  } catch (error) {
    if (error instanceof ConflictError) {
      // Marquer comme conflict dans queue
      await this.queue.markAsConflict(op.id, error.remote);
    }
  }
}
```

### Résolution de Conflit

**Stratégie: Last-Write-Wins (par défaut)**

```
┌─────────────────────┐
│ Conflit Détecté     │
├─────────────────────┤
│ Local: ESS, MARQUE  │
│ Remote: ESS, RATE   │
│                     │
│ [Local wins] [Use Remote]
└─────────────────────┘
```

```typescript
// UI affiche notification
toastr.warning('Conflit sur cet événement. Votre version a été conservée.');

// L'utilisateur peut revenir et voir l'état
// Options:
// - Laisser local (last-write-wins)
// - Discarde local + récupérer remote

async resolveConflict(op: SyncOperation, userChoice: 'keep' | 'discard') {
  if (userChoice === 'keep') {
    // Forcer l'écriture locale
    await this.firestore.overwrite(op.data);
    await this.queue.markAsSynced(op.id);
  } else {
    // Discarder local, utiliser remote
    await this.database.updateEvent(op.remoteVersion);
    await this.queue.deleteOperation(op.id);
  }
}
```

---

## Scénarios Offline

### Scénario 1: Match en cours sans réseau

```
User: Créer événement
  ↓
Événement créé localement (instantané ✓)
  ↓
User: Quitter app (mode avion)
  ↓
Rouvrir app plus tard
  ↓
Événement toujours visible (depuis IndexedDB ✓)
Badge: "⏳ Syncing" (pending)
  ↓
Réseau restauré
  ↓
Auto-sync déclenché
Événement marqué "✓ Synced"
```

### Scénario 2: Conflit pendant offline

```
Device A: Modifier événement #1
  ↓
Queue local (pending)
  ↓
Mode avion (disconnected)
  ↓
Device B: Modifier même événement #1
  ↓
Sync remote réussi
  ↓
Device A: Réseau restauré
  ↓
Tentative sync local → Conflit détecté!
  ↓
Notification: "Conflit - cet événement a été modifié"
User choisit: Keep local OR Use remote
  ↓
Résolution appliquée
```

### Scénario 3: Sync partiel (erreur)

```
User: Créer 3 événements
  ↓
Tous créés localement (✓)
  ↓
Réseau: Sync commence
  ↓
Événement 1: ✓ Synced
Événement 2: ✗ Error (500)
Événement 3: ✓ Synced
  ↓
Événement 2: Retry avec exponential backoff
  ↓
Après 5 retries: Mark as FAILED
Notification: "Sync échoué pour 1 événement"
  ↓
User peut: Retry manuellement OU Discarder
```

---

## Optimisations de Sync

### 1. Batching par Match

Les opérations sont groupées par `matchId` avant envoi:

```typescript
// Au lieu d'envoyer 1 par 1:
await firestore.syncOperation(op1); // 1 requête
await firestore.syncOperation(op2); // 1 requête
await firestore.syncOperation(op3); // 1 requête
// Total: 3 requêtes

// On envoie par batch:
await firestore.syncOperations([op1, op2, op3]); // 1 requête batch
// Total: 1 requête
```

### 2. Debounce Sync

Si l'utilisateur crée plusieurs événements rapidement, on attend une pause avant sync:

```typescript
// Debounce 1 seconde = regrouper les syncs proches
eventCreatedSubject.pipe(
  debounceTime(1000)
).subscribe(() => {
  if (isOnline && hasPendingOps) {
    syncNow();
  }
});
```

### 3. Priority Queue

Les opérations critiques (delete) peuvent avoir priorité:

```typescript
const priority = {
  'delete': 3,    // Haute priorité
  'update': 2,    // Moyenne
  'create': 1     // Basse
};

queue.sort((a, b) => priority[b.operation] - priority[a.operation]);
```

---

## Service Worker & Caching

Le Service Worker (PWA) ccache:
- Assets statiques (HTML, CSS, JS, images)
- API responses (avec TTL)

```typescript
// ngsw-config.json
{
  "dataGroups": [
    {
      "name": "firestore-cache",
      "urls": ["/firestore/**"],
      "cacheConfig": {
        "strategy": "performance",
        "maxAge": "6h",
        "maxSize": 100
      }
    }
  ]
}
```

---

## Dexie & Persistance

IndexedDB persiste même si:
- ✅ App fermée
- ✅ Browser fermé
- ✅ Device redémarré
- ✅ Quota disponible (généralement 50MB+)

```typescript
// Check quota
const estimate = await navigator.storage.estimate();
const percentUsed = (estimate.usage / estimate.quota) * 100;
if (percentUsed > 90) {
  // Alerter utilisateur
  console.warn(`${percentUsed}% IndexedDB utilisé`);
}
```

---

## Tests Offline

### Mode Avion (DevTools)

```
1. Ouvrir DevTools (F12)
2. Network tab → Throttling → "Offline"
3. Ou: Appareils → Mode avion
4. Vérifier comportement app
```

### Slow Network

```
DevTools → Network → Throttle à "Slow 3G"
→ Vérifier retry logic + timeouts
```

### Mock SyncService Error

```typescript
// Dans test ou environment
export class MockSyncService extends SyncService {
  async performSync() {
    throw new Error('Simulated network error');
  }
}
```

---

## Authentification Locale: Implémentation

### Hash du Mot de Passe (Sans Crypto Lib)

**Approche:** Hachage simple avec `TextEncoder` + `SubtleCrypto` natif (navigateur)

```typescript
// AuthLocalService - Hashing natif
async hashPassword(password: string): Promise<string> {
  // Utiliser Web Crypto API native (disponible dans tous les navigateurs modernes)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convertir en hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

async verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const hash = await this.hashPassword(password);
  return hash === storedHash;
}
```

### Stockage des Utilisateurs (IndexedDB)

```typescript
// Schéma Dexie pour utilisateurs locaux
interface LocalUser {
  id: string;                // Email
  prenom: string;
  nom: string;
  passwordHash: string;      // SHA-256 hex
  createdAt: string;
  lastLoginAt: string;
}

// Table IndexedDB
db.version(1).stores({
  local_users: '++id'
});
```

### Login Local vs Firebase

```typescript
// AuthService - Dual mode
async login(email: string, password: string, mode: 'local' | 'firebase'): Promise<any> {
  if (mode === 'local') {
    // Mode Local: Vérifier IndexedDB
    const user = await this.db.local_users.get(email);
    if (!user) throw new Error('Utilisateur non trouvé');
    
    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) throw new Error('Mot de passe incorrect');
    
    // Marquer comme auth locale
    localStorage.setItem('auth_mode', 'local');
    localStorage.setItem('current_user', email);
    
    return { user, token: null }; // Pas de token Firebase
  } else {
    // Mode Firebase: Firebase Auth SDK
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('auth_mode', 'firebase');
    localStorage.setItem('auth_token', await userCredential.user.getIdToken());
    
    return { user: userCredential.user };
  }
}
```

### Réauthentification pour Sync

Quand utilisateur passe de local → online:

```typescript
// SyncService - Réauth check
async startSync() {
  const currentUser = this.auth.getCurrentUser();
  const authMode = localStorage.getItem('auth_mode');
  
  if (authMode === 'local' && !currentUser) {
    // Utilisateur local but no Firebase session
    // Demander réauth
    await this.promptReauthentication();
  }
  
  // Puis faire sync normal
  await this.performSync();
}

private async promptReauthentication(): Promise<void> {
  // Ouvrir modal de réauth
  const result = await this.showReauthModal();
  
  if (!result) return; // User cancelled
  
  try {
    // Vérifier avec Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      result.email,
      result.password
    );
    
    // Sauver token Firebase
    const token = await userCredential.user.getIdToken();
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_mode', 'firebase');
    
    // Sync peut procéder maintenant
  } catch (error) {
    throw new Error('Réauthentification échouée: ' + error.message);
  }
}

private async showReauthModal(): Promise<{email: string, password: string} | null> {
  return new Promise((resolve) => {
    // Afficher p-dialog
    // User entre email + password Firebase
    // OK → resolve
    // Cancel → resolve(null)
  });
}
```

### Pré-requis pour Mode Local

Pour utiliser l'app en mode local, l'utilisateur doit d'abord:

1. **Être créé dans la base locale**
   ```typescript
   // Avant première utilisation
   const hash = await authLocalService.hashPassword('password123');
   await db.local_users.add({
     id: 'john@example.com',
     prenom: 'John',
     nom: 'Doe',
     passwordHash: hash,
     createdAt: now(),
     lastLoginAt: now()
   });
   ```

2. **S'être connecté préalablement**
   - Il doit avoir lancé l'app une première fois
   - L'app stocke ses données locales (équipes, matchs, etc)
   - Puis peut travailler complètement offline

3. **Sauvegarder localement d'abord** (optionnel)
   ```typescript
   // Mode "démo" - charger données de test
   await db.equipes.add({
     nom: 'COXS',
     saison: '2024/2025',
     ...
   });
   ```

### Limitation: Pas de Sync Sans Réauth

**Mode local = Offline-only**

```
Local Mode:
├─ ✅ Créer événements
├─ ✅ Modifier équipes
├─ ✅ Voir matchs
└─ ❌ Synchroniser Firestore (impossible)

Après Réauth Firebase:
├─ ✅ Créer événements
├─ ✅ Modifier équipes
├─ ✅ Voir matchs
└─ ✅ ✅ Synchroniser Firestore
```

---

## Monitoring Sync

L'app expose un dashboard interne de sync (debug):

```
┌──────────────────────────┐
│ SYNC DEBUG               │
├──────────────────────────┤
│ Status: Online ✓         │
│ Last sync: 2 min ago     │
│ Pending ops: 0           │
│ Failed ops: 0            │
│ Conflicts: 0             │
│                          │
│ [Sync Now] [Clear Queue] │
│ [Export DB] [Import DB]  │
└──────────────────────────┘
```

---

## Conclusion

**L'application garantit:**
- ✅ **Disponibilité:** Fonctionne offline
- ✅ **Durabilité:** Données persistées
- ✅ **Cohérence:** Sync automatique avec retry
- ✅ **Intégrité:** Conflit resolution
- ✅ **Performance:** Sync asynchrone non-bloquant

---

**Dernier update:** 10 juillet 2026
