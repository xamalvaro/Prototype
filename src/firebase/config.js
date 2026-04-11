import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDy_nj1-nBtcTeiRqYv3LIRqcV__n3WiqU",
  authDomain: "newspace-f9969.firebaseapp.com",
  projectId: "newspace-f9969",
  storageBucket: "newspace-f9969.firebasestorage.app",
  messagingSenderId: "871094731311",
  appId: "1:871094731311:web:636ff2db17f6baa5167cda",
  measurementId: "G-851V5GRE6H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
