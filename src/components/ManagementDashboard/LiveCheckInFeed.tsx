"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Scan,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

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
    <div className="rounded-2xl glass-panel p-5 sm:p-6 flex flex-col h-full border-2 border-red-500/30 shadow-xl">
      {/* Header with crisp divider line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-red-500/25">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
              Live Gate Stream
            </h2>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time gate check-ins and security approvals
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsFaceScanGateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-xs font-bold text-white transition-all shadow-md shadow-red-950/40 cursor-pointer"
            title="Launch Face Scan Gate Terminal"
          >
            <Scan className="w-3.5 h-3.5 text-amber-400" />
            <span>Face Gate</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter feed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-red-500/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 w-32 sm:w-44 transition-all"
            />
          </div>

          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-red-500/20 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                filter === 'verified'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilter('flagged')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                filter === 'flagged'
                  ? 'bg-rose-700 text-white shadow-sm'
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
                initial={{ opacity: 0, x: -20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                  isVerified
                    ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    : 'bg-red-950/20 border-red-500/30 hover:bg-red-950/30'
                }`}
              >
                {/* Left Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isVerified
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        : 'bg-red-500/20 border-red-500/40 text-red-400'
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
                      <span className="text-sm font-bold text-white tracking-tight truncate">
                        {item.name}
                      </span>
                      <span className="font-mono text-[11px] text-amber-400 font-semibold truncate">
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
                          <span className="text-rose-400 font-medium">
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/20 text-red-300 border border-red-500/40">
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
            No gate check-in logs recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
