# Description Détaillée des Écrans

## 1. Écrans Authentification

### 1.1 Login Screen (`/auth/login`)

**Route:** `/auth/login`  
**Component:** `LoginComponent`  
**Accessible:** Public (avant authentification)

**Layout:**
```
┌─────────────────────────────┐
│                             │
│   RUGBY STATS COLLECTOR     │
│   [Logo]                    │
│                             │
│   Email                     │
│   [________________]        │
│                             │
│   Mot de passe              │
│   [________________]        │
│                             │
│   ┌─────────────────────┐   │
│   │  Connexion          │   │
│   └─────────────────────┘   │
│                             │
│   ─────── OU ───────        │
│                             │
│   ┌─────────────────────┐   │
│   │ 🔵 Google Sign-In   │   │
│   └─────────────────────┘   │
│                             │
│   Pas encore de compte?     │
│   [Créer un compte]         │
│                             │
└─────────────────────────────┘
```

**Éléments:**
- Logo/Titre
- Input Email (validation)
- Input Password (masqué)
- Bouton "Connexion" (PrimeNG Button)
- Bouton "Connexion avec Google"
- Message d'erreur (PrimeNG Message si erreur)
- Spinner loading
- Lien "Créer un compte" → `/auth/signup`

**Actions:**
- Saisir email + password → Cliquer "Connexion"
- Ou Cliquer "Google Sign-In" → Firebase OAuth popup
- Validation: email format, password non vide

**États:**
- ✅ Loading: Spinner visible, boutons disabled
- ✅ Error: Message rouge "Email ou mot de passe incorrect"
- ✅ Success: Redirection vers `/teams`

---

### 1.2 Signup Screen (`/auth/signup`)

**Route:** `/auth/signup`  
**Component:** `SignupComponent`  
**Accessible:** Public

**Layout:**
```
┌─────────────────────────────┐
│                             │
│   Créer mon compte          │
│                             │
│   Prénom                    │
│   [________________]        │
│                             │
│   Nom                       │
│   [________________]        │
│                             │
│   Email                     │
│   [________________]        │
│                             │
│   Mot de passe              │
│   [________________]        │
│   Force: ▌▌░░░ Moyen       │
│                             │
│   Confirmer mot de passe    │
│   [________________]        │
│                             │
│   ☑ J'accepte les CGU       │
│                             │
│   ┌─────────────────────┐   │
│   │ Créer mon compte    │   │
│   └─────────────────────┘   │
│                             │
│   ──── OU Utiliser ────     │
│   ┌─────────────────────┐   │
│   │ 🔵 Google Sign-In   │   │
│   └─────────────────────┘   │
│                             │
│   Déjà un compte?           │
│   [Connexion]               │
│                             │
└─────────────────────────────┘
```

**Éléments:**
- Input Prénom
- Input Nom
- Input Email
- Input Password (avec indicateur de force)
- Input Confirm Password
- Checkbox CGU
- Bouton "Créer mon compte"
- Bouton "Google Sign-In"
- Lien "Connexion" → `/auth/login`

**Validations:**
- Email: Format valide + non existant
- Password: Min 8 chars, 1 majuscule, 1 chiffre, 1 spécial
- Confirm: Match password
- Prenom/Nom: Non vide
- CGU: Checked

**États:**
- ✅ Loading: Spinner visible
- ✅ Error: Message détaillé (ex: "Email déjà utilisé")
- ✅ Success: Email de confirmation + Redirection login

---

## 2. Écrans Authentifiés (avec AppLayoutComponent)

Tous les écrans ci-dessous sont enfants de `AppLayoutComponent` qui affiche le **TabView en bas** avec 4 onglets:
- **Match** (icône home)
- **Événements** (icône list)
- **Stats** (icône chart)
- **Plus** (icône menu)

### 2.1 Teams List Screen (`/app/teams`)

**Route:** `/app/teams`  
**Component:** `TeamListComponent`  
**Inside:** `AppLayoutComponent` tab "Match"

**Layout:**
```
┌─────────────────────────────┐
│ ← │ Mes Équipes          │☰ │ ◄─── Header
├─────────────────────────────┤
│ Saison: [2024/2025 ▼]       │ ◄─── Filter
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐   │
│  │ 📋 Coxs             │   │
│  │ 5 matchs            │   │
│  │ [Manager icons]     │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ 📋 Dragons          │   │
│  │ 3 matchs            │   │
│  └─────────────────────┘   │
│                             │
│  [Scroll vers le bas]       │
│                             │
├─────────────────────────────┤
│ Match │Events │Stats │Plus  │ ◄─── TabView
└─────────────────────────────┘
                    ⊕  ◄─── FAB + (Créer équipe)
```

