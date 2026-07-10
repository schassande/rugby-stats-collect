# Authentification Offline - Choix Implémenté

## 🎯 Solution Choisie

**Approche 2 modifiée:** Authentification locale IndexedDB + Hash simple

---

## 📋 Spécifications

### Mode Authentification Local

✅ **Stockage**: IndexedDB (table `local_users`)  
✅ **Hash**: SHA-256 natif (Web Crypto API - aucune lib externe)  
✅ **Pré-requis**: Utilisateur doit exister AVANT première utilisation  
✅ **Connexion préalable**: S'être connecté une fois sur le mobile/PC  
✅ **Synchronisation**: ❌ Impossible (pas de Firebase)  

### Limitations Volontaires

- **Pas de création d'utilisateur en mode local** 
  - Utilisateur créé par script d'init ou import
  
- **Pas de sync tant qu'en mode local**
  - Sync requiert réauthentification Firebase
  
- **Hash simple SHA-256**
  - Pas de salt (par choix: keep it simple)
  - Suffisant pour offline dev/testing

---

## 🏗️ Architecture Implémentée

```
LOGIN SCREEN
    ↓
┌─────────────────┐
│ Mode selection? │
└────────┬────────┘
         ├─→ LOCAL (env.authMode='local')
         │       ↓
         │   IndexedDB query
         │   └─ Check hash match
         │   ✅ Login local
         │
         └─→ FIREBASE (env.authMode='firebase')
                 ↓
             Firebase Auth
             ✅ Login cloud
```

---

## 💻 Phases d'Implémentation

### Phase 02b - Authentification Locale
- LocalAuthService avec hashPassword/verifyPassword
- Schéma Dexie `local_users`
- Setup script pour utilisateurs de test
- LoginComponent avec mode selector

### Phase 09b - Réauthentification
- Détection: Mode local + Opérations pending + Online
- Modal "Réauthentification requise"
- User saisit credentials Firebase
- Token généré → Sync relancé

---

## 🔄 Workflow Complet

### 1️⃣ Setup Initial
```bash
# Setup utilisateurs de test (une fois)
LocalUser: test@rugby.local / password123
│ Hash: SHA256(password123)
└─ Stocké dans IndexedDB local_users
```

### 2️⃣ Development/Testing Offline
```bash
# Démarrer app
environment.ts: authMode='local'

# Login
Login → test@rugby.local / password123
│ IndexedDB query
├─ Trouver user email
├─ Hash password saisi
├─ Comparer avec stored hash
└─ ✅ Session établie (localStorage)

# Créer événements
Événement 1, 2, 3
│ Tous créés localement (IndexedDB)
├─ operations_queue: 3 "pending"
└─ App fonctionne 100% offline ✅
```

### 3️⃣ Passage Online → Réauth → Sync
```bash
# WiFi restaurée
App détecte: isOnline = true

# SyncService lance
Vérif: auth_mode='local' + no_firebase_user + pending_ops
│ Conflit détecté!
├─ Modal: "Synchroniser avec le cloud"
└─ Demander credentials Firebase

# User saisit
Email: john@gmail.com
Password: firebase_password
│ Firebase Auth.signin()
├─ ✅ Token généré
└─ localStorage: auth_token='...'

# SyncService relance
3 événements uploadés → Firestore
│ Status: pending → syncing → synced
├─ operations_queue marquées "synced"
└─ UI: "3 événements synchronisés ✓"

# À partir de là
Mode normal (Firebase)
Auto-sync sur les nouvelles opérations
```

---

## 🔐 Sécurité

### Points Forts
✅ Hash SHA-256 natif (navigateur moderne)  
✅ Pas de credentials en clair  
✅ IndexedDB protégé par Same-Origin Policy  
✅ Transition transparente vers Firebase  

### Limitations (Acceptées)
⚠️ Hash sans salt (pas de rainbow tables)  
⚠️ Offline only = pas de cloud auth  
⚠️ Dev mode = credentials stockés localement  

