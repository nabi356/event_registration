"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEventSystem } from '@/context/EventSystemContext';
import { ManagementView } from '@/components/ManagementDashboard/ManagementView';

export default function ManagementPage() {
  const router = useRouter();
  const { currentUser } = useEventSystem();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col relative selection:bg-blue-600/30 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/[0.07] rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/[0.05] rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/[0.04] rounded-full blur-[128px]" />
      </div>

      {/* Main Operations Suite View */}
      <div className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ManagementView />
      </div>
    </div>
  );
}
