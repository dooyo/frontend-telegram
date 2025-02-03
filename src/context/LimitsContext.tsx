import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserLimits } from '@/lib/api/types';
import { getUserLimits } from '@/lib/api/profiles';
import { useAuth } from './AuthContext';

interface LimitsContextType {
  limits: UserLimits | null;
  isLoading: boolean;
  error: Error | null;
  refreshLimits: () => Promise<void>;
}

const LimitsContext = createContext<LimitsContextType | undefined>(undefined);

export const useLimits = () => {
  const context = useContext(LimitsContext);
  if (!context) {
    throw new Error('useLimits must be used within a LimitsProvider');
  }
  return context;
};

export const LimitsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchLimits = async () => {
    if (!isAuthenticated) {
      setLimits(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserLimits();
      setLimits(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch limits')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, [isAuthenticated]);

  const refreshLimits = async () => {
    await fetchLimits();
  };

  return (
    <LimitsContext.Provider value={{ limits, isLoading, error, refreshLimits }}>
      {children}
    </LimitsContext.Provider>
  );
};