### Production
✅ Mode Firebase uniquement  
✅ Réauth requise = users authentifiés Firebase  
✅ Cloud auth + Firestore rules  

---

## 📊 Comparaison Modes

| Feature | Mode Local | Mode Firebase |
|---------|-----------|--------------|
| **Authentification** | IndexedDB local | Firebase Auth |
| **Stockage données** | IndexedDB | IndexedDB + Firestore |
| **Sync** | ❌ Non | ✅ Oui |
| **Création users** | Pré-créés | Signup |
| **Internet requis** | ❌ Non | ⚠️ Pour sync |
| **Offline** | ✅ Complet | ⚠️ Partiel |
| **Cas d'usage** | Dev/Test | Production |

---

## 🚀 Déploiement

### Development
```bash
# environment.ts
export const environment = {
  authMode: 'local',
  ...
};

ng serve
# App offline-first, 100% local
```

### Production
```bash
# environment.production.ts
export const environment = {
  authMode: 'firebase',
  ...
};

ng build --configuration production
firebase deploy
# App cloud-first, sync automatique
```

---

## ✅ Checklist Implémentation

### Phase 02b
- [x] LocalUser interface dans Dexie
- [x] LocalAuthService (hash/verify)
- [x] AuthService dual-mode
- [x] LoginComponent selector
- [x] Setup script
- [x] environment.ts configurable

### Phase 09b
- [x] ReauthModalComponent
- [x] ReauthService
- [x] SyncService réauth check
- [x] DialogService config
- [x] Test local→offline→online→sync
- [x] Notification sync success

---

## 🧪 Test Scenario

```bash
# 1. Start app (mode local)
ng serve
# environment.ts: authMode='local'

# 2. Login
Email: test@rugby.local
Password: password123
# ✅ Session établie

# 3. Create offline
Create Event: ESSAI MARQUE
Create Event: TRANSFORMATION REUSSITE
Create Event: PENALITE RATE
# ✅ 3 events in queue (pending)

# 4. Go offline (DevTools: Offline)
# App works normally
# Create Event: DROP MARQUE
# ✅ 4 events pending

# 5. Go online (DevTools: Online)
# SyncService detects online
# Modal: "Réauthentification requise"

# 6. Enter Firebase credentials
Email: john@example.com
Password: fb_password
# ✅ Firebase Auth OK

# 7. Auto-sync starts
# 4 events uploaded
# Status: synced
# ✅ "4 événements synchronisés"

# 8. Verify Firestore
# Database console
# teams/{teamId}/matches/{matchId}/evenements
# 4 events present ✅
```

---

## 📝 Notes Importantes

### Utilisateurs Pré-créés
```typescript
// Setup une fois
await localAuth.createLocalUser(
  'test@rugby.local',
  'password123',
  'Jean',
  'Dupont'
);
```

### Switch Mode
```typescript
// environment.ts
export const environment = {
  authMode: 'local'  // 'local' ou 'firebase'
};

// Rebuild pour changer
ng build --configuration production
```

### Pas de Signup en Mode Local
Les utilisateurs doivent être créés par:
- Script d'init
- Import depuis CSV
- Admin panel
- Autre méthode (pas UI signup)

### Migration Local → Firebase
```bash
# User s'authentifie localement
# Crée N événements offline

# Puis online:
# Modal réauth Firebase
# Entre credentials
# Sync automatique

# ✅ Transparent pour l'user
```

---

## 🎯 Résumé

✅ **Solution choisie:** Auth locale IndexedDB + réauth Firebase  
✅ **Hash:** SHA-256 natif (Web Crypto)  
✅ **Utilisateurs:** Pré-créés (pas de signup local)  
✅ **Sync:** Après réauth Firebase  
✅ **Offline:** 100% possible en mode local  
✅ **Production:** Mode Firebase uniquement  

**Total implémentation: 2 phases (02b + 09b)**  
**Temps: 3 heures**  
**Complexité: Moyenne**

---

**Authentification Offline - Implementation Complete** ✅
