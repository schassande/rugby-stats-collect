import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Equipe, Evenement, Match, Saisons, SyncAction, SyncObjectType } from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { AuthService } from './auth.service';
import { auth, db as firestoreDatabase } from '../config/firebase.config';
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
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
    SyncService.COLLECTIION_EVENEMENT
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
      switch(sync.objectType) {
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
        console.error('Upload impossible car l objet n existe pas dans la base locale', sync.objectType, sync.objectId);
        sync.status = 'failed';
        await this.databaseService.updateSync(sync);
        return;
      }
    }
    console.debug('uploadChecked: ', sync, obj);
    try {
      switch(sync.actionType) {
        case 'create' : 
          console.debug('Insertion dans firestore', sync.objectType, sync.objectId);
          await setDoc(doc(firestoreDatabase!, sync.objectType, ''+sync.objectId), obj);
          break;

        case 'update' : 
          console.debug('Mise à jour dans firestore', sync.objectType, sync.objectId);
          await setDoc(doc(firestoreDatabase!, sync.objectType, ''+sync.objectId), obj);
          break;
        case 'delete' : 
          console.debug('Suppression dans firestore', sync.objectType, sync.objectId);
          const docRef = doc(firestoreDatabase!, sync.objectType, ''+sync.objectId);
          await deleteDoc(docRef);
          break;
      }
      sync.status = 'synced';
    } catch (error) {
      console.error('Erreur durant l upload sur firestore', sync.objectType, sync.objectId, error, obj);
      sync.error = error as string + '\n' + JSON.stringify(obj, null, 2);
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
      where('managerIds', 'array-contains', manager.id)
    );
    const snapshot = await getDocs(q);
    const objs = snapshot.docs.map(d => d.data() as Equipe);
    await this.databaseService.importTeams(objs);
    return objs;
  }

  /**
   * Recherche puis stocke localement les matches de toutes les équipes dont je suis le manager.
   */
  public async chargerMatchesDeMesEquipes(): Promise<void> {
    const equipes = await this.chargerMesEquipes();
    await Promise.all(equipes.map(equipe => this.chargerMatches(equipe)));
  }

  /** 
   * Recherche dans la base de données firestore de toutes les matches d'une equipe. 
   * Puis stockage dans la base locale
   */
  public async chargerMatches(equipe: Equipe) {
    const q = query(
      collection(firestoreDatabase!, SyncService.COLLECTIION_MATCH),
      where('equipeId', '==', equipe.id)
    );
    const snapshot = await getDocs(q);
    const objs = snapshot.docs.map(d => d.data() as Match);
    await this.databaseService.importMatches(objs);
  }

  /** 
   * Recherche dans la base de données firestore de toutes les événements d'une match. 
   * Puis stockage dans la base locale
   */
  public async chargerEvenements(match: Match) {
    const q = query(
      collection(firestoreDatabase!, SyncService.COLLECTIION_EVENEMENT),
      where('match', '==', match.id)
    );
    const snapshot = await getDocs(q);
    const objs = snapshot.docs.map(d => d.data() as Evenement);
    await this.databaseService.importEvents(objs);
  }
}
