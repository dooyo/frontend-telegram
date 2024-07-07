import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SDKProvider, useLaunchParams } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { AuthProvider } from '@/context/AuthContext';
import { routes } from '@/navigation/routes.tsx';
import { AppLayout } from '@/components/AppLayout/AppLayout';

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

const Inner: React.FC = () => {
  const debug = useLaunchParams().startParam === 'debug';

  return (
    <AppRoot>
      <QueryClientProvider client={queryClient}>
        <SDKProvider acceptCustomStyles debug={debug}>
          <AuthProvider>
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
          </AuthProvider>
        </SDKProvider>
      </QueryClientProvider>
    </AppRoot>
  );
};

export const Root: React.FC = () => (
  <ErrorBoundary fallback={ErrorBoundaryError}>
    <BrowserRouter>
      <Inner />
    </BrowserRouter>
  </ErrorBoundary>
);