**Éléments:**
- Header avec "Mes Équipes"
- Dropdown "Saison" (pour filtrer)
- Cards d'équipes (PrimeNG Card)
  - Nom équipe
  - Nombre de matchs
  - Icônes des managers
  - Click → Détail équipe
- FAB "+" en bas à droite (Créer équipe)
- TabView sticky bottom

**Actions:**
- Clic sur card → Route `/app/teams/:teamId`
- Clic FAB "+" → Modal Créer Équipe OU Route `/app/teams/new`
- Filtre saison → Observable filtre list

---

### 2.2 Team Form (`/app/teams/new` ou `/app/teams/:teamId/edit`)

**Route:** `/app/teams/new` ou `/app/teams/:teamId/edit`  
**Component:** `TeamFormComponent`  
**UI:** Modal `p-dialog` OU Page standalone

**Layout:**
```
┌─────────────────────────────┐
│ X  Créer Équipe          ✓  │ ◄─── Header Modal
├─────────────────────────────┤
│                             │
│ Nom de l'équipe             │
│ [________________]          │
│                             │
│ Logo (optionnel)            │
│ [Upload Image]              │
│                             │
│ Saison                      │
│ [2024/2025 ▼]               │
│                             │
│ Managers                    │
│ [+ Ajouter Manager]         │
│ [🧑 Manager 1]    [x]       │
│ [🧑 Manager 2]    [x]       │
│                             │
│              [Annuler] [OK] │
│                             │
└─────────────────────────────┘
```

**Éléments (Reactive Form):**
- Input Nom (requis)
- Upload Image (optionnel)
- Dropdown Saison
- Multi-select Managers (+ dialog pour ajouter)
- Buttons: Annuler / Supprimer (si edit) / Enregistrer

**Validations:**
- Nom: Non vide, min 2 chars
- Saison: Format valide

**Actions:**
- Save → `TeamService.addTeam()` OU `updateTeam()`
- Delete (si edit) → ConfirmDialog → Supprimer
- Cancel → Fermer modal + Retour list

---

### 2.3 Team Detail (`/app/teams/:teamId`)

**Route:** `/app/teams/:teamId`  
**Component:** `TeamDetailComponent`  
**Inside:** `AppLayoutComponent`

**Layout:**
```
┌─────────────────────────────┐
│ ← │ Coxs (2024/2025)     │☰ │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐   │
│  │ [Logo]    Coxs      │   │
│  │           2024/2025 │   │
│  │  5 matchs           │   │
│  │  Managers: [Icons]  │   │
│  └─────────────────────┘   │
│                             │
│  MATCHS (Liste)             │
│  ─────────────────────      │
│                             │
│  2024-12-15 | Coxs - ADV    │
│  [2] - [3] | Complet       │
│                             │
│  2024-12-08 | Coxs - LOL    │
│  [1] - [1] | Complet       │
│                             │
│  [Scroll...]                │
│                             │
├─────────────────────────────┤
│ Match │Events │Stats │Plus  │
└─────────────────────────────┘
                    ⊕  ◄─── FAB +
```

**Éléments:**
- Card Équipe (nom, logo, saison, managers, nombre matchs)
- List des matchs (PrimeNG DataTable ou custom)
  - Date match
  - Adversaire
  - Score final
  - Badge "Complet" / "En cours" / "Planifié"
  - Click → Détail match
- FAB "+" (Créer match)
- Header bouton "⋮" (Edit équipe, Supprimer)

**Actions:**
- Clic match → Route `/app/matches/:matchId`
- FAB "+" → Modal Créer Match OU Route `/app/matches/new?teamId=X`
- Header menu → Modifier équipe OU Supprimer

---

### 2.4 Match Form (`/app/matches/new` ou `/app/matches/:matchId/edit`)

**Route:** `/app/matches/new?teamId=X` ou `/app/matches/:matchId/edit`  
**Component:** `MatchFormComponent`

**Layout:**
```
┌─────────────────────────────┐
│ X  Nouveau Match         ✓  │
├─────────────────────────────┤
│                             │
│ Équipe                      │
│ [Coxs] (non-editable)       │
│                             │
│ Adversaire                  │
│ [________________]          │
│                             │
│ Date                        │
│ [2024-12-15]                │
│                             │
│ Terrain                     │
│ ( ) Naturel ( ) Synthétique │
│ ( ) Hybride ( ) Autre       │
│                             │
│ Lieu                        │
│ [________________]          │
│                             │
│ Conditions météo            │
│ [Sec ▼]                     │
│                             │
│ Heure début (optionnel)     │
│ [14:00]                     │
│                             │
│              [Annuler] [OK] │
│                             │
└─────────────────────────────┘
```

**Éléments:**
- Équipe (read-only)
- Input Adversaire
- DatePicker Date
- RadioGroup Terrain
- Input Lieu
- Dropdown Conditions météo
- TimePicker Heure début/fin (optionnel)

