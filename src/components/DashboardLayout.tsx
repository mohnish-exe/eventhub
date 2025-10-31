import React, { ReactNode } from 'react';
import { DashboardHeader } from './ui/dashboard-header';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6 pt-20">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
