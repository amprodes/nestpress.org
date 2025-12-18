/**
 * Authentication Context
 * Manages user authentication state, JWT tokens, and auth-related operations
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { authApi, tokenManager, ApiUser } from '../services/api';

// ============================================
// Types
// ============================================

export interface AuthState {
  user: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (user: Partial<ApiUser>) => void;
}

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (tokenManager.isAuthenticated()) {
        try {
          const userData = await authApi.getProfile();
          setUser(userData);
        } catch (err) {
          // Token might be expired, try to refresh
          const refreshed = await authApi.refreshToken();
          if (refreshed) {
            try {
              const userData = await authApi.getProfile();
              setUser(userData);
            } catch {
              tokenManager.clearTokens();
            }
          } else {
            tokenManager.clearTokens();
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Listen for logout events from API client
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  // Login handler
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      setIsLoading(false);
      // Dispatch login event so CMSContext can re-fetch data
      window.dispatchEvent(new CustomEvent('auth:login'));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Register handler
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register(data);
      setUser(response.user);
      setIsLoading(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Logout handler
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors, just clear local state
    }
    setUser(null);
    setIsLoading(false);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!tokenManager.isAuthenticated()) return;

    try {
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch {
      // Silently fail - user will be logged out on next action
    }
  }, []);

  // Update user data locally (for optimistic updates)
  const updateUser = useCallback((updates: Partial<ApiUser>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Memoized context value
  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser,
    updateUser,
  }), [user, isLoading, error, login, register, logout, clearError, refreshUser, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// Hook
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================
// Higher Order Component for Protected Routes
// ============================================

interface WithAuthProps {
  fallback?: ReactNode;
  requiredRoles?: string[];
}

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthProps = {}
) => {
  const WithAuthComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const { fallback, requiredRoles } = options;

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return fallback ? <>{fallback}</> : null;
    }

    // Check for required roles
    if (requiredRoles && requiredRoles.length > 0 && user) {
      if (!requiredRoles.includes(user.role)) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
              <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
            </div>
          </div>
        );
      }
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
};

// ============================================
// Auth Guard Component
// ============================================

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRoles?: string[];
  onUnauthenticated?: () => void;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requiredRoles,
  onUnauthenticated,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && onUnauthenticated) {
      onUnauthenticated();
    }
  }, [isLoading, isAuthenticated, onUnauthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  // Check for required roles
  if (requiredRoles && requiredRoles.length > 0 && user) {
    if (!requiredRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
            <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mt-1">Required role: {requiredRoles.join(', ')}</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default AuthContext;