**Validations:**
- Adversaire: Non vide
- Date: Format valide, futur pour nouveau
- Terrain: Sélectionné
- Lieu: Optionnel

---

### 2.5 Match Detail (`/app/matches/:matchId`)

**Route:** `/app/matches/:matchId`  
**Component:** `MatchDetailComponent`  
**Inside:** `AppLayoutComponent` tab "Match"

**Layout Principal:**
```
┌─────────────────────────────┐
│ ← │ Coxs vs ADV           │☰ │ ◄─── Header
├─────────────────────────────┤
│  SCORE EN DIRECT            │
│  ────────────────────       │
│                             │
│        COXS                 │
│          5                  │
│                             │
│   1er mi-temps · 28:15      │
│   [▶ ⏸ ⏹]                   │
│                             │
│          ADV                │
│          5                  │
│                             │
├─────────────────────────────┤
│  ÉVÉNEMENTS (Anti-Chrono)   │
│  ────────────────────       │
│                             │
│  [28:15] ESSAI - COXS       │ ◄─── Plus récent en haut
│  Marqué · Commentaire...    │
│  [Edit] [Delete]            │
│                             │
│  [25:30] TOUCHE - ADV       │
│  Gagnée                     │
│  [Edit] [Delete]            │
│                             │
│  [20:00] PENALITE - COXS    │
│  Marquée                    │
│  [Edit] [Delete]            │
│                             │
│  [Scroll...]                │
│                             │
├─────────────────────────────┤
│ Match │Events │Stats │Plus  │
└─────────────────────────────┘
                    ⊕  ◄─── FAB + (Créer événement)
```

**Éléments - Partie Supérieure (Score):**
- Header: "← | Adversaire | ⋮"
- **Bloc Score:**
  - Équipe domicile: "COXS"
  - Score: "5"
  - Équipe extérieur: "ADV"
  - Score: "5"
  - Info: "1er mi-temps · 28:15"
  - Timer: Boutons Play/Pause/Stop

