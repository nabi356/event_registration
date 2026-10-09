"use client";

import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Settings,
  Menu,
  Shield,
  Activity,
  UserCheck,
  Building,
  Scan,
  Plus,
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
  const {
    selectedEvent,
    setSelectedEvent,
    events,
    setIsFaceScanGateModalOpen,
    setIsEventFormModalOpen,
    setEventToEdit,
    currentUser,
  } = useEventSystem();
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  return (
    <div className="w-full pb-6 mb-6 border-b border-white/[0.06]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Event Operations Title & Status */}
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Event Operations
              </h1>

              {/* Status: 🟢 Live Monitoring */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Monitoring</span>
              </div>
            </div>

            {/* Subtitle with active event name & location */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="text-slate-300 font-medium">{selectedEvent.name}</span>
              <span>·</span>
              <span>{selectedEvent.venue}</span>
            </div>
          </div>
        </div>

        {/* Right: Event Selector Dropdown, Date, Staff Profile, Settings */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Event Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111A2E]/80 border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-slate-200 transition-all shadow-sm"
            >
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span className="max-w-[140px] sm:max-w-[180px] truncate">
                {selectedEvent.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isEventDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0F172A]/95 border border-white/[0.12] shadow-2xl backdrop-blur-xl p-1.5 z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Active Terminal
                </div>
                {events.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      setSelectedEvent(evt);
                      setIsEventDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col ${
                      selectedEvent.id === evt.id
                        ? 'bg-blue-600/20 text-blue-300 font-medium'
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

          {/* Face Scan Gate Entry Button */}
          <button
            onClick={() => setIsFaceScanGateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            title="Open Live Webcam Face Scan Gate Terminal"
          >
            <Scan className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Face Scan Entry</span>
          </button>

          {/* New Event Button */}
          <button
            onClick={() => {
              setEventToEdit(null);
              setIsEventFormModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Create New Campus Event"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">New Event</span>
          </button>

          {/* Staff Profile Card */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
              OP
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-semibold text-slate-200 block leading-tight">
                {currentUser?.name || 'K. Nabidul H.'}
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                {currentUser?.role === 'management' ? 'Operations Admin' : 'Staff Lead'}
              </span>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all"
            aria-label="Operations settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
