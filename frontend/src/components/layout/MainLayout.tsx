import React from 'react';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, fullWidth = false }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        <div className={fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};