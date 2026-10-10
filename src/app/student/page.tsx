"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEventSystem } from '@/context/EventSystemContext';
import { StudentNavHeader } from '@/components/StudentPortal/StudentNavHeader';
import { StudentView } from '@/components/StudentPortal/StudentView';

export default function StudentPage() {
  const router = useRouter();
  const { currentUser, theme } = useEventSystem();

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative selection:bg-red-600/30 selection:text-white transition-colors duration-300">

      {/* Dedicated Student Navigation Bar */}
      <StudentNavHeader />

      {/* Main Student Portal Content */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StudentView />
      </main>
    </div>
  );
}
