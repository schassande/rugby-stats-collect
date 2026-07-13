import { beforeEach, describe, expect, it, vi } from 'vitest';

const { signInWithPopupMock, signInWithRedirectMock } = vi.hoisted(() => ({
  signInWithPopupMock: vi.fn(),
  signInWithRedirectMock: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(function () {
    return {};
  }),
  signInWithPopup: signInWithPopupMock,
  signInWithRedirect: signInWithRedirectMock,
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
  getRedirectResult: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn()
}));

vi.mock('../config/firebase.config', () => ({
  auth: {},
  db: {},
  isFirebaseConfigured: true
}));

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    signInWithPopupMock.mockReset();
    signInWithRedirectMock.mockReset();
  });

  it('uses redirect authentication for Google sign-in to avoid popup blockers', async () => {
    signInWithRedirectMock.mockResolvedValue(undefined);
    const service = new AuthService();

    await service.signInWithGoogle();

    expect(signInWithRedirectMock).toHaveBeenCalledTimes(1);
    expect(signInWithPopupMock).not.toHaveBeenCalled();
  });
});
