import React, { createContext, useContext, useState, useEffect } from 'react';

// Define a user type that includes background fields
interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
  backgroundSoftware?: string;
  backgroundHardware?: string;
  backgroundDescription?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, sessionId: string) => void;
  logout: () => void;
  signup: (email: string, sessionId: string) => void;
  fetchCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: false,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  signup: () => {},
  fetchCurrentUser: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true to check for existing session
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch current user session from better-auth
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/get-session', {
        credentials: 'include', // Include cookies for session management
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            backgroundSoftware: data.user.backgroundSoftware,
            backgroundHardware: data.user.backgroundHardware,
            backgroundDescription: data.user.backgroundDescription,
            createdAt: data.user.createdAt,
          };
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          // No active session
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // Error getting session
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching current session:', error);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Check for existing session on component mount
  useEffect(() => {
    fetchCurrentUser().finally(() => {
      setLoading(false);
    });
  }, []);

  const login = (email: string, sessionId: string) => {
    // With better-auth, session is managed via cookies, so we just fetch the user
    setLoading(true);
    setTimeout(() => {
      fetchCurrentUser().finally(() => {
        setLoading(false);
      });
    }, 500);
  };

  const signup = (email: string, sessionId: string) => {
    // With better-auth, session is managed via cookies, so we just fetch the user
    setLoading(true);
    setTimeout(() => {
      fetchCurrentUser().finally(() => {
        setLoading(false);
      });
    }, 500);
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:3001/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include', // Include cookies for session management
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated,
    login,
    logout,
    signup,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
