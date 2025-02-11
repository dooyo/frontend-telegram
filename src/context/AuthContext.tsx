import {
  useContext,
  createContext,
  useState,
  useEffect,
  PropsWithChildren
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { UserType } from '@/lib/types';
import { authTgUser, getMe } from '@/lib/api/auth';
import { initData, useSignal, useLaunchParams } from '@telegram-apps/sdk-react';

interface AuthContextProps {
  authToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserType | null;
  updateAuthToken: (newToken: string) => void;
  removeAuthToken: () => void;
  updateMe: (me: UserType) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initDataRaw = useSignal(initData.raw);
  const lp = useLaunchParams();

  // Store referral info as soon as we have launch params
  useEffect(() => {
    if (lp.startParam) {
      const parts = lp.startParam.split('_');
      if (parts.length >= 4 && parts[2] === 'ref') {
        const fromUser = parts[3];
        sessionStorage.setItem('referral_from_user', fromUser);
      }
    }
  }, [lp.startParam]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const existingToken = localStorage.getItem('authToken');
        const existingUser = localStorage.getItem('me');

        if (existingToken && existingUser) {
          const decodedToken = jwtDecode<{ exp: number }>(existingToken);
          if (decodedToken.exp && Date.now() < decodedToken.exp * 1000) {
            // Even if we have stored user data, fetch fresh data to ensure it's up to date
            setAuthToken(existingToken);
            try {
              const freshUserData = await getMe(existingToken);
              setUser(freshUserData);
              localStorage.setItem('me', JSON.stringify(freshUserData));
            } catch (error) {
              console.error('Failed to fetch fresh user data:', error);
              setUser(JSON.parse(existingUser));
            }
          } else {
            // Token expired, try to re-authenticate
            if (!initDataRaw) {
              throw new Error('No Telegram init data available');
            }
            const { authToken: newToken, user: newUser } = await authTgUser(
              initDataRaw
            );
            setAuthToken(newToken);
            setUser(newUser);
          }
        } else {
          console.log('No existing auth, try to authenticate with Telegram');
          // No existing auth, try to authenticate with Telegram
          if (!initDataRaw) {
            throw new Error('No Telegram init data available');
          }
          const { authToken: newToken, user: newUser } = await authTgUser(
            initDataRaw
          );
          setAuthToken(newToken);
          setUser(newUser);
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        removeAuthToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [initDataRaw]);

  const updateAuthToken = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setAuthToken(newToken);
  };

  const updateMe = async (me: UserType) => {
    localStorage.setItem('me', JSON.stringify(me));
    setUser(me);
  };

  const removeAuthToken = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('me');
    setAuthToken(null);
    setUser(null);
  };

  if (isLoading) {
    return <div>Loading...</div>; // or some loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        authToken,
        isAuthenticated: !!authToken && !!user,
        isLoading,
        user,
        updateAuthToken,
        removeAuthToken,
        updateMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
