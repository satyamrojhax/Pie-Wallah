import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { isTokenValid, logout, getStoredUserData, handleAuthError } from "@/lib/auth.js";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  checkAuth: () => Promise<void>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const checkAuth = async () => {
    try {
      // Check if token is valid
      if (isTokenValid()) {
        const userData = getStoredUserData();
        setIsAuthenticated(true);
        setUser(userData);
      } else {
        // Token is expired or invalid, logout
        logout();
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    handleAuthError();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Set up periodic token validation
  useEffect(() => {
    if (isAuthenticated) {
      // Check token validity every 5 minutes
      const interval = setInterval(() => {
        if (!isTokenValid()) {
          logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Listen for storage events (for multi-tab logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'param_auth_token' && !e.newValue) {
        // Token was removed in another tab
        logout();
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOffline = () => {
      // User went offline - don't logout, just show offline state
      console.log('User is offline');
    };

    const handleOnline = () => {
      // User came back online - check if token is still valid
      console.log('User is online, checking auth...');
      checkAuth();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    // Check authentication on mount only
    checkAuth();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    checkAuth,
    logoutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
