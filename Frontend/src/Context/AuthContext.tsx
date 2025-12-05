import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { autoLogin, isAuthenticated } from '../Services/ApiServices';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // If token exists in localStorage, try auto-login
      if (isAuthenticated()) {
        const success = await autoLogin();
        setAuthenticated(success);
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthenticated(false);
    } finally {
      setIsLoading(false);
      setIsAuthChecked(true);
    }
  };

  // Run auto-login on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        isLoading: isAuthChecked ? false : isLoading,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

