import { inject, Injectable } from '@angular/core';
import { db } from '../db/rugby-stats.database';
import { Evenement, Match, Equipe, Manager, Saison, SyncAction, SyncObjectType, SyncActionType, SyncActionStatus } from '../models/datamodel';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export const randomSize:number = 1000000;

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private currentPendingSyncSubject = new BehaviorSubject<number>(0);
  currentPendingSync$ = this.currentPendingSyncSubject.asObservable();
  private authService = inject(AuthService);

  readonly equipePrefix = 1;
  readonly matchPrefix = 2;
  readonly evenementPrefix = 3;

  constructor() {
    this.calculPendingSyncs();
  }

  private textTo6Digits(value: string): number {
    const normalized = value.trim().toLowerCase();
    let hash = 0x811c9dc5;
    for (let i = 0; i < normalized.length; i++) {
      hash ^= normalized.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    // Avalanche
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;
    return Number.parseInt(((hash >>> 0) % 1_000_000).toString().padStart(6, '0'));
  }

  //=======================================================//
  // Events
  //=======================================================//
  async addEvent(event: Omit<Evenement, 'id'>): Promise<Evenement> {
    const id = event.matchId + '-E' + Math.floor(Math.random() * randomSize)
    const obj: Evenement = {...event, id}
    await db.evenements.add(obj);
    this.addSync('Evenement', id, 'create');
    return obj;
  }
  async updateEvent(event: Evenement): Promise<void> {
    await db.evenements.put(event);
    this.addSync('Evenement', event.id, 'update');
  }
  async deleteEvent(eventId: string): Promise<void> {
    await db.evenements.delete(eventId);
    this.addSync('Evenement', eventId, 'delete');
  }
  async getEventsByMatch(matchId: string): Promise<Evenement[]> {
    const events = await db.evenements.where('matchId').equals(matchId).toArray();
    return events.sort((a, b) => b.instant.localeCompare(a.instant));
  }
  async getEvent(eventId: string): Promise<Evenement | undefined> {
    return db.evenements.get(eventId);
  }
  async importEvents(evenements: Evenement[]) {
    await db.evenements.bulkPut(evenements);
  }


  //=======================================================//
  // Matches
  //=======================================================//
  async addMatch(match: Omit<Match, 'id'>): Promise<Match> {
    const id = match.equipeId + '-M' + Math.floor(Math.random() * randomSize);
    const obj: Match = {...match, id}
    await db.matches.add(obj);
    this.addSync('Match', id, 'create');
    return obj;
  }
  async updateMatch(match: Match): Promise<void> {
    await db.matches.put(match);
    this.addSync('Match', match.id, 'update');
  }
  async deleteMatch(matchId: string): Promise<void> {
    const events = await this.getEventsByMatch(matchId);
    if (events.length > 0) {
      console.debug('Suppression de '+events.length+' evenements du match '+ matchId +' avant la suppression du match lui meme')
      for (const event of events) {
        await this.deleteEvent(event.id);
      }
    } else {
      console.debug('Suppression direct du match '+ matchId);
    }
    await db.matches.delete(matchId);
    this.addSync('Match', matchId, 'delete');
  }
  async getMatchesByTeam(teamId: string): Promise<Match[]> {
    return db.matches.where('equipeId').equals(teamId).toArray();
  }
  async getMatchesByTeamNSeason(teamId: string, season: Saison): Promise<Match[]> {
    return db.matches
      .where('equipeId')
      .equals(teamId)
      .filter(match => match.saison === season)
      .toArray();
  }
  async getMatch(matchId: string): Promise<Match | undefined> {
    return db.matches.get(matchId);
  }
  async importMatches(matchs: Match[]) {
    await db.matches.bulkPut(matchs);
  }


  //=======================================================//
  // Teams
  //=======================================================//
  async addTeam(team: Omit<Equipe, 'id'>): Promise<Equipe> {
    const id = this.textTo6Digits(this.authService.getCurrentManager()!.id) + '-T' +Math.floor(Math.random() * randomSize);
    const obj: Equipe = {...team, id}
    await db.equipes.add(obj);
    this.addSync('Equipe', id, 'create');
    return obj;
 }
  async updateTeam(team: Equipe): Promise<void> {
    await db.equipes.put(team);
    this.addSync('Equipe', team.id, 'update');
  }
  async deleteTeam(teamId: string): Promise<void> {
    await db.equipes.delete(teamId);
    this.addSync('Equipe', teamId, 'delete');
  }
  async getTeamsByManager(managerId: string): Promise<Equipe[]> {
    return db.equipes
      .filter(team => team.managerIds.includes(managerId))
      .toArray();
  }
  async getTeam(teamId: string): Promise<Equipe | undefined> {
    return db.equipes.get(teamId);
  }
  async importTeams(equipes: Equipe[]) {
    await db.equipes.bulkPut(equipes);
  }


  //=======================================================//
  // Managers
  //=======================================================//
  async addManager(manager: Manager): Promise<Manager> {
    await db.local_users.add(manager);
    return manager;
  }
  async getManager(managerId: string): Promise<Manager | undefined> {
    return db.local_users.get(managerId);
  }

  //=======================================================//
  // ActionSync
  //=======================================================//
  private async addSync(objectType: SyncObjectType, objectId: string, actionType: SyncActionType): Promise<void> {
    // Verification qu'il est necessaire de creer une nouvelle action de synchronisation
    const previousPendingActions = (await this.getPendingSyncs())
      .filter(sync => sync.objectType === objectType 
        && sync.status === 'pending'
        && sync.objectId === objectId);
    if (previousPendingActions.length) {
      if (actionType === 'update') {
        const deleteAction = previousPendingActions.find(sync => sync.actionType === 'delete');
        if (deleteAction) {
          throw new Error("Cannot update an object previously deleted!")
        }
        const createAction = previousPendingActions.find(sync => sync.actionType === 'create');
        if (createAction) {
          // On garde seulement le create
          return Promise.resolve();
        }
        const updateAction = previousPendingActions.find(sync => sync.actionType === 'update');
        if (updateAction) {
          // On garde seulement un seul update
          return Promise.resolve();
        }
      } else if (actionType === 'create') {
        const createAction = previousPendingActions.find(sync => sync.actionType === 'create');
        if (createAction) {
          // On garde seulement le 1er create
          return Promise.resolve();
        }
      }
    }

    // console.debug('Creation de la synchronisation pour ', objectType, objectId, actionType);
    // creation de l'action de synchronisation
    const d = new Date().toISOString();
    const sansId: Omit<SyncAction, 'id'> = {
      createdAt: d,
      objectId,
      objectType,
      actionType,
      status: 'pending',
      updatedAt: d      
    };

    // Stockage de l'action de synchronisation
    const id = await db.sync_actions.add(sansId as any);
    await this.calculPendingSyncs();
  }

  async updateSync(sync: SyncAction) {
    sync.updatedAt = new Date().toISOString();
    await db.sync_actions.put(sync);
  }

  async deleteSync(syncId: number): Promise<void> {
    await db.sync_actions.delete(syncId);
    await this.calculPendingSyncs();
  }

  async deleteSyncsByStatus(status: SyncActionStatus): Promise<void> {
    const syncs = await this.getSyncs(status);
    await db.sync_actions.bulkDelete(syncs.map(sync => sync.id));
    await this.calculPendingSyncs();
  }

  async getPendingSyncs(): Promise<SyncAction[]> {
    return this.getSyncs('pending');
  }
  async getSyncs(status: SyncActionStatus|undefined): Promise<SyncAction[]> {
    let q: any = db.sync_actions;
    q = status ? q.where('status').equals(status) : q;
    return q.toArray();
  }

  /** calcul le nombre de synchronisation a faire lors du demarrage */
  public async calculPendingSyncs() {
    this.currentPendingSyncSubject.next((await this.getPendingSyncs()).length);
  }  

  //=======================================================//
  // Bulk operations
  //=======================================================//
  async clearDatabase(): Promise<void> {
    await db.delete();
  }

  async exportDatabase(): Promise<any> {
    return {
      managers: await db.local_users.toArray(),
      equipes: await db.equipes.toArray(),
      matches: await db.matches.toArray(),
      evenements: await db.evenements.toArray(),
      operations_queue: await db.sync_actions.toArray()
    };
  }

  async importDatabase(data: any): Promise<void> {
    await db.transaction('rw', [
      db.local_users, db.equipes, db.matches, db.evenements, db.sync_actions
    ], async () => {
      if (data.managers) await db.local_users.bulkAdd(data.managers);
      if (data.equipes) await db.equipes.bulkAdd(data.equipes);
      if (data.matches) await db.matches.bulkAdd(data.matches);
      if (data.evenements) await db.evenements.bulkAdd(data.evenements);
      if (data.operations_queue) await db.sync_actions.bulkAdd(data.operations_queue);
    });
  }
}
