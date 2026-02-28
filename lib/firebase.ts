import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCkiUKj3eAE3_oY2BVxp27FK6Jvqgp42Qw",
  authDomain: "daibeto.firebaseapp.com",
  projectId: "daibeto",
  storageBucket: "daibeto.firebasestorage.app",
  messagingSenderId: "608716427623",
  appId: "1:608716427623:web:9114909b1c9e753e51dfc2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;