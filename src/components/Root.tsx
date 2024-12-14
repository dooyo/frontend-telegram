import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};

export const Root: React.FC = () => (
  <ErrorBoundary fallback={ErrorBoundaryError}>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Inner />
    </BrowserRouter>
  </ErrorBoundary>
);
