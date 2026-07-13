import { Injectable } from '@angular/core';
import { db, LocalUser } from '../db/rugby-stats.database';

@Injectable({ providedIn: 'root' })
export class LocalAuthService {
  private static readonly SALT = 'rugby_local_salt_v1';

  constructor() {}

  private async hash(password: string): Promise<string> {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(LocalAuthService.SALT + password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback simple hash (not secure) if SubtleCrypto unavailable
      let h = 0;
      const s = LocalAuthService.SALT + password;
      for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i);
        h |= 0;
      }
      return Math.abs(h).toString(16);
    }
  }

  async createLocalUser(email: string, password: string, prenom = '', nom = ''): Promise<LocalUser> {
    const existing = await db.local_users.get(email);
    if (existing) {
      throw new Error('Local user already exists');
    }

    const passwordHash = await this.hash(password);
    const now = new Date().toISOString();
    const user: LocalUser = {
      id: email,
      passwordHash,
      prenom,
      nom,
      createdAt: now,
      updatedAt: now
    };

    await db.local_users.add(user);
    return user;
  }

  async verifyLocalUser(email: string, password: string): Promise<LocalUser | null> {
    const user = await db.local_users.get(email);
    if (!user) return null;
    const passwordHash = await this.hash(password);
    if (passwordHash === user.passwordHash) return user;
    return null;
  }

  async getAllLocalUsers(): Promise<LocalUser[]> {
    return db.local_users.toArray();
  }

  async deleteLocalUser(email: string): Promise<void> {
    await db.local_users.delete(email);
  }
}
