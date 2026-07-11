# Instructions Générées

Ce fichier définit la façon de travailler : une seule étape à la fois.

## Règle principale

- Ne traiter qu'une seule tâche à la fois.
- Lire et exécuter l'étape actuelle avant de passer à la suivante.
- Ne pas sauter d'étapes.
- Après chaque étape, mettre à jour ce fichier si nécessaire.

## Étapes séquentielles

1. **Phase 01 - Initialiser le projet Angular**
   - Vérifier l'existence du scaffold Angular.
   - Configurer `app.config.ts`, `app.routes.ts` et `styles.scss`.
   - Ajouter les dossiers et fichiers de base.

2. **Phase 02 - Authentification Firebase minimale**
   - Créer le service d'authentification stub.
   - Ajouter les routes d'authentification.
   - Créer une page de connexion de base.

3. **Phase 03 - Configuration PWA et assets**
   - Ajouter `manifest.webmanifest` et service worker.
   - Mettre en place les icônes PWA.
   - Vérifier le build pour la configuration PWA.

4. **Phase 04 - Base Dexie / IndexedDB**
   - Implémenter le modèle de données dans `src/app/core/models/datamodel.ts`.
   - Créer un service Dexie pour les opérations locales.
   - Tester l'enregistrement local d'une entité.

5. **Phase 05 - Layout & navigation**
   - Créer le composant `AppLayoutComponent`.
   - Configurer les routes lazy-loaded.
   - Ajouter un menu basique avec PrimeNG TabView.

6. **Phase 06 - Feature Teams**
   - Créer les pages et services de l'équipe.
   - Implémenter l'affichage d'une liste d'équipes.
   - Ajouter la navigation vers la gestion d'équipe.

7. **Phase 07 - Feature Matches**
   - Créer les pages et services de matchs.
   - Lier les matchs aux équipes.
   - Ajouter l'affichage des scores et du calendrier.

8. **Phase 08 - Feature Events**
   - Créer la saisie d'événements de match.
   - Gérer les différents types d'événements.
   - Ajouter l'affichage des événements dans une liste.

9. **Phase 09 - Queue & synchronisation**
   - Implémenter la queue locale `SyncOperation`.
   - Synchroniser les opérations vers Firestore.
   - Ajouter le statut de synchronisation.

10. **Phase 10 - Tests et déploiement**
    - Ajouter des tests unitaires pour les composants clés.
    - Vérifier le build de production.
    - Préparer la publication.

## Usage

- Lire ce fichier avant chaque action.
- Marquer l'étape en cours complétée dans le journal des tâches du projet.
- Ne pas entreprendre l'étape suivante tant que la précédente n'est pas terminée.
