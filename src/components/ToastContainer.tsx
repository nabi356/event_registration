"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useEventSystem();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`pointer-events-auto relative overflow-hidden rounded-xl p-4 shadow-2xl backdrop-blur-xl border ${
                isSuccess
                  ? 'bg-[#0B1522]/90 border-emerald-500/30 text-emerald-100 shadow-emerald-950/20'
                  : isError
                  ? 'bg-[#180E14]/90 border-rose-500/30 text-rose-100 shadow-rose-950/20'
                  : isWarning
                  ? 'bg-[#19150E]/90 border-amber-500/30 text-amber-100 shadow-amber-950/20'
                  : 'bg-[#0F172A]/90 border-blue-500/20 text-slate-100 shadow-blue-950/20'
              }`}
            >
              {/* Subtle top ambient line */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] ${
                  isSuccess
                    ? 'bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0'
                    : isError
                    ? 'bg-gradient-to-r from-rose-500/0 via-rose-500 to-rose-500/0'
                    : isWarning
                    ? 'bg-gradient-to-r from-amber-500/0 via-amber-400 to-amber-500/0'
                    : 'bg-gradient-to-r from-blue-500/0 via-blue-400 to-blue-500/0'
                }`}
              />

              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 shrink-0">
                  {isSuccess && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  )}
                  {isError && (
                    <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <AlertOctagon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  )}
                  {isWarning && (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  )}
                  {!isSuccess && !isError && !isWarning && (
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Info className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-sm font-semibold tracking-tight text-white">
                    {toast.title}
                  </h4>
                  <p className="text-xs text-slate-300/90 mt-0.5 line-clamp-2 leading-relaxed">
                    {toast.description}
                  </p>
                </div>

                <button
                  onClick={() => dismissToast(toast.id)}
                  className="shrink-0 p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