**Éléments - Partie Événements:**
- Titre "ÉVÉNEMENTS"
- Liste en **antichonologie** (plus récents d'abord)
- Chaque événement:
  - Minute [MM:SS]
  - Type événement + Équipe
  - Résultat
  - Commentaire (si exists)
  - Boutons [Edit] [Delete]
- Scroll vertical

**FAB "+":**
- Bouton en bas à droite
- Click → Ouvre EventFormComponent en modal

**Actions:**
- **Créer:** FAB "+" → Modal EventForm
- **Modifier:** Clic [Edit] sur événement → Modal EventForm (pre-filled)
- **Supprimer:** Clic [Delete] → ConfirmDialog → Supprimer
- **Score auto:** Calculé depuis les événements SCORE
- **Timer:** Chrono du match (start/pause/stop)

**États:**
- ✅ Match "scheduled": Timer désactivé
- ✅ Match "in_progress": Timer actif
- ✅ Match "completed": Timer arrêté + score final

---

### 2.6 Event Form - Modal (`/app/matches/:matchId/events/new`)

**Route:** Modal overlay (pas de route dédiée)  
**Component:** `EventFormComponent`  
**Trigger:** FAB ou Edit événement

**Layout Principal:**
```
┌─────────────────────────────┐
│ X        Événement       ✓  │ ◄─── Header bleu
├─────────────────────────────┤
│ COXS 5 - 5 ADV              │ ◄─── Context
│ 1er mi-temps · 28:15        │
├─────────────────────────────┤
│                             │
│ TYPE D'ÉVÉNEMENT            │
│ [ SCORE ] [CONQUETE] [DISC] │ ◄─── ButtonGroup
│ [INDICATEUR]                │
│                             │
│ SOUS-TYPE (selon Nature)    │
│ [Essai] [Transf] [Penal]    │ ◄─── Dropdown/Buttons
│ [Drop]                      │
│                             │
│ ÉQUIPE                      │
│ [ NOUS ] [ ADV ]            │ ◄─── ButtonGroup
│                             │
│ RÉSULTAT (selon Type)       │
│ [Marqué ▼]                  │
│                             │
│ MINUTE (optionnel)          │
│ [28:15]                     │
│                             │
│ COMMENTAIRE (optionnel)     │
│ [________________]          │
│ [                         ] │
│                             │
│          [Annuler] [OK]     │
│ Si edit: [Supprimer]        │
│                             │
└─────────────────────────────┘
```

**Sections:**

#### A. En-tête Modal
- Titre: "Nouvel événement" OU "Modifier événement"
- Bouton X (fermer)
- Bouton ✓ (enregistrer)

#### B. Contexte du Match
- Affichage score courant: "COXS 5 - 5 ADV"
- Info période/minute: "1er mi-temps · 28:15"

#### C. TYPE D'ÉVÉNEMENT (ButtonGroup - exclusive)
- Boutons: **SCORE** | **CONQUETE** | **DISCIPLINE** | **INDICATEUR**
- Sélection = change le formulaire en cascade

#### D. SOUS-TYPE (Dropdown/ButtonGroup - dynamique)

**Si SCORE:**
- Options: Essai, Transformation, Pénalité, Drop

**Si CONQUETE:**
- Options: Touche, Mêlée, Coup d'envoi, Renvoi

**Si DISCIPLINE:**
- Options: En-avant, Pénalité commis, Coup de pied franc

**Si INDICATEUR:**
- Options: Touche trouvée, Touche non trouvée, Essai sauvé

#### E. ÉQUIPE (ButtonGroup - exclusive)
- Boutons: **NOUS** | **ADV**

#### F. RÉSULTAT (Dropdown - dynamique selon sous-type)

**SCORE > Essai:** Marqué / Raté
**SCORE > Transformation:** Réussie / Ratée
**SCORE > Pénalité:** Marquée / Ratée
**SCORE > Drop:** Marqué / Raté

**CONQUETE > Touche:** Gagnée / Perdue / Contre / Pénalisée
**CONQUETE > Mêlée:** Gagnée / Pénalisée / Subie / Contre
**CONQUETE > Coup d'envoi:** Récupéré / Non récupéré
**CONQUETE > Renvoi:** Récupéré / Non récupéré

**DISCIPLINE:** Toujours "Commis" (automatique)

**INDICATEUR:** Neutre / Marquant

#### G. MINUTE (PrimeNG InputMask)
- Format: `MM:SS`
- Optionnel
- Pré-rempli avec minute courante si possible

#### H. COMMENTAIRE (Textarea)
- Optionnel
- Rows: 3

#### I. Boutons Action
- Annuler (text)
- OK / Enregistrer (primary)
- Supprimer (danger - si edit)

**Validations:**
- Nature: Requis
- Type: Requis
- Équipe: Requis
- Résultat: Requis et valide pour type

**États:**
- ✅ Création: Bouton "Enregistrer"
- ✅ Édition: Bouton "Enregistrer" + "Supprimer"
- ✅ Loading: Spinner visible, buttons disabled
- ✅ Erreur: Message validation visible

---

### 2.7 Match Stats Tab

**Route:** Dynamique - Tab "Stats" dans AppLayout  
**Component:** `MatchStatsComponent`  
**Inside:** `AppLayoutComponent` tab "Stats"

**Layout:**
```
┌─────────────────────────────┐
│  STATISTIQUES               │
│  ────────────────────       │
│                             │
│  SCORES                     │
│  NOUS: 3 Essais + 2 Penal   │
│        = 21 points          │
│                             │
│  ADV:  1 Essai + 1 Transf   │
│        = 12 points          │
│                             │
├─────────────────────────────┤
│  CONQUÊTE                   │
│  Touches: 15 gagnées / 8    │
│  Mêlées:  12 gagnées / 10   │
│                             │
├─────────────────────────────┤
│  DISCIPLINE                 │
│  Pénalités contre: 5        │
│  En-avants: 3               │
│                             │
├─────────────────────────────┤
│  INDICATEURS                │
│  Touches trouvées: 8        │
│  Essais sauvés: 2           │
│                             │
├─────────────────────────────┤
│ Match │Events │Stats │Plus  │
└─────────────────────────────┘
```

**Éléments:**
- Cartes par catégorie (PrimeNG Card)
- Totaux par équipe
- Graphiques simples (optionnel: PrimeNG Chart)

---

### 2.8 More Menu (`/app/menu`)

**Route:** Tab "Plus" dans AppLayout  
**Component:** `MoreMenuComponent`  
**Inside:** `AppLayoutComponent` tab "Plus"

**Layout:**
```
┌─────────────────────────────┐
│  MENU                       │
│  ────────────────────       │
│                             │
│  [🔐] Paramètres            │
│                             │
│  [📱] À propos              │
│                             │
│  [❓] Aide                  │
│                             │
│  [📊] Historique            │
│                             │
│  [⚙️] Paramètres app       │
│                             │
│  ──────────────────         │
│  [🚪] Déconnexion          │
│                             │
├─────────────────────────────┤
│ Match │Events │Stats │Plus  │
└─────────────────────────────┘
```

**Éléments:**
- Menu items (clickables)
  - Paramètres → `/app/menu/settings`
  - À propos
  - Aide
  - Historique
  - Paramètres app
  - Déconnexion → Logout

---

## 3. Responsive Design

- **Mobile first:** Conçu pour écrans 375-480px
- **Tablet:** Responsive +600px (ajustements layout)
- **Desktop:** Responsive +1024px (optionnel)

---

**Dernier update:** 10 juillet 2026
