"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  UserCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { EventItem } from '@/lib/types';

interface RapidGateCheckInModalProps {
  isOpen: boolean;
  selectedEvent: EventItem | null;
  onClose: () => void;
  onCheckInLogged: () => void;
}

export function RapidGateCheckInModal({
  isOpen,
  selectedEvent,
  onClose,
  onCheckInLogged,
}: RapidGateCheckInModalProps) {
  const [identifier, setIdentifier] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [mode, setMode] = useState<'id' | 'qr'>('id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    verified: boolean;
    reason?: string;
    student?: { name: string; enrollmentNo: string; entryTime?: string };
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!identifier && !qrToken) || !selectedEvent?.id) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : '';
      const res = await fetch('/api/checkin/rapid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          identifier: mode === 'id' ? identifier.trim() : undefined,
          qrToken: mode === 'qr' ? qrToken.trim() : undefined,
        }),
      });

      const data = await res.json();
      setResult({
        verified: data.verified,
        reason: data.reason,
        student: data.student,
      });

      onCheckInLogged();
    } catch (err: any) {
      setResult({
        verified: false,
        reason: err.message || 'Check-in request failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md rounded-2xl glass-panel border border-white/[0.14] p-6 shadow-2xl bg-[#0D1526]/95 z-10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Rapid Gate Check-in</h3>
                  <p className="text-[11px] text-slate-400">{selectedEvent?.name || 'No Event Selected'}</p>
                </div>
              </div>

              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher: Unique ID vs Dynamic QR Token */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMode('id')}
                className={`py-1.5 rounded-lg transition-colors ${
                  mode === 'id' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Enrollment / Ticket ID
              </button>
              <button
                type="button"
                onClick={() => setMode('qr')}
                className={`py-1.5 rounded-lg transition-colors ${
                  mode === 'qr' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Scan / Paste QR Token
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'id' ? (
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                    Student Enrollment No. or Ticket Reference
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. UNI-2026-8472 or EVT-10482"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                    Dynamic QR Cryptographic Token
                  </label>
                  <div className="relative">
                    <QrCode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={qrToken}
                      onChange={(e) => setQrToken(e.target.value)}
                      placeholder="Paste EVTRA: token from scanner"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
                <span>{isSubmitting ? 'Verifying Pass...' : 'Verify Gate Entry'}</span>
              </button>
            </form>

            {/* Result Panel */}
            {result && (
              <div
                className={`mt-4 p-3.5 rounded-xl border text-xs transition-all ${
                  result.verified
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {result.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="font-bold uppercase tracking-wider">
                    {result.verified ? 'Check-in Verified' : 'Check-in Blocked'}
                  </span>
                </div>

                {result.reason && (
                  <p className="text-[11px] font-medium mt-1 leading-snug">
                    Reason: {result.reason}
                  </p>
                )}

                {result.student && (
                  <div className="mt-2 pt-2 border-t border-white/[0.1] flex items-center justify-between text-[11px]">
                    <span className="font-semibold">{result.student.name}</span>
                    <span className="font-mono text-slate-300">{result.student.enrollmentNo}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
