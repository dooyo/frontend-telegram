import { SDKProvider, useLaunchParams } from '@tma.js/sdk-react';
import { type FC, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AppRoot } from '@telegram-apps/telegram-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { AuthProvider } from '../context/AuthContext';
import { routes } from '@/navigation/routes.tsx';

const queryClient = new QueryClient();

const ErrorBoundaryError: FC<{ error: unknown }> = ({ error }) => (
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

const Inner: FC = () => {
  const debug = useLaunchParams().startParam === 'debug';

  // Enable debug mode to see all the methods sent and events received.
  useEffect(() => {
    if (debug) {
      import('eruda').then((lib) => lib.default.init());
    }
  }, [debug]);

  return (
    <AppRoot>
      <QueryClientProvider client={queryClient}>
        <SDKProvider acceptCustomStyles debug={debug}>
          <AuthProvider>
            <Routes>
              {routes.map((route) => (
                <Route key={route.path} {...route} />
              ))}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AuthProvider>
        </SDKProvider>
      </QueryClientProvider>
    </AppRoot>
  );
};

export const Root: FC = () => (
  <ErrorBoundary fallback={ErrorBoundaryError}>
    <BrowserRouter>
      <Inner />
    </BrowserRouter>
  </ErrorBoundary>
);
