"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  QrCode,
  Users,
  Calendar,
  ShieldCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  Scan,
  Zap,
  Download,
  Plus,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export type NavItemKey =
  | 'overview'
  | 'live-checkin'
  | 'attendees'
  | 'events'
  | 'security'
  | 'reports';

interface SidebarProps {
  activeTab: NavItemKey;
  onTabChange: (tab: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileDrawerOpen: boolean;
  onCloseMobileDrawer: () => void;
}

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'live-checkin', label: 'Live Check-in', icon: QrCode, badge: 'Live' },
  { key: 'attendees', label: 'Attendees', icon: Users },
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'security', label: 'Security & Telemetry', icon: ShieldCheck },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isMobileDrawerOpen,
  onCloseMobileDrawer,
}: SidebarProps) {
  const {
    setIsFaceScanGateModalOpen,
    setIsRapidGateModalOpen,
    setIsEventFormModalOpen,
    setEventToEdit,
    exportAttendeesCsv,
  } = useEventSystem();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-5 px-3">
      {/* Top Navigation & Fast Finding Tasks */}
      <div className="space-y-5">
        
        {/* Section Header */}
        <div className="flex items-center justify-between px-2.5">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                Operations Suite
              </span>
            </div>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors ml-auto cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Primary Tabs Navigation */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  onTabChange(item.key as NavItemKey);
                  onCloseMobileDrawer();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-red-600/30 to-rose-700/20 border border-red-500/40 shadow-md shadow-red-950/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={item.label}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-red-500 to-amber-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                {!isCollapsed && (
                  <span className="flex-1 text-left tracking-wide truncate">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ======================================================== */}
        {/* FAST FINDINGS / INSTANT TASKS RAIL                       */}
        {/* ======================================================== */}
        {!isCollapsed && (
          <div className="pt-3 border-t border-red-500/15 space-y-2">
            <div className="px-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Instant Tasks
              </span>
            </div>

            <div className="space-y-1">
              {/* Task 1: Live Face Scan Gate */}
              <button
                onClick={() => {
                  setIsFaceScanGateModalOpen(true);
                  onCloseMobileDrawer();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-white transition-all text-left cursor-pointer"
                title="Launch Live Gate Camera"
              >
                <Scan className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Face Scan Gate</span>
              </button>

              {/* Task 2: Optical QR Pass Scanner */}
              <button
                onClick={() => {
                  setIsRapidGateModalOpen(true);
                  onCloseMobileDrawer();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-left cursor-pointer"
                title="Optical QR Scanner (Verify Real vs Fake Pass)"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">QR Scanner (Real/Fake)</span>
              </button>

              {/* Task 3: Create New Event */}
              <button
                onClick={() => {
                  setEventToEdit(null);
                  setIsEventFormModalOpen(true);
                  onCloseMobileDrawer();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] border border-white/[0.05] transition-all text-left cursor-pointer"
                title="Create a New Event"
              >
                <Plus className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">Create Event</span>
              </button>

              {/* Task 4: Export CSV Roster */}
              <button
                onClick={() => {
                  exportAttendeesCsv();
                  onCloseMobileDrawer();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] border border-white/[0.05] transition-all text-left cursor-pointer"
                title="Export Attendee Attendance CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Export CSV</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Gate Terminal Status */}
      {!isCollapsed && (
        <div className="pt-4 border-t border-red-500/15 px-2">
          <div className="rounded-xl bg-black/40 dark:bg-[#151119] border border-red-500/20 p-2.5 text-left">
            <div className="flex items-center gap-2 mb-0.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-white">
                Terminal Online
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Real-time gate sync & biometric verification active
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden lg:block shrink-0 rounded-2xl glass-panel-subtle transition-all duration-300 border-2 border-red-500/30 shadow-xl ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobileDrawer}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative w-72 max-w-[80vw] h-full bg-[#120F16] border-r border-red-500/30 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-red-500/20">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Gate Operations
                </span>
                <button
                  onClick={onCloseMobileDrawer}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
