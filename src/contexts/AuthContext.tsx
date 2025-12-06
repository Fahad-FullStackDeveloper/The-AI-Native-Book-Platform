import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import firebase from 'firebase/app';

interface AuthContextType {
  currentUser: firebase.User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Save user data to NeonDB
        try {
          const response = await fetch('http://localhost:3001/save-user', { // Assuming backend runs on 3001
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email, // Use display name if available, otherwise email
            }),
          });
          const data = await response.json();
          if (!response.ok) {
            console.error('Failed to save user data to NeonDB:', data.error);
          } else {
            console.log('User data saved to NeonDB:', data.user);
          }
        } catch (error) {
          console.error('Error connecting to backend to save user data:', error);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
