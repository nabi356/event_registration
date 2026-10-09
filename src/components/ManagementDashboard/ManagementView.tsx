"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit } from 'lucide-react';
import { ManagementHeader } from './ManagementHeader';
import { Sidebar, NavItemKey } from './Sidebar';
import { MetricCards } from './MetricCards';
import { QuickSimulationBar } from './QuickSimulationBar';
import { LiveCheckInFeed } from './LiveCheckInFeed';
import { SecurityPanel } from './SecurityPanel';
import { SecurityActivity } from './SecurityActivity';
import { EventCapacity } from './EventCapacity';
import { AttendeesTab } from './AttendeesTab';
import { EventsCarousel } from '../StudentPortal/EventsCarousel';
import { useEventSystem } from '@/context/EventSystemContext';

export function ManagementView() {
  const [activeTab, setActiveTab] = useState<NavItemKey>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { selectedEvent, setIsEventFormModalOpen, setEventToEdit } = useEventSystem();

  return (
    <div className="flex gap-6 min-h-[calc(100vh-5rem)]">
      {/* Sidebar */}
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
        {/* Header */}
        <ManagementHeader
          onToggleMobileSidebar={() => setIsMobileDrawerOpen(true)}
          onOpenSettingsModal={() => setActiveTab('security')}
        />

        {/* Tab Content with Framer Motion transition */}
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
              {/* Metric Cards (Total Registered, Currently Checked In with Roller, Capacity) */}
              <MetricCards />

              {/* Simulation Quick Bar */}
              <QuickSimulationBar />

              {/* 2-Column Grid: Live Check-in Feed & Security Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Large Live Check-in Activity Panel (7 cols) */}
                <div className="lg:col-span-7">
                  <LiveCheckInFeed />
                </div>

                {/* Right: Security & Capacity Panels (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <EventCapacity />
                  <SecurityPanel />
                  <SecurityActivity />
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
              <QuickSimulationBar />
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
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Campus Event Management</h3>
                  <p className="text-xs text-slate-400">Configure geofence perimeters, capacities, and scheduling</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEventToEdit(selectedEvent);
                      setIsEventFormModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-400" />
                    <span>Edit Selected</span>
                  </button>

                  <button
                    onClick={() => {
                      setEventToEdit(null);
                      setIsEventFormModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-900/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Event</span>
                  </button>
                </div>
              </div>

              <EventsCarousel />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EventCapacity />
                <SecurityActivity />
              </div>
            </motion.div>
          )}

          {(activeTab === 'security' || activeTab === 'settings') && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <SecurityPanel />
              <div className="space-y-6">
                <SecurityActivity />
                <EventCapacity />
              </div>
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
