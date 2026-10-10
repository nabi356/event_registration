"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, PieChart, Plus, ArrowUpRight } from 'lucide-react';
import { RollerCounter } from './RollerCounter';
import { useEventSystem } from '@/context/EventSystemContext';

export function MetricCards() {
  const {
    totalRegistered,
    checkedInCount,
    capacityPercentage,
    simulateCheckIn,
    selectedEvent,
  } = useEventSystem();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* CARD 1: Total Registered */}
      <motion.div
        whileHover={{ y: -5, scale: 1.015 }}
        transition={{ duration: 0.22 }}
        className="rounded-2xl glass-panel-interactive p-5 relative overflow-hidden flex flex-col justify-between border-2 border-red-500/30 shadow-lg cursor-default"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2 pb-2 border-b border-red-500/20">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Passes Claimed
          </span>
          <div className="w-8 h-8 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
            {totalRegistered.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-red-500/20 text-xs">
          <span className="text-slate-400 truncate max-w-[160px]">
            {selectedEvent?.venue || 'Venue'}: {selectedEvent?.capacity || 0} Max
          </span>
          <span className="text-amber-400 font-semibold flex items-center gap-0.5">
            {totalRegistered} confirmed <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </motion.div>

      {/* CARD 2: Currently Checked-In */}
      <motion.div
        whileHover={{ y: -5, scale: 1.015 }}
        transition={{ duration: 0.22 }}
        className="rounded-2xl glass-panel-interactive p-5 relative overflow-hidden flex flex-col justify-between border-2 border-amber-500/40 shadow-lg shadow-amber-950/20 bg-gradient-to-b from-[#181216]/80 to-[#100D12]/90 cursor-default"
      >
        {/* Subtle Gold Indicator Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <div className="flex items-center justify-between text-slate-400 mb-2 pb-2 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Checked-In at Gate
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Mechanical Roller Counter Display */}
        <div className="my-2 flex items-baseline gap-2">
          <RollerCounter value={checkedInCount} />
          <span className="text-xs font-mono text-slate-400">/ {totalRegistered}</span>
        </div>

        {/* Supporting text + Inline Quick Action */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 text-xs">
          <span className="text-slate-400">Live gate entry</span>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            id="btn-simulate-checkin-metric"
            onClick={simulateCheckIn}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/35 border border-red-500/30 text-red-300 text-[11px] font-bold transition-all shadow-sm cursor-pointer"
            title="Express gate check-in"
          >
            <Plus className="w-3 h-3" />
            <span>Express Check-in</span>
          </motion.button>
        </div>
      </motion.div>

      {/* CARD 3: Venue Capacity */}
      <motion.div
        whileHover={{ y: -5, scale: 1.015 }}
        transition={{ duration: 0.22 }}
        className="rounded-2xl glass-panel-interactive p-5 relative overflow-hidden flex flex-col justify-between sm:col-span-2 lg:col-span-1 border-2 border-red-500/30 shadow-lg cursor-default"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2 pb-2 border-b border-red-500/20">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hall Capacity
          </span>
          <div className="w-8 h-8 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <PieChart className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
            {capacityPercentage}%
          </div>
        </div>

        <div className="space-y-1 pt-2 border-t border-red-500/10">
          <div className="w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, parseFloat(capacityPercentage) || 0)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Occupied</span>
            <span className="text-amber-400 font-semibold">{checkedInCount} / {selectedEvent?.capacity || 0}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
