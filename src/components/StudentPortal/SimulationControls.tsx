"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';
import { GeoFenceStatus, DeviceLockStatus } from '@/lib/types';

export function SimulationControls() {
  const {
    geoFenceStatus,
    setGeoFenceStatus,
    deviceLockStatus,
    setDeviceLockStatus,
    addToast,
  } = useEventSystem();

  const [isOpen, setIsOpen] = useState(false);

  const handleGeoChange = (status: GeoFenceStatus) => {
    setGeoFenceStatus(status);
    if (status === 'verified') {
      addToast('success', 'Location Verified', 'Within venue perimeter (32m from gate).');
    } else if (status === 'outside') {
      addToast('warning', 'Outside Perimeter Zone', 'Move within 50m of the venue to activate QR.');
    } else {
      addToast('error', 'Location Unavailable', 'Perimeter verification failed (GPS offline).');
    }
  };

  const handleDeviceChange = (status: DeviceLockStatus) => {
    setDeviceLockStatus(status);
    if (status === 'verified') {
      addToast('success', 'Device Verified', 'Ticket successfully bound to current device hardware.');
    } else {
      addToast('error', 'Device Session Mismatch', 'Access blocked: hardware signature mismatch.');
    }
  };

  return (
    <div className="mt-8 max-w-md mx-auto">
      {/* Subtle Container */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all">
        {/* Header Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span className="tracking-wide">Hardware & Perimeter Diagnostics</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{isOpen ? 'Collapse' : 'Sensor Diagnostics'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Expandable Controls */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4 pt-1 space-y-4 border-t border-white/[0.04]"
            >
              {/* Geo-fence selector */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>Perimeter Proximity Status</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleGeoChange('verified')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-medium transition-all text-center ${
                      geoFenceStatus === 'verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                    }`}
                  >
                    Verified (32m)
                  </button>

                  <button
                    onClick={() => handleGeoChange('outside')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-medium transition-all text-center ${
                      geoFenceStatus === 'outside'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                    }`}
                  >
                    Outside Zone
                  </button>

                  <button
                    onClick={() => handleGeoChange('unavailable')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-medium transition-all text-center ${
                      geoFenceStatus === 'unavailable'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                    }`}
                  >
                    Unavailable
                  </button>
                </div>
              </div>

              {/* Device lock selector */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-blue-400" />
                  <span>Hardware Cryptographic Binding</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDeviceChange('verified')}
                    className={`py-2 px-3 rounded-xl text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                      deviceLockStatus === 'verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Device Verified</span>
                  </button>

                  <button
                    onClick={() => handleDeviceChange('mismatch')}
                    className={`py-2 px-3 rounded-xl text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                      deviceLockStatus === 'mismatch'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Session Mismatch</span>
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center pt-1 leading-normal">
                Flip the ticket to inspect real-time dynamic QR code cryptographic verification.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
