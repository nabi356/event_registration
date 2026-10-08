"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sliders,
  MapPin,
  Smartphone,
  UserCheck,
  ShieldAlert,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

interface DemoToolbarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoToolbarModal({ isOpen, onClose }: DemoToolbarModalProps) {
  const {
    geoFenceStatus,
    setGeoFenceStatus,
    deviceLockStatus,
    setDeviceLockStatus,
    simulateCheckIn,
    simulateFailedCheckIn,
    resetDemoStats,
    addToast,
  } = useEventSystem();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md rounded-2xl glass-panel border border-white/[0.14] p-6 shadow-2xl bg-[#0E1626]/95 z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Terminal Diagnostics Console
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live gate sensor controls and verification telemetry
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                  Gate Verification Actions
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      simulateCheckIn();
                    }}
                    className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-left flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">Express Check-in</span>
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-emerald-400/80">
                      +1 to counter, gate verification logged
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      simulateFailedCheckIn();
                    }}
                    className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-all text-left flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">Flag Exception</span>
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-rose-400/80">
                      Security alert and blocked pass logged
                    </span>
                  </button>
                </div>
              </div>

              {/* Geo-fence state */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>Perimeter Proximity Diagnostic</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      setGeoFenceStatus('verified');
                      addToast('success', 'Location Verified', '32m from venue perimeter');
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-medium transition-all text-center ${
                      geoFenceStatus === 'verified'
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                    }`}
                  >
                    Verified (32m)
                  </button>

                  <button
                    onClick={() => {
                      setGeoFenceStatus('outside');
                      addToast('warning', 'Outside Perimeter Zone', 'Move within 50m of venue');
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-medium transition-all text-center ${
                      geoFenceStatus === 'outside'
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                    }`}
                  >
                    Outside Zone
                  </button>

                  <button
                    onClick={() => {
                      setGeoFenceStatus('unavailable');
                      addToast('error', 'Location Unavailable', 'GPS offline');
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-medium transition-all text-center ${
                      geoFenceStatus === 'unavailable'
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                    }`}
                  >
                    Unavailable
                  </button>
                </div>
              </div>

              {/* Device signature state */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-blue-400" />
                  <span>Hardware Cryptographic Binding</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setDeviceLockStatus('verified');
                      addToast('success', 'Device Verified', 'Hardware cryptographic signature matched');
                    }}
                    className={`py-2 px-3 rounded-xl text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                      deviceLockStatus === 'verified'
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Device Verified</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeviceLockStatus('mismatch');
                      addToast('error', 'Device Session Mismatch', 'Unrecognized device session detected');
                    }}
                    className={`py-2 px-3 rounded-xl text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                      deviceLockStatus === 'mismatch'
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                    }`}
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>Session Mismatch</span>
                  </button>
                </div>
              </div>

              {/* Reset State */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <button
                  onClick={resetDemoStats}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Calibrate Terminal Baseline</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
