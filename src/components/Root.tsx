import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LimitsProvider } from '@/context/LimitsContext';
import { routes } from '@/navigation/routes.tsx';
import { AppLayout } from '@/components/AppLayout/AppLayout';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

const queryClient = new QueryClient();

const ErrorBoundaryError: React.FC<{ error: unknown }> = ({ error }) => (
  <div>
    <p>An unhandled error occurred:</p>
    <blockquote>
      <code>
        {error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : JSON.stringify(error)}
      </code>
    </blockquote>
  </div>
);

const DeepLinkHandler: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const navigate = useNavigate();
  const lp = retrieveLaunchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const handled = sessionStorage.getItem('handled_deep_link');
    if (isAuthenticated && !handled && lp.tgWebAppStartParam) {
      const parts = lp.tgWebAppStartParam.split('_');
      const type = parts[0]; // 'post' or 'profile'
      const id = parts[1];
      if (type === 'post' || type === 'profile') {
        navigate(`/${type}/${id}`);
        sessionStorage.setItem('handled_deep_link', 'true');
      }
    }
  }, [lp.startParam, navigate, isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

const Inner: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LimitsProvider>
          <DeepLinkHandler>
            <Routes>
              {routes.map(({ path, Component, layout }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    layout ? (
                      <AppLayout>
                        <Component />
                      </AppLayout>
                    ) : (
                      <Component />
                    )
                  }
                />
              ))}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </DeepLinkHandler>
        </LimitsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export const Root: React.FC = () => {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Inner />
      </BrowserRouter>
    </ErrorBoundary>
  );
};
