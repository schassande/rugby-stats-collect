# Workflows de l'Application

## Workflow Global

```mermaid
graph TB
    Start([Utilisateur]) -->|Première visite| Login[Écran Login]
    Login -->|Email/Password| Auth{Authentification}
    Login -->|Google Sign-In| Auth
    Auth -->|Succès| Teams[Écran Teams - Liste]
    Auth -->|Échec| Error[Message erreur]
    Error --> Login
    
    Teams -->|Créer| TeamForm[Écran Créer Équipe]
    Teams -->|Consulter| TeamDetail[Écran Détail Équipe]
    TeamForm -->|Valider| Teams
    
    TeamDetail -->|Consulter| MatchList[Liste des Matchs]
    TeamDetail -->|Créer| MatchForm[Écran Créer Match]
    MatchForm -->|Valider| TeamDetail
    
    MatchList -->|Consulter| MatchDetail[Écran Match - Score + Events]
    MatchDetail -->|Créer| EventForm[Écran Créer Événement]
    EventForm -->|Valider| MatchDetail
    EventForm -->|Modifier| MatchDetail
    
    MatchDetail -->|Quitter| Teams
    
    Teams -->|Menu Plus| Settings[Paramètres]
    Settings -->|Logout| Login
```

## 1. Workflow Authentication

```mermaid
graph LR
    A[Login/Signup Screen] -->|Email + Password| B[Firebase Auth]
    A -->|Google Button| C[Firebase OAuth]
    B -->|Success| D[Create Manager Doc]
    C -->|Success| D
    D -->|Auto Login| E[Redirect Teams]
    B -->|Error| F[Show Error Toast]
    C -->|Error| F
    F --> A
    
    E -->|Set Auth Guard| G[Access Protected Routes]
```

**Flux détaillé:**
1. Utilisateur arrive → Redirection vers `/auth/login`
2. Saisit email/password OU clique Google Sign-In
3. Firebase Auth vérifie les credentials
4. Si première connexion: Créer document Manager dans Firestore
5. Auth Guard autorise accès à `/app` routes
6. Redirection vers `/teams` (landing page)

## 2. Workflow Gestion d'Équipes

```mermaid
graph LR
    A[Teams List] -->|Créer| B[Team Form - Create]
    B -->|Save| C[DatabaseService.addTeam]
    C -->|Persist| D[IndexedDB + Queue]
    D -->|Auto Sync| E[Firestore]
    D -->|Emit| F[Teams Observable]
    F -->|Update UI| A
    
    A -->|Consulter| G[Team Detail]
    G -->|Modifier| H[Team Form - Edit]
    H -->|Save| I[DatabaseService.updateTeam]
    I --> D
    
    G -->|Ajouter Manager| J[Dialog Multi-Select]
    J -->|Save| I
```

**Actions possibles:**
- **Créer équipe:** Nom, saison, logo
- **Modifier équipe:** Tous les champs
- **Supprimer équipe:** Avec confirmation
- **Ajouter managers:** Pour partager la gestion

## 3. Workflow Gestion des Matchs

```mermaid
graph LR
    A[Team Detail] -->|Voir Matchs| B[Match List]
    B -->|Créer| C[Match Form - Create]
    C -->|Save| D[DatabaseService.addMatch]
    D -->|Persist| E[IndexedDB + Queue]
    
    B -->|Consulter| F[Match Detail]
    F -->|Modifier| G[Match Form - Edit]
    G -->|Save| H[DatabaseService.updateMatch]
    H --> E
    
    F -->|Score auto| I[Calculate from Events]
    F -->|Timer| J[In-match Timer]
    
    E -->|Sync| K[Firestore]
    K -->|Update| F
```

**États du match:**
- `scheduled`: Créé mais pas commencé
- `in_progress`: En cours (chrono actif)
- `completed`: Terminé

## 4. Workflow Principal: Collecte d'Événements

```mermaid
graph TB
    A[Match Detail Screen] -->|Score Visible| B["NOUS 5 - 5 ADV"]
    A -->|List Events| C["Events Anti-Chrono"]
    A -->|FAB +| D["Open Event Form"]
    
    D -->|Select Nature| E{Nature Type}
    E -->|SCORE| F["Essai, Transform, Pénalité, Drop"]
    E -->|CONQUETE| G["Touche, Mêlée, Coup Envoi, Renvoi"]
    E -->|DISCIPLINE| H["En Avant, Pénalité, Coup Franc"]
    E -->|INDICATEUR| I["Touche Trouvée, Essai Sauvé"]
    
    F -->|Select Resultat| J["Marqué / Raté"]
    G -->|Select Resultat| K["Gagnée / Perdue / Contre / Pénalisée"]
    H -->|Select Resultat| L["Options selon type"]
    I -->|Auto Resultat| M["Neutre / Sauvé"]
    
    J -->|Fill Form| N["Team, Minute, Comment"]
    K -->|Fill Form| N
    L -->|Fill Form| N
    M -->|Fill Form| N
    
    N -->|Save| O[EventService.addEvenement]
    O -->|Local DB| P[IndexedDB]
    O -->|Queue| Q["pending"]
    O -->|Observable| R["Match Detail Updates"]
    
    R -->|Emit| S["Score recalculé"]
    R -->|Emit| C
    
    Q -->|If Online| T[SyncService Detects]
    T -->|Send| U[Firestore]
    U -->|Success| V["Queue → synced"]
    U -->|Conflict| W["Queue → conflict + Alert"]
    U -->|Error| X["Retry: exp backoff"]
```

