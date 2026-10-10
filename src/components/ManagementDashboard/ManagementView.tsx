"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { ManagementHeader } from './ManagementHeader';
import { Sidebar, NavItemKey } from './Sidebar';
import { MetricCards } from './MetricCards';
import { LiveCheckInFeed } from './LiveCheckInFeed';
import { SecurityPanel } from './SecurityPanel';
import { SecurityActivity } from './SecurityActivity';
import { EventCapacity } from './EventCapacity';
import { AttendeesTab } from './AttendeesTab';
import { EventsCarousel } from '../StudentPortal/EventsCarousel';
import { useEventSystem } from '@/context/EventSystemContext';

export function ManagementView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItemKey>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const {
    selectedEvent,
    setIsEventFormModalOpen,
    setEventToEdit,
    currentUser,
  } = useEventSystem();

  // Access guard: management role required
  if (!currentUser || currentUser.role !== 'management') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-950/40">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white mb-2 tracking-tight">
          Management Access Restricted
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          The Campus Operations Suite and Gate Management Terminal are restricted to verified administrator and manager accounts.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => router.push('/student')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-950/40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Student Portal</span>
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In as Staff</span>
          </button>
        </div>
      </div>
    );
  }

  // Handle case when no events exist yet
  if (!selectedEvent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <Plus className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white mb-2 tracking-tight">
          No Events In Database
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Create your first campus event to initialize gate monitoring and pass generation.
        </p>
        <button
          onClick={() => {
            setEventToEdit(null);
            setIsEventFormModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-950/40"
        >
          Create First Event
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-6 min-h-[calc(100vh-5rem)]">
      {/* Sidebar with Instant Tasks Rail */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Operations Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header with Global Search & Quick Actions */}
        <ManagementHeader
          onToggleMobileSidebar={() => setIsMobileDrawerOpen(true)}
          onOpenSettingsModal={() => setActiveTab('security')}
        />

        {/* Tab Content with Smooth Transitions */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Metric Cards */}
              <MetricCards />

              {/* 2-Column Grid: Live Check-in Feed & Security Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Large Live Check-in Feed (7 cols) */}
                <div className="lg:col-span-7">
                  <LiveCheckInFeed />
                </div>

                {/* Right: Venue Capacity & Security Guard (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <EventCapacity />
                  <SecurityPanel />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'live-checkin' && (
            <motion.div
              key="live-checkin"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <LiveCheckInFeed />
            </motion.div>
          )}

          {activeTab === 'attendees' && (
            <motion.div
              key="attendees"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AttendeesTab />
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Event Actions Bar */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 dark:bg-[#161218] border border-red-500/20">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Event Management</h3>
                  <p className="text-xs text-slate-400">Configure parameters, capacities, and scheduling</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEventToEdit(selectedEvent);
                      setIsEventFormModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Selected</span>
                  </button>

                  <button
                    onClick={() => {
                      setEventToEdit(null);
                      setIsEventFormModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-xs font-bold text-white shadow-lg shadow-red-950/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Event</span>
                  </button>
                </div>
              </div>

              <EventsCarousel />
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <SecurityPanel />
              <SecurityActivity />
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <MetricCards />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EventCapacity />
                <SecurityActivity />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
