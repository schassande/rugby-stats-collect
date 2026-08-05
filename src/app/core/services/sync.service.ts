import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Equipe,
  Evenement,
  Match,
  Saisons,
  SyncAction,
  SyncObjectType,
} from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { AuthService } from './auth.service';
import { auth, db as firestoreDatabase } from '../config/firebase.config';
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private readonly databaseService = inject(DatabaseService);
  private readonly authService = inject(AuthService);
  private static readonly COLLECTIION_EQUIPE: SyncObjectType = 'Equipe';
  private static readonly COLLECTIION_MATCH: SyncObjectType = 'Match';
  private static readonly COLLECTIION_EVENEMENT: SyncObjectType = 'Evenement';

  private static readonly PRIORITE_COLLECTION = [
    SyncService.COLLECTIION_EQUIPE,
    SyncService.COLLECTIION_MATCH,
    SyncService.COLLECTIION_EVENEMENT,
  ];
  public sortSyncs(syncs: SyncAction[]): SyncAction[] {
    return [...syncs].sort((s1, s2) => {
      const idx1 = SyncService.PRIORITE_COLLECTION.indexOf(s1.objectType);
      const idx2 = SyncService.PRIORITE_COLLECTION.indexOf(s2.objectType);
      let res = idx1 - idx2;
      if (res !== 0) return res;
      return new Date(s1.createdAt).getTime() - new Date(s2.createdAt).getTime();
    });
  }
  /**
   * Synchronisation vers Firestore de toutes les données pending dans la base local.
   */
  public async uploadPending() {
    const syncs = await this.databaseService.getPendingSyncs();
    await this.uploadAll(syncs);
  }
  public async uploadAll(syncs: SyncAction[]) {
    // await this.authService.checkFirebaseUserConnected();
    await Promise.all(syncs.map((sync) => this.uploadChecked(sync)));
  }
  public async upload(sync: SyncAction) {
    await this.authService.checkFirebaseUserConnected();
    await this.uploadChecked(sync);
  }
  private async uploadChecked(sync: SyncAction) {
    if (sync.status === 'synced') return;

    // recuperation de l'objet dans la base locale
    let obj;
    if (sync.actionType !== 'delete') {
      switch (sync.objectType) {
        case 'Equipe':
          obj = await this.databaseService.getTeam(sync.objectId);
          break;
        case 'Match':
          obj = await this.databaseService.getMatch(sync.objectId);
          break;
        case 'Evenement':
          obj = await this.databaseService.getEvent(sync.objectId);
          break;
      }
      if (!obj) {
        console.error(
          'Upload impossible car l objet n existe pas dans la base locale',
          sync.objectType,
          sync.objectId,
        );
        sync.status = 'failed';
        await this.databaseService.updateSync(sync);
        return;
      }
    }
    console.debug('uploadChecked: ', sync, obj);
    try {
      switch (sync.actionType) {
        case 'create':
          console.debug('Insertion dans firestore', sync.objectType, sync.objectId);
          await setDoc(doc(firestoreDatabase!, sync.objectType, '' + sync.objectId), obj);
          break;

        case 'update':
          console.debug('Mise à jour dans firestore', sync.objectType, sync.objectId);
          await setDoc(doc(firestoreDatabase!, sync.objectType, '' + sync.objectId), obj);
          break;
        case 'delete':
          console.debug('Suppression dans firestore', sync.objectType, sync.objectId);
          const docRef = doc(firestoreDatabase!, sync.objectType, '' + sync.objectId);
          await deleteDoc(docRef);
          break;
      }
      sync.status = 'synced';
    } catch (error) {
      console.error(
        'Erreur durant l upload sur firestore',
        sync.objectType,
        sync.objectId,
        error,
        obj,
      );
      sync.error = (error as string) + '\n' + JSON.stringify(obj, null, 2);
      sync.status = 'failed';
    }
    console.debug('Mise à jour la synchronisation pour l objet', sync.objectType, sync.objectId);
    await this.databaseService.updateSync(sync);
  }

  /**
   * Recherche dans la base de données firestore de toutes les équipes dont je suis le manager.
   * Puis stockage dans la base locale
   */
  public async chargerMesEquipes(): Promise<Equipe[]> {
    const manager = this.authService.getCurrentManager();
    if (!manager) {
      return [];
    }
    const q = query(
      collection(firestoreDatabase!, SyncService.COLLECTIION_EQUIPE),
      where('managerIds', 'array-contains', manager.id),
    );
    const snapshot = await getDocs(q);
    const objs = snapshot.docs.map((d) => d.data() as Equipe);
    const missing = (
      await Promise.all(
        objs.map(async (team) =>
          (await this.databaseService.getTeam(team.id)) ? undefined : team,
        ),
      )
    ).filter((team): team is Equipe => !!team);
    await this.databaseService.importTeams(missing);
    return objs;
  }

  /**
   * Recherche puis stocke localement les matches de toutes les équipes dont je suis le manager.
   */
  public async chargerMatchesDeMesEquipes(): Promise<number> {
    const equipes = await this.chargerMesEquipes();
    const resultats = await Promise.all(equipes.map((equipe) => this.chargerMatches(equipe)));
    return resultats.reduce((total, nombre) => total + nombre, 0);
  }

  /**
   * Recherche dans la base de données firestore de toutes les matches d'une equipe.
   * Puis stockage dans la base locale
   */
  public async chargerMatches(equipe: Equipe): Promise<number> {
    const manager = this.authService.getCurrentManager();
    if (!manager) {
      return 0;
    }
    const q = query(
      collection(firestoreDatabase!, SyncService.COLLECTIION_MATCH),
      // La règle Firestore autorise uniquement les matches dont le managerId
      // correspond à l'utilisateur courant. Ce filtre est donc nécessaire
      // pour que Firestore puisse valider la requête avant son exécution.
      where('equipeId', '==', equipe.id),
      where('managerId', '==', manager.id),
    );
    const snapshot = await getDocs(q);
    const objs = snapshot.docs.map((d) => d.data() as Match);
    await this.databaseService.importMatches(objs);
    return objs.length;
  }

  /**
   * Recherche dans la base de données firestore de toutes les événements d'une match.
   * Puis stockage dans la base locale
   */
  public async chargerEvenements(match: Match) {
    const q = query(
      collection(firestoreDatabase!, SyncService.COLLECTIION_EVENEMENT),
      where('match', '==', match.id),
    );
    const snapshot = await getDocs(q);
    const objs = snapshot.docs.map((d) => d.data() as Evenement);
    await this.databaseService.importEvents(objs);
  }
}
