import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Equipe, Evenement, Match, Saisons, SyncAction, SyncObjectType } from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { AuthService } from './auth.service';
import { db as firestoreDatabase } from '../config/firebase.config';
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

  /**
   * Synchronisation vers Firestore de toutes les données pending dans la base local.
   */
  public async uploadPending() {
    (await this.databaseService.getPendingSyncs()).forEach(async sync => {
      // recuperation de l'objet dans la base locale
      let obj;
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
        sync.status = 'failed';
        await this.databaseService.updateSync(sync);
        return;
      }
      try {
        switch(sync.actionType) {
          case 'create' : 
          case 'update' : 
            await setDoc(doc(firestoreDatabase!, sync.objectType, ''+obj.id), obj);
            break;
          case 'delete' : 
            const docRef = doc(firestoreDatabase!, sync.objectType, ''+obj.id);
            await deleteDoc(docRef);
            break;
        }
        sync.status = 'synced';
      } catch (error) {
        sync.status = 'failed';
      }
      await this.databaseService.updateSync(sync);
    });
  }

  /** 
   * Recherche dans la base de données firestore de toutes les équipes dont je suis le manager. 
   * Puis stockage dans la base locale
   */
  public async chargerMesEquipes(): Promise<void> {
    const manager = this.authService.getCurrentManager();
    if (!manager) {
      return;
    }
    const q = query(
      collection(firestoreDatabase!, SyncService.COLLECTIION_EQUIPE),
      where('managerIds', 'array-contains', manager.id)
    );
    const snapshot = await getDocs(q);
    const objs = snapshot.docs.map(d => d.data() as Equipe);
    await this.databaseService.importTeams(objs);
  }

  /** 
   * Recherche dans la base de données firestore de toutes les matches d'une equipe. 
   * Puis stockage dans la base locale
   */
  public async chargerMatches(equipe: Equipe) {
    const q = query(
      collection(firestoreDatabase!, SyncService.COLLECTIION_MATCH),
      where('equipe', '==', equipe.id)
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
