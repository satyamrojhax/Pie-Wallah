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

  // Auto-logout system removed as requested

  // Multi-tab logout listener removed as requested

  // Online/offline event listeners simplified - no auto-logout
  useEffect(() => {
    const handleOffline = () => {
      // User went offline - just show offline state
      console.log('User is offline');
    };

    const handleOnline = () => {
      // User came back online
      console.log('User is online');
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
