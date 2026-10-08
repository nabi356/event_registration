"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Armchair, Building2 } from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export function EventCapacity() {
  const { checkedInCount, totalRegistered, capacityPercentage, selectedEvent } = useEventSystem();
  const seatsRemaining = Math.max(0, totalRegistered - checkedInCount);
  const numericPercentage = Math.min(100, Math.max(0, (checkedInCount / totalRegistered) * 100));

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6">
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Venue Capacity
          </h3>
          <p className="text-[11px] text-slate-400">
            {selectedEvent.venue} · Real-time occupancy
          </p>
        </div>

        <span className="text-xs font-mono font-semibold text-blue-400">
          {capacityPercentage}% occupied
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white">
            {checkedInCount.toLocaleString()}{' '}
            <span className="text-slate-400 font-normal">
              / {totalRegistered.toLocaleString()} Attendees
            </span>
          </span>
          <span className="text-slate-400 text-[11px]">
            {seatsRemaining.toLocaleString()} remaining
          </span>
        </div>

        {/* Outer Bar */}
        <div className="w-full h-3 rounded-full bg-slate-900 border border-white/[0.08] overflow-hidden p-0.5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${numericPercentage}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          />
        </div>

        {/* Sectional Breakdown indicators */}
        <div className="grid grid-cols-3 gap-2 pt-3 text-[11px]">
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-slate-400 block text-[10px]">Tier 1 Reserved</span>
            <span className="font-semibold text-slate-200">92% full</span>
          </div>

          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-slate-400 block text-[10px]">General Hall</span>
            <span className="font-semibold text-slate-200">51% full</span>
          </div>

          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-slate-400 block text-[10px]">Staff & VIP</span>
            <span className="font-semibold text-slate-200">18 / 25</span>
          </div>
        </div>
      </div>
    </div>
  );
}
