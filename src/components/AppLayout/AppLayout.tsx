import React, { ReactNode } from 'react';
import { NavBar } from '@/components/NavBar/NavBar';
import './AppLayout.css';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <div className="content">{children}</div>
      <NavBar />
    </div>
  );
};
