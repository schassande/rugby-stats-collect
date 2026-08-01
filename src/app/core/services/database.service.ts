import { Injectable } from '@angular/core';
import { db } from '../db/rugby-stats.database';
import { Evenement, Match, Equipe, Manager, Saison, SyncAction, SyncObjectType, SyncActionType } from '../models/datamodel';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private currentPendingSyncSubject = new BehaviorSubject<number>(0);
  currentPendingSync$ = this.currentPendingSyncSubject.asObservable();

  constructor() {
    this.calculPendingSyncs();
  }

  //=======================================================//
  // Events
  //=======================================================//
  async addEvent(event: Omit<Evenement, 'id'>): Promise<Evenement> {
    const id = await db.evenements.add(event as any);
    this.addSync('Evenement', id, 'create');
    return { ...event, id } as Evenement;
  }
  async updateEvent(event: Evenement): Promise<void> {
    await db.evenements.put(event);
    this.addSync('Evenement', event.id, 'update');
  }
  async deleteEvent(eventId: number): Promise<void> {
    await db.evenements.delete(eventId);
    this.addSync('Evenement', eventId, 'delete');
  }
  async getEventsByMatch(matchId: number): Promise<Evenement[]> {
    const events = await db.evenements.where('matchId').equals(matchId).toArray();
    return events.sort((a, b) => b.instant.localeCompare(a.instant));
  }
  async getEvent(eventId: number): Promise<Evenement | undefined> {
    return db.evenements.get(eventId);
  }
  async importEvents(evenements: Evenement[]) {
    await db.evenements.bulkPut(evenements);
  }


  //=======================================================//
  // Matches
  //=======================================================//
  async addMatch(match: Omit<Match, 'id'>): Promise<Match> {
    const id = await db.matches.add(match as any);
    this.addSync('Match', id, 'create');
    return { ...match, id } as Match;
  }
  async updateMatch(match: Match): Promise<void> {
    await db.matches.put(match);
    this.addSync('Match', match.id, 'update');
  }
  async deleteMatch(matchId: number): Promise<void> {
    await db.matches.delete(matchId);
    this.addSync('Match', matchId, 'delete');
  }
  async getMatchesByTeam(teamId: number): Promise<Match[]> {
    return db.matches.where('equipeId').equals(teamId).toArray();
  }
  async getMatchesByTeamNSeason(teamId: number, season: Saison): Promise<Match[]> {
    return db.matches
      .where('equipeId')
      .equals(teamId)
      .filter(match => match.saison === season)
      .toArray();
  }
  async getMatch(matchId: number): Promise<Match | undefined> {
    return db.matches.get(matchId);
  }
  async importMatches(matchs: Match[]) {
    await db.matches.bulkPut(matchs);
  }


  //=======================================================//
  // Teams
  //=======================================================//
  async addTeam(team: Omit<Equipe, 'id'>): Promise<Equipe> {
    const id = await db.equipes.add(team as any);
    this.addSync('Equipe', id, 'create');
    return { ...team, id } as Equipe;
  }
  async updateTeam(team: Equipe): Promise<void> {
    await db.equipes.put(team);
    this.addSync('Equipe', team.id, 'update');
  }
  async deleteTeam(teamId: number): Promise<void> {
    await db.equipes.delete(teamId);
    this.addSync('Equipe', teamId, 'delete');
  }
  async getTeamsByManager(managerId: string): Promise<Equipe[]> {
    return db.equipes
      .filter(team => team.managerIds.includes(managerId))
      .toArray();
  }
  async getTeam(teamId: number): Promise<Equipe | undefined> {
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
  private async addSync(objectType: SyncObjectType, objectId: number, actionType: SyncActionType): Promise<void> {
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

    // creation de l'action de synchronisation
    const d = new Date().toISOString();
    const syncAction: SyncAction = {
      id: 0,
      createdAt: d,
      objectId,
      objectType,
      actionType,
      status: 'pending',
      updatedAt: d      
    };

    // Stockage de l'action de synchronisation
    const res = db.sync_actions.add(syncAction);
    await this.calculPendingSyncs();
    return res;
  }

  async updateSync(sync: SyncAction) {
    await db.sync_actions.put(sync);
  }

  async getPendingSyncs(): Promise<SyncAction[]> {
    return db.sync_actions.where('status').equals('pending').toArray();
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

  async createAllSyncActionsFromDB() {
    (await db.equipes.toArray()).forEach( equipe => {
      this.addSync('Equipe', equipe.id, 'create')
    });
    (await db.matches.toArray()).forEach( match => {
      this.addSync('Match', match.id, 'create')
    });
    (await db.evenements.toArray()).forEach( evt => {
      this.addSync('Evenement', evt.id, 'create')
    });
  }
}
