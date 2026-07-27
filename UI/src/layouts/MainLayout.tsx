import React from 'react';
import { WorkstationHeader, WorkstationSidebar, OperationalStatusStrip } from '@/components';

export interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = React.memo(({ children }) => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F4F6F8]">
      {/* Top 48px Engineering Command Bar */}
      <WorkstationHeader />

      {/* Main Workstation Dock: Sidebar (Left 224px) + Active Viewport Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <WorkstationSidebar />
        <main className="flex-1 overflow-hidden relative bg-[#F4F6F8] flex flex-col">
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>
          {/* Global Operational Status Strip — CAN Bus, AI Ref, Recorder & Load */}
          <OperationalStatusStrip />
        </main>
      </div>
    </div>
  );
});
MainLayout.displayName = 'MainLayout';
