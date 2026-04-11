import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserByUid } from '../firebase/firestore';

const AuthContext = createContext({
  currentUser: null,
  userProfile: null,
  loading: true,
  refreshUserProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserByUid(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function refreshUserProfile() {
    if (currentUser) {
      const profile = await getUserByUid(currentUser.uid);
      setUserProfile(profile);
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
