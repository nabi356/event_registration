"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building,
  ChevronDown,
  Menu,
  Shield,
  Scan,
  Plus,
  LogOut,
  Search,
  X,
  Sun,
  Moon,
  Ticket,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

interface ManagementHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenSettingsModal?: () => void;
}

export function ManagementHeader({
  onToggleMobileSidebar,
  onOpenSettingsModal,
}: ManagementHeaderProps) {
  const router = useRouter();
  const {
    selectedEvent,
    setSelectedEvent,
    events,
    setIsFaceScanGateModalOpen,
    setIsEventFormModalOpen,
    setEventToEdit,
    currentUser,
    logoutUser,
    theme,
    toggleTheme,
    managementSearch,
    setManagementSearch,
  } = useEventSystem();

  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  return (
    <div className="w-full pb-5 mb-6 border-b border-red-500/25">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        
        {/* Left: Mobile hamburger + Event Operations Title & Status */}
        <div className="flex items-start sm:items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Gate & Event Operations
              </h1>

              {/* Status: 🟢 Live Gate Monitoring */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Gate</span>
              </div>
            </div>

            {/* Subtitle with active event name & location */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="text-amber-400 font-bold">
                {selectedEvent?.name || 'No Event Selected'}
              </span>
              <span>·</span>
              <span className="text-slate-300">{selectedEvent?.venue || 'Campus Venue'}</span>
            </div>
          </div>
        </div>

        {/* Center: BIG & PROMINENT Global Operations Search Bar */}
        <div className="flex-1 max-w-xl xl:max-w-2xl mx-0 lg:mx-4">
          <div className="relative flex items-center group">
            <Search className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-red-500 absolute left-3.5 pointer-events-none transition-colors" />
            <input
              type="text"
              value={managementSearch}
              onChange={(e) => setManagementSearch(e.target.value)}
              placeholder="Search attendee by name, roll number, or ticket ID..."
              className="w-full pl-11 pr-16 py-2.5 sm:py-3 rounded-2xl bg-black/40 dark:bg-[#161218]/90 border border-red-500/30 hover:border-red-500/50 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all shadow-inner"
            />
            {managementSearch ? (
              <button
                onClick={() => setManagementSearch('')}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex absolute right-3 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white/[0.06] border border-white/[0.1] rounded-md pointer-events-none">
                Ctrl+K
              </kbd>
            )}
          </div>
        </div>

        {/* Right: Actions, Event Selector, Theme, Profile */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Active Event Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 dark:bg-[#161218] border border-red-500/20 hover:border-red-500/40 text-xs font-semibold text-slate-200 transition-all shadow-sm cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">
                {selectedEvent?.name || 'Select Event'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isEventDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#161218]/95 border border-red-500/30 shadow-2xl backdrop-blur-xl p-1.5 z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Select Active Event
                </div>
                {events.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      setSelectedEvent(evt);
                      setIsEventDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col cursor-pointer ${
                      selectedEvent?.id === evt.id
                        ? 'bg-red-600/20 text-white font-semibold'
                        : 'text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="truncate">{evt.name}</span>
                    <span className="text-[10px] text-slate-400">{evt.date} · {evt.venue}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Face Scan Gate CTA */}
          <button
            onClick={() => setIsFaceScanGateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-xs font-bold text-white shadow-lg shadow-red-950/40 transition-all cursor-pointer transform hover:scale-[1.02]"
            title="Open Live Face Scan Gate Scanner"
          >
            <Scan className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Face Gate</span>
          </button>

          {/* New Event CTA */}
          <button
            onClick={() => {
              setEventToEdit(null);
              setIsEventFormModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-red-500/20 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            title="Create New Event"
          >
            <Plus className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden md:inline">New Event</span>
          </button>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-red-500/20 text-amber-400 transition-all cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-amber-500" />
            )}
          </button>

          {/* Switch to Student Portal */}
          <button
            onClick={() => router.push('/student')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Switch to Student Passholder Portal"
          >
            <Ticket className="w-3.5 h-3.5 text-amber-400" />
            <span>Student View</span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              logoutUser();
              router.push('/');
            }}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-red-600/20 hover:border-red-500/30 text-xs font-semibold text-slate-300 hover:text-red-300 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
