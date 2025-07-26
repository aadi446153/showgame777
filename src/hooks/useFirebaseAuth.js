import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth'; // Import sign-in methods
import { auth, initialAuthToken } from '../firebase/config'; // Import auth and token from config

const useFirebaseAuth = (setMessage) => {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Error signing in:", error);
          setMessage("Failed to sign in. Please try again.");
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [setMessage]); // Depend on setMessage to avoid stale closures if it changes

  return { userId, isAuthReady, auth };
};

export default useFirebaseAuth;
