import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB34c1ZhTQgYDMDcw-HDA38ZLyBM5HybX4",
  authDomain: "rugby-stats-collect.firebaseapp.com",
  projectId: "rugby-stats-collect",
  storageBucket: "rugby-stats-collect.firebasestorage.app",
  messagingSenderId: "172993693663",
  appId: "1:172993693663:web:569353efcd223124cf666a"
};

const isPlaceholderConfig = (value: string): boolean =>
  value.includes('YOUR_') || value.includes('your-project') || value.includes('123456789') || value.includes('abcdef123456');

export const isFirebaseConfigured = Object.values(firebaseConfig).every((value) => typeof value === 'string' && !isPlaceholderConfig(value));

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = isFirebaseConfigured && app ? getAuth(app) : null;
export const db = isFirebaseConfigured && app ? getFirestore(app) : null;
