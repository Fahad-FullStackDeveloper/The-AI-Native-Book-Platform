import React, { createContext, useContext, useState } from 'react';

// Define a simpler user type
interface User {
  email: string;
  displayName?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Set loading to false initially

  // Mock login function
  const login = (email: string) => {
    setLoading(true);
    // Simulate an API call
    setTimeout(() => {
      setCurrentUser({ email });
      setLoading(false);
    }, 1000);
  };

  // Mock logout function
  const logout = () => {
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
