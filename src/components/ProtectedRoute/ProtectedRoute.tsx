import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const ProtectedRoute = ({
  children
}: {
  children: React.ReactElement;
}) => {
  const { isAuthenticated } = useAuth() as any;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signIn" state={{ from: location }} replace />;
  }

  return children;
};
