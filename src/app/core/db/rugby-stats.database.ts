import { Equipe, Evenement, Manager, Match, SyncAction } from '@core/models/datamodel';
import Dexie, { Table } from 'dexie';


export interface LocalUser extends Manager {
  passwordHash?: string;
}


export class RugbyStatsDB extends Dexie {
  local_users!: Table<LocalUser, string>;
  equipes!: Table<Equipe>;
  matches!: Table<Match>;
  evenements!: Table<Evenement>;
  sync_actions!: Table<SyncAction>;

  constructor() {
    super('RugbyStatsDB');
    this.version(1).stores({
      local_users: 'id',
      managers: '++id',
      equipes: '++id, saison',
      matches: '++id, equipeId, date',
      evenements: '++id, matchId',
      sync_actions: '++id, status, createdAt',
    });
    //console.log('Local database started.');
  }
}

export const db = new RugbyStatsDB();
