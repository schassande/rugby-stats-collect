import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User, UserCredential } from 'firebase/auth';
import { doc, enableNetwork, getDoc, getDocFromServer, setDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { auth, db as firestoreDatabase } from '../config/firebase.config';
import { Manager } from '@core/models/datamodel';
import { db as localDatabase, LocalUser } from '../db/rugby-stats.database';

export type AuthMode = 'local' | 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly SALT = 'rugby_local_salt_v1';
  private static readonly LOCAL_STORAGE_AUTH_MODE = 'auth_mode';
  private static readonly LOCAL_STORAGE_AUTO_LOGIN = 'auto_login_local';

  /** User firebase */
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  /** User applicatif */
  private currentManagerSubject = new BehaviorSubject<Manager | null>(null);
  public currentManager$ = this.currentManagerSubject.asObservable();


  public async checkFirebaseUserConnected(): Promise<void> {
    const firebaseUser = auth?.currentUser;
    if (!firebaseUser) {
      console.error('Aucun utilisateur Firebase authentifié.')
      throw new Error('Aucun utilisateur Firebase authentifié.');
    }

    try {
      await firebaseUser.getIdToken(true);
    } catch (error) {
      console.error('Le token Firebase n est plus valide.', error);
      try {
        await auth.currentUser!.reload();
        await firebaseUser.getIdToken(true);
      } catch(err) {
        throw new Error('Le token Firebase n est plus valide et il n est pas possible de le rafraichir', { cause: err });
      }
    }
  }
  /**
   * Enregistrement de l'utilisateur par son email.
   * @param email 
   * @param password 
   * @param prenom 
   * @param nom 
   * @returns 
   */
  public async registerWithEmail(email: string, password: string, prenom: string, nom: string): Promise<void> {
    // creation de l'utilisateur dans firebase
    const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
    const user = userCredential.user;
    const d = new Date().toISOString();
    // creation du manager
    const manager: Manager = {
      id: email,
      prenom,
      nom,
      createdAt: d,
      updatedAt: d
    };
    // enregistrement du manager dans firestore
    await setDoc(doc(firestoreDatabase, 'managers', manager.id), manager);

    // Enregistrement du manager dans la base local
    this.saveLocalUser(manager, password);

    this.currentUserSubject.next(user);
    this.currentManagerSubject.next(manager);
  }

  public async loginLocal(localUser: LocalUser): Promise<void> {
    this.currentManagerSubject.next(localUser);
  }

  public async loginWithEmail(email: string, password: string, ): Promise<void> {
    if (this.getAuthMode() === 'local') {
      const localUser = await this.verifyLocalUser(email, password);
      if (!localUser) {
        throw new Error('Invalid credentials');
      }
      this.currentManagerSubject.next(localUser);
      
    } else if (this.getAuthMode() === 'firebase') {
      const fbUser = await signInWithEmailAndPassword(auth!, email, password);
      await this.manageFirebaseAuthResult(fbUser, password);
    }
  }

  /**
   * Configures Firebase auth persistence and resolves once the initial auth state is restored.
   */
  public async initializeAuthPersistenceAndRestoreSession(): Promise<void> {
    // enableNetwork(db);
    await new Promise<void>((resolve) => {
      let firstEmission = true;
      onAuthStateChanged(auth, (fbUser) => {
        console.log('onAuthStateChanged:', fbUser, fbUser?.metadata.lastSignInTime);
        if (!fbUser) {
          if (firstEmission) { firstEmission = false; resolve(); }
          return;
        }
        fbUser.reload()
            .then(() => this.manageFirebaseAuthUser(fbUser))
            .catch(error => {
              console.warn('Profil Firestore indisponible au démarrage:', error);
              this.currentUserSubject.next(fbUser);
            })
            .finally(() => {
              if (firstEmission) { firstEmission = false; resolve(); }
            });
      });
    });
  }

  public async loginWithGoogle(): Promise<void> {
    const fbUser = await signInWithPopup(auth,new GoogleAuthProvider());
    await this.manageFirebaseAuthResult(fbUser)
  }

  public isAutoLoginLocalEnabled(): boolean {
    return localStorage.getItem(AuthService.LOCAL_STORAGE_AUTO_LOGIN) === 'true';
  }

  public setAutoLoginLocalEnabled(enabled: boolean): void {
    localStorage.setItem(AuthService.LOCAL_STORAGE_AUTO_LOGIN, String(enabled));
  }

  public async initializeAutoLoginLocal(): Promise<void> {
    if (!this.isAutoLoginLocalEnabled() || auth?.currentUser || this.currentManagerSubject.value) return;
    try {
      const users = await this.getLocalUsers();
      if (users.length === 1 && !auth?.currentUser && !this.currentManagerSubject.value) {
        await this.loginLocal(users[0]);
      }
    } catch (error) {
      console.error('Erreur pendant l’auto-login local', error);
    }
  }

  private async manageFirebaseAuthResult(fbUser: UserCredential|null, password: string = ''): Promise<void> {
    if (fbUser)
      await this.manageFirebaseAuthUser(fbUser?.user);
  }
  private async manageFirebaseAuthUser(user: User|null, password: string = ''): Promise<void> {
    const email = user?.email;
    if (!email) {
      throw new Error('Invalid credentials');
    }
    // authentification ok avec Firebase
    // console.log('manageFirebaseAuthResult, load manager with email', email);
    let manager: Manager;
    try {
      const docRef = doc(firestoreDatabase!, 'managers', email);
      const managerDoc = await getDocFromServer(docRef);
      if (managerDoc.exists()) {
        manager = managerDoc.data() as Manager;
      } else {
        // L'utilisateur a un compte pour s'authentifier mais il n'a pas de user dans l'application
        // ça a pu planter entre les 2 actions ou simplement c'est une auth google.
        // => on recréé sont un utilisateur applicatif
        manager = {
          id: email,
          prenom: user.displayName || '',
          nom: user.displayName || '',
          createdAt: user.metadata.creationTime || '',
          updatedAt: user.metadata.creationTime || ''
        };

        // enregistrement du manager dans firestore
        await setDoc(doc(firestoreDatabase!, 'managers', manager.id), manager);
      }
    } catch(error) {
      console.error('Erreur pendant le traitement de la réponse Firebase', error);
      throw error;
    }
    // Enregistrement / Mise à jour du manager dans la base local
    this.saveLocalUser(manager, password);

    this.currentUserSubject.next(user);
    this.currentManagerSubject.next(manager);
  }

  public async signOut(): Promise<void> {
    this.setAutoLoginLocalEnabled(false);
    this.currentUserSubject.next(null);
    this.currentManagerSubject.next(null);
    if (this.getAuthMode() === 'firebase') {
      await signOut(auth!);
    }
  }

  public getCurrentManager(): Manager | null {
    return this.currentManagerSubject.value;
  }

  public isAuthenticated(): boolean {
    return !!auth?.currentUser || !!this.currentManagerSubject.value;
  }

  public getAuthMode(): AuthMode {
    const stored = localStorage.getItem(AuthService.LOCAL_STORAGE_AUTH_MODE);
    if (stored === 'local' || stored === 'firebase') {
      return stored;
    }
    return 'firebase';
  }

  public setAuthMode(authMode: AuthMode) {
    localStorage.setItem(AuthService.LOCAL_STORAGE_AUTH_MODE, authMode);
  }

  private async saveLocalUser(manager: Manager, password: string|undefined = undefined): Promise<LocalUser> {
    const existing = await localDatabase.local_users.get(manager.id);
    const passwordHash = password ? await this.hash(password) : (existing ? existing.passwordHash : '');
    const user: LocalUser = { ...manager, passwordHash };
    await  localDatabase.local_users.put(user, user.id);
    return user;
  }

  private async verifyLocalUser(email: string, password: string): Promise<LocalUser | null> {
    const user = await this.getLocalUser(email);
    if (!user) return null;
    const passwordHash = await this.hash(password);
    if (passwordHash === user.passwordHash) return user;
    return null;
  }

  private async getLocalUser(email: string): Promise<LocalUser | undefined> {
    return await localDatabase.local_users.get(email);
  }
  public async getLocalUsers(): Promise<LocalUser[]> {
    return await localDatabase.local_users.toArray();
  }

  public async deleteLocalUser(email: string): Promise<void> {
    await localDatabase.local_users.delete(email);
  }

  private async hash(password: string): Promise<string> {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(AuthService.SALT + password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback simple hash (not secure) if SubtleCrypto unavailable
      let h = 0;
      const s = AuthService.SALT + password;
      for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i);
        h |= 0;
      }
      return Math.abs(h).toString(16);
    }
  }
}
