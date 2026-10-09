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
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Radio,
  Scan,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export type NavItemKey =
  | 'overview'
  | 'live-checkin'
  | 'attendees'
  | 'events'
  | 'security'
  | 'reports'
  | 'settings';

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
  { key: 'security', label: 'Security', icon: ShieldCheck },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isMobileDrawerOpen,
  onCloseMobileDrawer,
}: SidebarProps) {
  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-5 px-3">
      {/* Top brand / Section header */}
      <div>
        <div className="flex items-center justify-between px-2.5 mb-6">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Operations Suite
              </span>
            </div>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all relative group ${
                  isActive
                    ? 'text-white bg-white/[0.08] border border-white/[0.1] shadow-md shadow-blue-950/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={item.label}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-blue-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                {!isCollapsed && (
                  <span className="flex-1 text-left tracking-wide truncate">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Face Scan Entry Dedicated Terminal Launcher */}
        <button
          onClick={() => {
            useEventSystem().setIsFaceScanGateModalOpen(true);
            onCloseMobileDrawer();
          }}
          className={`w-full mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/40 hover:to-indigo-600/40 border border-blue-500/40 text-blue-300 transition-all shadow-md shadow-blue-950/20 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Face Scan Gate Entry"
        >
          <Scan className="w-4 h-4 text-blue-400 shrink-0" />
          {!isCollapsed && <span className="truncate">Face Scan Gate</span>}
        </button>
      </div>

      {/* Bottom system status */}
      {!isCollapsed && (
        <div className="pt-4 border-t border-white/[0.06] px-2.5">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-slate-200">
                Gateway 04 Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Sub-second QR sync & localized proximity validation
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
        className={`hidden lg:block shrink-0 rounded-2xl glass-panel-subtle transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER (Framer Motion slide-in) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobileDrawer}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative w-72 max-w-[80vw] h-full bg-[#0E1524] border-r border-white/[0.1] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Event Operations
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