**Cascade de sélection:**
1. Sélectionner **Nature** → Liste des types filtrés
2. Sélectionner **Type** → Liste des résultats valides
3. Sélectionner **Équipe** (NOUS / ADV)
4. Sélectionner **Résultat** (validé par type)
5. Remplir **Minute** (optionnel, auto si possible)
6. Ajouter **Commentaire** (optionnel)
7. **Enregistrer** → Local d'abord + Queue

## 5. Workflow Modification d'Événement

```mermaid
graph LR
    A[Event List] -->|Click Event| B[Event Item]
    B -->|Edit Button| C[Event Form - Edit Mode]
    C -->|Pre-fill| D["All Fields Populated"]
    D -->|Modify| E[Form Changes]
    E -->|Save| F[EventService.updateEvenement]
    F -->|Update Queue| G["operation: update"]
    F -->|Update Local| H[IndexedDB]
    
    C -->|Delete Button| I[Confirmation Dialog]
    I -->|Confirm| J[EventService.deleteEvenement]
    J -->|Soft Delete| K["operation: delete"]
    J -->|Mark Deleted| H
```

## 6. Workflow Synchronisation (Offline-first)

```mermaid
graph TB
    A[Event Saved Locally] -->|IndexedDB| B["events table"]
    A -->|Queue| C["operations table<br/>status: pending"]
    
    D{Connectivité} -->|Offline| E["Wait..."]
    D -->|Online| F["SyncService Detects"]
    
    E -->|Connection Restored| F
    F -->|QueueService| G["getPendingOperations()"]
    G -->|Batch| H["Group by matchId"]
    
    H -->|FirestoreService| I["Sync Each Op"]
    I -->|Try| J["Firestore.set/update/delete"]
    
    J -->|Success| K["Mark synced"]
    K -->|Update Queue| L["status: synced<br/>syncedAt: now"]
    
    J -->|Conflict| M["Remote version newer"]
    M -->|Alert User| N["Conflict Notification"]
    N -->|User Choose| O{"Action"}
    O -->|Keep Local| P["Overwrite (last-write-wins)"]
    O -->|Use Remote| Q["Discard Local"]
    P -->|Send| I
    Q -->|Fetch| J
    
    J -->|Error| R{"Retry?"}
    R -->|Max < 5| S["Exponential Backoff"]
    S -->|Wait| T["1s, 2s, 4s, 8s, 16s"]
    T -->|Try Again| I
    R -->|Max = 5| U["Mark Failed"]
    U -->|Alert| V["Send Failed Notification"]
```

## 7. Workflow Mode Offline

```mermaid
graph TB
    A[User in Match Detail] -->|Network Disconnected| B["Offline Mode"]
    B -->|Indicator| C["Show Offline Badge"]
    B -->|Events Still Work| D["Create Events"]
    D -->|Local DB| E["IndexedDB + Queue"]
    E -->|UI Shows| F["Pending Badge on Event"]
    
    B -->|Actions Blocked| G["Cannot Sync Yet"]
    G -->|Message| H["Wait for Connection"]
    
    A -->|Network Restored| I["Online Mode"]
    I -->|Indicator| J["Hide Offline Badge"]
    I -->|Auto Sync| K["SyncService Triggers"]
    K -->|Process Queue| L["All pending → syncing"]
    L -->|Success| M["Badges Update"]
```

## 8. Workflow Stats & Analytics

```mermaid
graph LR
    A[Match Events] -->|Count| B["Points by Type"]
    B -->|SCORE| C["Essais, Transformations, Pénalités, Drops"]
    B -->|CONQUETE| D["Touches gagnées/perdues, Mêlées"]
    B -->|DISCIPLINE| E["Pénalités contre"]
    
    F[Stats Component] -->|Calcul| G["Totaux par équipe"]
    G -->|Visualize| H["Bar Chart / Numbers"]
    
    I[Possessions] -->|Track| J["From CONQUETE Events"]
```

---

**Prochaines étapes:**
1. Implémenter chaque workflow phase par phase
2. Tester offline-first avec DevTools
3. Valider cascade de sélection d'événements
