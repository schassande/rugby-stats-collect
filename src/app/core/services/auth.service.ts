import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { auth, db, isFirebaseConfigured } from '../config/firebase.config';
import { Manager } from '@core/models/datamodel';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private currentManagerSubject = new BehaviorSubject<Manager | null>(null);
  public currentManager$ = this.currentManagerSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    if (isFirebaseConfigured && auth && db) {
      this.setupAuthListener();
    }
  }

  private setupAuthListener(): void {
    if (!auth) {
      return;
    }

    onAuthStateChanged(auth, async (user) => {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(!!user);

      if (user) {
        await this.loadManager(user);
      } else {
        this.currentManagerSubject.next(null);
      }
    });
  }

  private async loadManager(user: User): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      this.currentManagerSubject.next(null);
      return;
    }

    try {
      const managerDoc = await getDoc(doc(db, 'managers', user.uid));
      if (managerDoc.exists()) {
        this.currentManagerSubject.next(managerDoc.data() as Manager);
      } else {
        this.currentManagerSubject.next(null);
      }
    } catch {
      this.currentManagerSubject.next(null);
    }
  }

  async signUpWithEmail(email: string, password: string, prenom: string, nom: string): Promise<void> {
    if (!isFirebaseConfigured || !auth || !db) {
      throw new Error('Firebase n\'est pas configuré. Ajoutez votre configuration Firebase réelle.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const manager: Manager = {
      id: user.uid,
      prenom,
      nom,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'managers', user.uid), manager);
    this.currentManagerSubject.next(manager);
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase n\'est pas configuré. Ajoutez votre configuration Firebase réelle.');
    }

    await signInWithEmailAndPassword(auth, email, password);
  }

  async signInWithGoogle(): Promise<void> {
    if (!isFirebaseConfigured || !auth || !db) {
      throw new Error('Firebase n\'est pas configuré. Ajoutez votre configuration Firebase réelle.');
    }

    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  }

  async handleGoogleRedirectResult(): Promise<boolean> {
    if (!isFirebaseConfigured || !auth || !db) {
      return false;
    }

    const result = await getRedirectResult(auth);
    const user = result?.user || auth.currentUser;
    if (!user) {
      return false;
    }

    const manager: Manager = {
      id: user.uid,
      prenom: user.displayName?.split(' ')[0] || '',
      nom: user.displayName?.split(' ')[1] || '',
      email: user.email || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'managers', user.uid), manager, { merge: true });
    this.currentManagerSubject.next(manager);
    return true;
  }

  async signOut(): Promise<void> {
    if (!auth) {
      return;
    }

    this.currentManagerSubject.next(null);
    await signOut(auth);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentManager(): Manager | null {
    return this.currentManagerSubject.value;
  }

  isAuthenticated(): boolean {
    return !!auth?.currentUser || this.isAuthenticatedSubject.value;
  }

  getIdToken(): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) {
      return Promise.resolve(null);
    }
    return user.getIdToken();
  }
}
