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
    this.version(2).stores({
      local_users: 'id', // id=email
      equipes: 'id', // id généré par l'application
      matches: 'id, equipeId, saison', // id généré par l'application, index equipeId et saison
      evenements: 'id, matchId, date', // id généré par l'application, index matchId
      sync_actions: '++id, status', // id généré Dexie, index status
    });
    console.log('Local database started.');
  }
}

export const db = new RugbyStatsDB();
