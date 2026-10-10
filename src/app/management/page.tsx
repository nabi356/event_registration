"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEventSystem } from '@/context/EventSystemContext';
import { ManagementView } from '@/components/ManagementDashboard/ManagementView';

export default function ManagementPage() {
  const router = useRouter();
  const { theme } = useEventSystem();

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative selection:bg-red-600/30 selection:text-white transition-colors duration-300">

      {/* Main Operations Suite View - Full-width layout without wasted margins */}
      <div className="flex-1 relative z-10 w-full max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 py-4">
        <ManagementView />
      </div>
    </div>
  );
}
