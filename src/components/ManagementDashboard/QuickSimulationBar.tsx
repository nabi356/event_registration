"use client";

import React from 'react';
import { UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export function QuickSimulationBar() {
  const { simulateCheckIn, simulateFailedCheckIn } = useEventSystem();

  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-900/40 to-indigo-950/30 border border-white/[0.08] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Gate Operations Terminal
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time gate entry validation and telemetry exception processing
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          id="btn-simulate-checkin-action"
          onClick={simulateCheckIn}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/35 text-emerald-300 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-950/30"
        >
          <UserCheck className="w-4 h-4" />
          <span>Rapid Gate Check-in</span>
        </button>

        <button
          id="btn-simulate-failed-checkin-action"
          onClick={simulateFailedCheckIn}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/35 text-rose-300 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-950/30"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Flag Security Exception</span>
        </button>
      </div>
    </div>
  );
}
