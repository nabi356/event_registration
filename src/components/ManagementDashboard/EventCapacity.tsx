"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useEventSystem } from '@/context/EventSystemContext';

export function EventCapacity() {
  const { checkedInCount, totalRegistered, capacityPercentage, selectedEvent } = useEventSystem();
  const seatsRemaining = Math.max(0, totalRegistered - checkedInCount);
  const numericPercentage = Math.min(100, Math.max(0, (checkedInCount / totalRegistered) * 100));

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6 border-2 border-red-500/30 shadow-xl">
      <div className="flex items-center justify-between pb-3.5 border-b-2 border-red-500/25 mb-4">
        <div>
          <h3 className="text-sm font-black text-white tracking-tight">
            Hall Occupancy
          </h3>
          <p className="text-[11px] text-slate-400">
            {selectedEvent?.venue || 'Campus Venue'} · Real-time attendance
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-amber-400">
          {capacityPercentage}% checked in
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">
            {checkedInCount.toLocaleString()}{' '}
            <span className="text-slate-400 font-normal">
              / {totalRegistered.toLocaleString()} Attendees
            </span>
          </span>
          <span className="text-amber-400 font-medium text-[11px]">
            {seatsRemaining.toLocaleString()} remaining
          </span>
        </div>

        {/* Outer Bar */}
        <div className="w-full h-3 rounded-full bg-black/60 border border-red-500/20 overflow-hidden p-0.5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${numericPercentage}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          />
        </div>

        {/* Sectional Breakdown indicators */}
        <div className="grid grid-cols-3 gap-2 pt-3 text-[11px]">
          <div className="p-2 rounded-xl bg-white/[0.02] border border-red-500/10">
            <span className="text-slate-400 block text-[10px]">Venue Max</span>
            <span className="font-bold text-slate-200">
              {selectedEvent?.capacity || 0} Seats
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/[0.02] border border-red-500/10">
            <span className="text-slate-400 block text-[10px]">Passes Issued</span>
            <span className="font-bold text-amber-400">
              {totalRegistered} Passes
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/[0.02] border border-red-500/10">
            <span className="text-slate-400 block text-[10px]">At Venue</span>
            <span className="font-bold text-emerald-400">
              {checkedInCount} Present
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
