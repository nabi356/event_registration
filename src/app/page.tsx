"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventSystemProvider, useEventSystem } from '@/context/EventSystemContext';
import { NavigationHeader } from '@/components/NavigationHeader';
import { StudentView } from '@/components/StudentPortal/StudentView';
import { ManagementView } from '@/components/ManagementDashboard/ManagementView';
import { ToastContainer } from '@/components/ToastContainer';
import { DemoToolbarModal } from '@/components/DemoToolbarModal';

function AppContent() {
  const { viewMode } = useEventSystem();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col relative selection:bg-blue-600/30 selection:text-white">
      {/* Ambient background glows - restrained and obsidian */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/[0.07] rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/[0.05] rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/[0.04] rounded-full blur-[128px]" />
      </div>

      {/* Top Navigation Bar with View Switcher */}
      <NavigationHeader onOpenDemoToolbar={() => setIsDemoModalOpen(true)} />

      {/* Main View Area with Framer Motion crossfade transition */}
      <div className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {viewMode === 'student' ? (
            <motion.div
              key="student-portal-view"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <StudentView />
            </motion.div>
          ) : (
            <motion.div
              key="management-dashboard-view"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ManagementView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Interactive Demo Modal */}
      <DemoToolbarModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      {/* Global Notifications Container */}
      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return (
    <EventSystemProvider>
      <AppContent />
    </EventSystemProvider>
  );
}
