import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { authApi } from '../api/auth';
import { clearAuth, getStoredAuth, storeAuth } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => {
      logout();
    };

    const bootstrapAuth = async () => {
      try {
        const { token: storedToken, user: storedUser } = getStoredAuth();
        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(storedUser);
          }

          try {
            const profile = await authApi.getProfile();
            const resolvedUser = profile?.user ?? profile;
            setUser(resolvedUser ?? storedUser ?? null);
            storeAuth({ token: storedToken, user: resolvedUser ?? storedUser ?? null });
          } catch (profileError) {
            console.warn('Failed to refresh profile', profileError);
            logout();
          }
        }
      } finally {
        setInitializing(false);
      }
    };

    bootstrapAuth();
    window.addEventListener('auth:logout', handleForcedLogout);

    return () => {
      window.removeEventListener('auth:logout', handleForcedLogout);
    };
  }, [logout]);

  const login = useCallback(async (credentials) => {
    setAuthLoading(true);
    try {
      const data = await authApi.login(credentials);
      const receivedToken = data?.token;
      const receivedUser = data?.user ?? null;

      if (!receivedToken) {
        throw new Error('Missing token in login response');
      }

      setToken(receivedToken);
      setUser(receivedUser);
      storeAuth({ token: receivedToken, user: receivedUser });
      setError(null);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Authentication failed';
      setError(message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setAuthLoading(true);
    try {
      const data = await authApi.register(payload);
      const autoLogin = data?.token && data?.user;

      if (autoLogin) {
        storeAuth({ token: data.token, user: data.user });
        setToken(data.token);
        setUser(data.user);
      }

      setError(null);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      initializing,
      error,
      login,
      register,
      logout
    }),
    [user, token, authLoading, initializing, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
