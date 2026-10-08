"use client";

import React from 'react';
import { Users, UserCheck, PieChart, Plus, ArrowUpRight } from 'lucide-react';
import { RollerCounter } from './RollerCounter';
import { useEventSystem } from '@/context/EventSystemContext';

export function MetricCards() {
  const {
    totalRegistered,
    checkedInCount,
    capacityPercentage,
    simulateCheckIn,
  } = useEventSystem();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* CARD 1: Total Registered */}
      <div className="rounded-2xl glass-panel p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Registered
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
            {totalRegistered.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-xs">
          <span className="text-slate-400">Target Hall: 1,300 Cap</span>
          <span className="text-blue-400 font-medium flex items-center gap-0.5">
            +18 today <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* CARD 2: Currently Checked-In (with Roller Counter & Demo Simulate button) */}
      <div className="rounded-2xl glass-panel p-5 relative overflow-hidden flex flex-col justify-between border-emerald-500/20 bg-gradient-to-b from-[#0F1E2A]/70 to-[#0A141D]/80">
        {/* Subtle top indicator bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0" />

        <div className="flex items-center justify-between text-slate-400 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Currently Checked-In
            </span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Mechanical Roller Counter Display */}
        <div className="my-1 flex items-baseline gap-2">
          <RollerCounter value={checkedInCount} />
          <span className="text-xs font-mono text-slate-400">/ {totalRegistered}</span>
        </div>

        {/* Supporting text + Inline Quick Demo action */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-xs">
          <span className="text-slate-400">Live gate telemetry</span>
          <button
            id="btn-simulate-checkin-metric"
            onClick={simulateCheckIn}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Fast manual attendee gate check-in"
          >
            <Plus className="w-3 h-3" />
            <span>Express Check-in</span>
          </button>
        </div>
      </div>

      {/* CARD 3: Venue Capacity */}
      <div className="rounded-2xl glass-panel p-5 relative overflow-hidden flex flex-col justify-between sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Capacity
          </span>
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <PieChart className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
            {capacityPercentage}%
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-xs">
          <span className="text-slate-400">564 seats remaining</span>
          <span className="text-violet-400 font-medium">Optimal flow</span>
        </div>
      </div>
    </div>
  );
}
