"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  Scan,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';
import { CheckInRecord } from '@/lib/types';

export function LiveCheckInFeed() {
  const { checkIns, setIsFaceScanGateModalOpen } = useEventSystem();
  const [filter, setFilter] = useState<'all' | 'verified' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = checkIns.filter((record) => {
    if (filter === 'verified' && record.status !== 'verified') return false;
    if (filter === 'flagged' && record.status !== 'flagged') return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        record.name.toLowerCase().includes(q) ||
        record.ticketId.toLowerCase().includes(q) ||
        (record.reason && record.reason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Live Check-ins
            </h2>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time verification activity
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsFaceScanGateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600/25 hover:bg-blue-600/35 border border-blue-500/35 text-xs font-semibold text-blue-300 hover:text-white transition-all shadow-sm"
            title="Launch Face Scan Entry Screen"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Face Scan</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search attendee or ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 w-36 sm:w-48 transition-all"
            />
          </div>

          <div className="flex items-center bg-[#111A2E] p-1 rounded-xl border border-white/[0.06] text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                filter === 'verified'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilter('flagged')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                filter === 'flagged'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Flagged
            </button>
          </div>
        </div>
      </div>

      {/* Live Stream List */}
      <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 mt-3 space-y-2.5">
        <AnimatePresence initial={false}>
          {filteredRecords.map((item) => {
            const isVerified = item.status === 'verified';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -25, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                  isVerified
                    ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    : 'bg-rose-500/[0.05] border-rose-500/25 hover:bg-rose-500/[0.08]'
                }`}
              >
                {/* Left Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isVerified
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {isVerified ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white tracking-tight truncate">
                        {item.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 truncate">
                        {item.ticketId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.timeAgo}
                      </span>
                      {item.reason && (
                        <>
                          <span>·</span>
                          <span className="text-rose-300 font-medium">
                            {item.reason}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Badge Status */}
                <div className="shrink-0 text-right">
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      ⚠ Flagged
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredRecords.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No check-in records matching the current criteria.
          </div>
        )}
      </div>
    </div>
  );
}
