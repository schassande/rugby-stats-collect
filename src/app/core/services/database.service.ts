import { Injectable } from '@angular/core';
import { db } from '../db/rugby-stats.database';
import { Evenement, Match, Equipe, Manager, SyncOperation } from '../models/datamodel';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  // Events
  async addEvent(event: Omit<Evenement, 'id'>): Promise<Evenement> {
    const id = await db.evenements.add(event as any);
    return { ...event, id } as Evenement;
  }

  async updateEvent(event: Evenement): Promise<void> {
    await db.evenements.put(event);
  }

  async deleteEvent(eventId: number): Promise<void> {
    await db.evenements.delete(eventId);
  }

  async getEventsByMatch(matchId: number): Promise<Evenement[]> {
    return db.evenements.where('matchId').equals(matchId).toArray();
  }

  async getEvent(eventId: number): Promise<Evenement | undefined> {
    return db.evenements.get(eventId);
  }


  // Matches
  async addMatch(match: Omit<Match, 'id'>): Promise<Match> {
    const id = await db.matches.add(match as any);
    return { ...match, id } as Match;
  }

  async updateMatch(match: Match): Promise<void> {
    await db.matches.put(match);
  }

  async deleteMatch(matchId: number): Promise<void> {
    await db.matches.delete(matchId);
  }

  async getMatchesByTeam(teamId: number): Promise<Match[]> {
    return db.matches.where('equipeId').equals(teamId).toArray();
  }

  async getMatch(matchId: number): Promise<Match | undefined> {
    return db.matches.get(matchId);
  }


  // Teams
  async addTeam(team: Omit<Equipe, 'id'>): Promise<Equipe> {
    const id = await db.equipes.add(team as any);
    return { ...team, id } as Equipe;
  }

  async updateTeam(team: Equipe): Promise<void> {
    await db.equipes.put(team);
  }

  async deleteTeam(teamId: number): Promise<void> {
    await db.equipes.delete(teamId);
  }

  async getTeamsByManager(managerId: string): Promise<Equipe[]> {
    return db.equipes
      .filter(team => team.managerIds.includes(managerId))
      .toArray();
  }

  async getTeam(teamId: number): Promise<Equipe | undefined> {
    return db.equipes.get(teamId);
  }


  // Managers
  async addManager(manager: Manager): Promise<Manager> {
    await db.local_users.add(manager);
    return manager;
  }

  async getManager(managerId: string): Promise<Manager | undefined> {
    return db.local_users.get(managerId);
  }


  // Bulk
  async clearDatabase(): Promise<void> {
    await db.delete();
  }

  
  async exportDatabase(): Promise<any> {
    return {
      managers: await db.local_users.toArray(),
      equipes: await db.equipes.toArray(),
      matches: await db.matches.toArray(),
      evenements: await db.evenements.toArray(),
      operations_queue: await db.operations_queue.toArray()
    };
  }

  async importDatabase(data: any): Promise<void> {
    await db.transaction('rw', [
      db.local_users, db.equipes, db.matches, db.evenements, db.operations_queue
    ], async () => {
      if (data.managers) await db.local_users.bulkAdd(data.managers);
      if (data.equipes) await db.equipes.bulkAdd(data.equipes);
      if (data.matches) await db.matches.bulkAdd(data.matches);
      if (data.evenements) await db.evenements.bulkAdd(data.evenements);
      if (data.operations_queue) await db.operations_queue.bulkAdd(data.operations_queue);
    });
  }
}
