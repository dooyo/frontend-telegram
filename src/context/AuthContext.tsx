import {
  useContext,
  createContext,
  useState,
  useEffect,
  PropsWithChildren
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { UserType } from '@/lib/types';

interface AuthContextProps {
  authToken: string | null;
  updateAuthToken: (newToken: string) => void;
  removeAuthToken: () => void;
  updateMe: (me: UserType) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const existingToken = localStorage.getItem('authToken');
    console.log('existingToken', existingToken);
    if (existingToken) {
      setAuthToken(existingToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (location.pathname.startsWith('/signUp')) return;
    if (location.pathname.startsWith('/otp')) return;
    if (!authToken) {
      console.log('No token... redirecting to /signIn', authToken);
      navigate('/signIn');
    } else {
      const decodedToken = jwtDecode<{ exp: number }>(authToken);
      console.log('decodedToken', decodedToken);
      if (decodedToken.exp && Date.now() >= decodedToken.exp * 1000) {
        console.log('Token expired... resetting', authToken);
        removeAuthToken();
        navigate('/signIn');
      }
    }
  }, [location.pathname, authToken, navigate, loading]);

  const updateAuthToken = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setAuthToken(newToken);
  };

  const updateMe = (me: UserType) => {
    localStorage.setItem('me', JSON.stringify(me));
  };

  const removeAuthToken = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
  };

  if (loading) {
    return <div>Loading...</div>; // or some loading spinner
  }

  return (
    <AuthContext.Provider
      value={{ authToken, updateAuthToken, removeAuthToken, updateMe }}
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
