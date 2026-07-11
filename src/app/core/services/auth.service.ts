import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { auth, db, isFirebaseConfigured } from '../config/firebase.config';

export interface Manager {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

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

    onAuthStateChanged(auth, (user) => {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(!!user);
    });
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
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const manager: Manager = {
      id: user.uid,
      prenom: user.displayName?.split(' ')[0] || '',
      nom: user.displayName?.split(' ')[1] || '',
      email: user.email || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'managers', user.uid), manager, { merge: true });
  }

  async signOut(): Promise<void> {
    if (!auth) {
      return;
    }

    await signOut(auth);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getIdToken(): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) {
      return Promise.resolve(null);
    }
    return user.getIdToken();
  }
}
