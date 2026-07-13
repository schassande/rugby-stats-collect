import Dexie, { Table } from 'dexie';

export interface LocalUser {
  id: string; // email as primary key
  passwordHash: string;
  prenom?: string;
  nom?: string;
  createdAt: string;
  updatedAt: string;
}

export class RugbyStatsDB extends Dexie {
  local_users!: Table<LocalUser, string>;

  constructor() {
    super('RugbyStatsDB');
    this.version(1).stores({
      local_users: 'id'
    });
  }
}

export const db = new RugbyStatsDB();
