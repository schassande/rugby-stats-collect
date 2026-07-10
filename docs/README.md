# Rugby Stats Collector - Guide Complet

## 📱 À Propos

**Rugby Stats Collector** est une PWA Angular 18 + Dexie + Firebase conçue pour collecter des événements de rugby en temps réel, avec support offline-first et synchronisation automatique.

### Caractéristiques

✅ **Offline-First** - Fonctionne complètement offline, synchronisation automatique  
✅ **PWA Installable** - Installation directe sur mobile (home screen)  
✅ **Real-time Collaboration** - Firebase Firestore pour la synchronisation  
✅ **Validation Métier** - Cascade type/résultat pour événements rugby  
✅ **Score Auto-Calculé** - Calcul automatique des points essai/transformation/penalité  
✅ **Queue Locale** - Gestion des opérations hors ligne avec retry automatique  
✅ **Sécurité** - Firebase Auth + Firestore rules par équipe  
✅ **Performance** - Service Worker, caching, lazy loading  

---

## 📚 Documentation

### 1. Vue d'Ensemble
- [Architecture Globale](../architecture.md) - Stack, patterns, structure
- [Modèle de Données](../datamodel.md) - Interfaces, schémas, validation
- [Workflows Utilisateur](../workflows.md) - Diagrammes de flux (8 Mermaid)
- [Spécifications Écrans](../ecrans.md) - 8 écrans avec layouts ASCII

### 2. Conception Détaillée
- [APIs Services](../services.md) - Contrats de 10 services
- [Stratégie Offline](../offline.md) - Architecture sync, conflits, scenarios

### 3. Guide d'Implémentation (10 Phases + 2 Optionnelles)

| Phase | Titre | Durée | Complexité |
|-------|-------|-------|-----------|
| [00](./00.overview.md) | Overview & Planning | - | 🔵 Lecture |
| [01](./01.angular_setup.md) | Angular 18 Setup | 1h | 🟢 Facile |
| [02](./02.firebase_auth.md) | Firebase Auth | 2h | 🟡 Moyen |
| [02b](./02b.auth_local_optional.md) | Auth Local (Offline) | 1.5h | 🟡 Moyen |
| [03](./03.pwa_config.md) | PWA Configuration | 1h | 🟢 Facile |
| [04](./04.dexie_database.md) | Dexie IndexedDB | 1.5h | 🟡 Moyen |
| [05](./05.layout_navigation.md) | Layout & Navigation | 1h | 🟢 Facile |
| [06](./06.teams_feature.md) | Teams CRUD | 2h | 🟡 Moyen |
| [07](./07.matches_feature.md) | Matches + Timer | 2h | 🟡 Moyen |
| [08](./08.events_feature.md) | Events Collector (Core) | 3h | 🔴 Complexe |
| [09](./09.queue_sync.md) | Queue & Sync (Offline) | 2.5h | 🔴 Complexe |
| [09b](./09b.reauth_sync.md) | Réauth Local→Cloud | 1.5h | 🟡 Moyen |
| [10](./10.testing_deployment.md) | Testing & Deploy | 2h | 🟡 Moyen |

**Durée totale estimée: ~20.5 heures** (si phases optionnelles)  
**Durée core (Firebase): ~17.5 heures**

---

## 🚀 Quick Start

### Prérequis
```bash
Node.js 18+
npm 9+
Firebase CLI
```

### Installation Rapide

```bash
# Phase 01 - Setup Angular
ng new GamesStats --routing=true --style=scss
cd GamesStats
npm install primeng primeicons @angular/cdk dexie firebase uuid

# Phase 02 - Firebase Auth
# → Suivre les instructions dans 02.firebase_auth.md

# Phase 03 - PWA
ng add @angular/pwa

# Puis continuer Phases 04-10
```

### Démarrer en Dev
```bash
ng serve
# http://localhost:4200
```

### Tester Offline
```bash
ng build --configuration production
ng serve --poll 2000
# DevTools → Application → Service Workers
# Network → Offline
```

---

