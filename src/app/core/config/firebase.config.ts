import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB34c1ZhTQgYDMDcw-HDA38ZLyBM5HybX4",
  authDomain: "rugby-stats-collect.firebaseapp.com",
  projectId: "rugby-stats-collect",
  storageBucket: "rugby-stats-collect.firebasestorage.app",
  messagingSenderId: "172993693663",
  appId: "1:172993693663:web:569353efcd223124cf666a"
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
try {
  await setPersistence(auth, browserLocalPersistence);
} catch (error) {
  console.error('Unable to configure Firebase auth persistence:', error);
}
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, 'rugby-stats-collect');
