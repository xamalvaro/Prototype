import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './config';
import { createUserDocument, isUsernameTaken } from './firestore';

export async function signUp(email, password, username, displayName) {
  // Create the Firebase Auth user first so we are authenticated
  // before querying Firestore (required by security rules)
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  try {
    const taken = await isUsernameTaken(username);
    if (taken) {
      await user.delete();
      const err = new Error('Username already taken');
      err.code = 'auth/username-taken';
      throw err;
    }
    await createUserDocument(user.uid, { email, username, displayName });
    return user;
  } catch (err) {
    // If anything after auth creation fails, clean up the auth account
    if (err.code !== 'auth/username-taken') {
      try { await user.delete(); } catch {}
    }
    throw err;
  }
}

export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}