## 📂 Structure du Projet

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── auth.service.ts           ✅ Phase 02
│   │   │   ├── database.service.ts       ✅ Phase 04
│   │   │   ├── queue.service.ts          ✅ Phase 09
│   │   │   ├── sync.service.ts           ✅ Phase 09
│   │   │   ├── firestore.service.ts      ✅ Phase 09
│   │   │   └── navigation.service.ts     📋 TODO
│   │   ├── models/
│   │   │   └── datamodel.ts              ✅ (from rugby_stats_datamodel.ts)
│   │   ├── guards/
│   │   │   └── auth.guard.ts             ✅ Phase 02
│   │   ├── database/
│   │   │   └── rugby-stats.database.ts   ✅ Phase 04
│   │   └── config/
│   │       └── firebase.config.ts        ✅ Phase 02
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── login/                ✅ Phase 02
│   │   │   │   └── signup/               ✅ Phase 02
│   │   │   └── auth.routes.ts            ✅ Phase 02
│   │   ├── teams/
│   │   │   ├── services/team.service.ts  ✅ Phase 06
│   │   │   ├── pages/
│   │   │   │   ├── list/                 ✅ Phase 06
│   │   │   │   ├── form/                 ✅ Phase 06
│   │   │   │   └── detail/               ✅ Phase 06
│   │   │   └── teams.routes.ts           ✅ Phase 06
│   │   ├── matches/
│   │   │   ├── services/match.service.ts ✅ Phase 07
│   │   │   ├── pages/
│   │   │   │   ├── detail/               ✅ Phase 07
│   │   │   │   └── form/                 ✅ Phase 07
│   │   │   └── matches.routes.ts         ✅ Phase 07
│   │   ├── events/
│   │   │   ├── services/event.service.ts ✅ Phase 08
│   │   │   ├── pages/
│   │   │   │   └── form/                 ✅ Phase 08
│   │   │   └── events.routes.ts          ✅ Phase 08
│   │   ├── menu/
│   │   │   └── pages/menu/               📋 TODO
│   │   └── stats/
│   │       └── pages/stats/              📋 TODO
│   ├── layout/
│   │   └── app-layout.component.ts       ✅ Phase 05
│   ├── app.routes.ts                     ✅ Phase 05
│   └── app.config.ts                     ✅ Phase 02
├── assets/
│   ├── icons/                            ✅ Phase 03 (PWA)
│   ├── styles/
│   │   ├── rugby-theme.scss              📋 TODO
│   │   └── styles.scss                   ✅ Phase 01
│   └── screenshots/                      📋 TODO (PWA)
├── index.html                            ✅ Phase 03
├── main.ts                               ✅ Phase 03
└── styles.scss                           ✅ Phase 01
```

---

## 🔑 Points Clés

### Offline-First Architecture
1. **Write** → Immédiat à IndexedDB (< 100ms)
2. **Queue** → Operation stockée avec status "pending"
3. **Sync** → Détection online → Auto-sync toutes les 5s
4. **Retry** → Exponential backoff (1s, 2s, 4s, 8s, 16s)
5. **Conflict** → Last-write-wins (compare syncedAt)

### Validation Événements (Cascade)
```
Nature → Type → Résultat
- SCORE → [ESSAI, TRANSFORMATION, PENALITE, DROP] → [MARQUE, RATE, REUSSITE, ECHEC]
- CONQUETE → [TOUCHE, MELEE, ...] → [GAGNEE, PERDUE, CONTRE]
- DISCIPLINE → [EN_AVANT, PENALITE, ...] → [PENALISEE]
```

### Sécurité Firebase
```
managers/{uid}
  → Lecture/Écriture uniquement propriétaire

teams/{teamId}
  → Lecture si in managerIds array
  → Écriture si in managerIds array

teams/{teamId}/matches/{matchId}/evenements/{eventId}
  → Hérité du manager dans teams.managerIds
```

---

## 📊 Statistiques de Scoring

| Type | Résultat | Points |
|------|----------|--------|
| ESSAI | MARQUE | 5 pts |
| TRANSFORMATION | REUSSITE | 2 pts |
| PENALITE | MARQUE | 3 pts |
| DROP | MARQUE | 3 pts |

---

## ⚙️ Configuration PrimeNG

```typescript
// app.config.ts
providePrimeng()

// Modules à importer par composant
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
// ... etc
```

---

## 🧪 Tests

### Run Tests
```bash
ng test
```

### Test Offline Mode
1. Build: `ng build --configuration production`
2. Serve: `ng serve --poll 2000`
3. DevTools → Application → Service Workers
4. Network → "Offline"
5. Ajouter des événements
6. Vérifier IndexedDB (Application → IndexedDB → operations_queue)
7. Passer en ligne → Vérifier sync automatique

### Lighthouse Audit
```bash
ng build --configuration production
# DevTools → Lighthouse → Analyze
# Target: Performance > 80, PWA > 80
```

---

## 🚀 Déploiement

### Firebase Hosting
```bash
firebase init hosting
ng build --configuration production
firebase deploy --only hosting
```

### URL en Prod
```
https://your-project.web.app
```

### Monitoring
```bash
firebase functions:log
firebase firestore:indexes
firebase performance:list
```

---

## 📖 Documentation Supplémentaire

- [Architecture Complète](../architecture.md)
- [Datamodel Détaillé](../datamodel.md)
- [Services APIs](../services.md)
- [Workflows Mermaid](../workflows.md)
- [Screens Spécifications](../ecrans.md)
- [Offline Strategy](../offline.md)

---

## ❓ FAQ

**Q: Comment ça fonctionne offline?**  
A: Les événements sont sauvegardés immédiatement dans IndexedDB. Une opération est créée dans la queue. Quand vous êtes en ligne, la sync démarre automatiquement et envoie les données à Firestore.

**Q: Que se passe-t-il en cas de conflit?**  
A: Utilisé last-write-wins: la dernière opération (comparaison `syncedAt`) gagne. Pour plus de contrôle, modifier le service de sync.

**Q: La PWA est-elle vraiment installable?**  
A: Oui! Manifest.webmanifest + Service Worker = installable. Sur Chrome mobile: Menu → "Installer l'app".

**Q: Peut-on exporter les données?**  
A: Oui! DatabaseService.exportDatabase() retourne tout. Implémenter un bouton "Export" dans le menu.

**Q: Comment ajouter des utilisateurs à une équipe?**  
A: Ajouter leurs UIDs Firebase au array `team.managerIds`.

---

## 🤝 Contribution

1. Créer une branche: `git checkout -b feature/ma-feature`
2. Implémenter suivant les patterns existants
3. Tester offline mode
4. Push et PR

---

## 📞 Support

Pour questions:
1. Vérifier [FAQ](#faq)
2. Consulter [architecture.md](../architecture.md)
3. Relire [offline.md](../offline.md) pour issues sync

---

## 📝 License

MIT

---

**Version 1.0** - 2024  
Rugby Stats Collector PWA
