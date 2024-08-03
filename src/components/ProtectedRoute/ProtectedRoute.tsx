import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { authToken } = useAuth();
  const location = useLocation();

  console.log('authToken protected route', authToken);

  if (!authToken) {
    return <Navigate to="/signIn" state={{ from: location }} replace />;
  }

  return children;
};
