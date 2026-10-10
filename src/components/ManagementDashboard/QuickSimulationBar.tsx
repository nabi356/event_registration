"use client";

import React from 'react';
import { UserCheck, ShieldAlert, Sparkles, Scan } from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export function QuickSimulationBar() {
  const {
    setIsRapidGateModalOpen,
    setIsFaceScanGateModalOpen,
    simulateFailedCheckIn,
  } = useEventSystem();

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
            Real-time biometric validation, QR sync, and telemetry exception processing
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        {/* Face Scan Entry Button */}
        <button
          id="btn-gate-face-scan"
          onClick={() => setIsFaceScanGateModalOpen(true)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/45 border border-blue-500/40 text-blue-200 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-950/30"
          title="Live Webcam Biometric Face Scan Gate Entry"
        >
          <Scan className="w-3.5 h-3.5 text-blue-300" />
          <span>Face Scan Entry</span>
        </button>

        {/* Optical QR Scanner Button */}
        <button
          id="btn-simulate-checkin-action"
          onClick={() => setIsRapidGateModalOpen(true)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-950/30"
          title="Optical QR Scanner (Verify Real vs Fake Pass)"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Optical QR Scanner</span>
        </button>

        {/* Flag Security Exception Button */}
        <button
          id="btn-simulate-failed-checkin-action"
          onClick={simulateFailedCheckIn}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/35 text-rose-300 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-950/30"
          title="Log anomaly / security perimeter breach"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Flag Security Exception</span>
        </button>
      </div>
    </div>
  );
}
