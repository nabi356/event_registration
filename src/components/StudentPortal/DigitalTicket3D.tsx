"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export function DigitalTicket3D() {
  const {
    selectedEvent,
    isTicketFlipped,
    flipTicket,
    qrValue,
    qrValidUntil,
    qrRefreshKey,
    currentUser,
    myRegistrations,
    registerForEvent,
    setIsAuthModalOpen,
    addToast,
  } = useEventSystem();

  // If no event loaded yet from DB
  if (!selectedEvent) {
    return (
      <div className="w-full max-w-md mx-auto py-12 text-center rounded-3xl glass-panel border border-white/[0.08] p-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No Active Event Selected</h3>
        <p className="text-xs text-slate-400">Select an event from the roster to inspect pass credentials.</p>
      </div>
    );
  }

  // Check if current user has a real registration for THIS event
  const userRegistration = myRegistrations.find(
    (r) => r.event?.id === selectedEvent.id || (r as any).eventId === selectedEvent.id
  );
  const isRegistered = Boolean(userRegistration);

  // Circular progress calculations for 10s timer removed — the pass is static
  // and has no time limit until the event ends.
  const validityLabel = qrValidUntil
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(qrValidUntil)
      )
    : 'event end';

  const handleShowQrClick = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      addToast('info', 'Sign In Required', 'Please sign in to access your digital entry pass.');
      return;
    }
    if (!isRegistered) {
      addToast('warning', 'Registration Required', 'Please register for this event before accessing your gate pass token.');
      return;
    }
    flipTicket();
  };

  return (
    <div className="w-full max-w-md mx-auto perspective-1200 py-2">
      {/* 3D Rotating Container */}
      <motion.div
        className="w-full relative preserve-3d min-h-[580px]"
        initial={false}
        animate={{ rotateY: isTicketFlipped ? 180 : 0 }}
        transition={{
          duration: 0.75,
          type: 'spring',
          stiffness: 260,
          damping: 24,
        }}
      >
        {/* ======================================================== */}
        {/* FRONT SIDE OF TICKET                                    */}
        {/* ======================================================== */}
        <div
          className={`w-full rounded-3xl glass-panel border border-white/[0.12] p-6 sm:p-7 flex flex-col justify-between absolute inset-0 backface-hidden shadow-2xl overflow-hidden bg-gradient-to-b from-[#111A2E]/90 via-[#0D1424]/90 to-[#0A0E1A]/95 ${
            isTicketFlipped ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {/* Subtle Obsidian Sheen Overlays */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header Row */}
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block leading-none">
                    Digital Pass
                  </span>
                  <span className="text-xs font-bold text-white tracking-tight">
                    EVENTRA ACCESS
                  </span>
                </div>
              </div>

              {isRegistered ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Registration Confirmed
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Not Registered
                </div>
              )}
            </div>

            {/* Event Name & Category */}
            <div className="mt-6">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-blue-400 mb-1">
                {selectedEvent.category}
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {selectedEvent.name}
              </h2>

              <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{selectedEvent.time}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{selectedEvent.venue}</span>
                </div>
              </div>
            </div>

            {/* Perforated Divider Line with Notch Cutouts */}
            <div className="relative my-6 -mx-6 sm:-mx-7 flex items-center justify-between">
              <div className="w-4 h-8 bg-[#0B0F19] rounded-r-full border-r border-t border-b border-white/[0.1] -ml-px" />
              <div className="flex-1 border-t-2 border-dashed border-white/[0.12] mx-2" />
              <div className="w-4 h-8 bg-[#0B0F19] rounded-l-full border-l border-t border-b border-white/[0.1] -mr-px" />
            </div>

            {/* Student & Ticket Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                  Attendee Name
                </span>
                <span className="text-sm font-semibold text-white mt-0.5 block truncate">
                  {currentUser ? currentUser.name : 'Guest Attendee'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentUser ? currentUser.enrollmentNo : 'Sign-in required'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {currentUser?.university || 'University Campus'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                  Ticket Reference
                </span>
                <span className="text-sm font-mono font-semibold text-blue-300 mt-0.5 block truncate">
                  {isRegistered ? userRegistration?.ticketId : 'NO PASS ISSUED'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isRegistered ? userRegistration?.seatTier || 'Standard Admission' : 'Unconfirmed Seat'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                  Event Date
                </span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedEvent.date}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                  Entry Status
                </span>
                <div className="flex items-center gap-1.5 text-xs font-semibold mt-0.5">
                  {isRegistered ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Ready for Check-in</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-300">Registration Required</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Area: Show QR Button or Register Prompt */}
          <div className="pt-6 mt-4">
            {!currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3.5 px-5 flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Access Pass</span>
              </button>
            ) : !isRegistered ? (
              <button
                onClick={() => registerForEvent(selectedEvent.id)}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3.5 px-5 flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register for Event (Generate Pass)</span>
              </button>
            ) : (
              <button
                id="btn-show-qr"
                onClick={handleShowQrClick}
                className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 p-[1px] shadow-lg shadow-blue-900/40 hover:shadow-blue-800/60 transition-all duration-300 cursor-pointer"
              >
                <div className="w-full bg-[#0D1424]/80 backdrop-blur-md rounded-2xl py-3.5 px-5 flex items-center justify-center gap-2 group-hover:bg-transparent transition-colors duration-300">
                  <QrCode className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    Show Secure QR
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            )}

            <p className="text-[11px] text-center text-slate-400 mt-2.5">
              {isRegistered
                ? 'Tap to display your entry pass. Valid until the event ends — no refresh needed.'
                : 'Zero-trust verified entry requires confirmed event registration'}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BACK SIDE OF TICKET (Dynamic QR + Security Verification) */}
        {/* ======================================================== */}
        <div
          className={`w-full rounded-3xl glass-panel border border-white/[0.14] p-6 sm:p-7 flex flex-col justify-between absolute inset-0 backface-hidden shadow-2xl overflow-hidden bg-gradient-to-b from-[#0F172A]/95 via-[#0A1020]/95 to-[#070B14]/98 rotate-y-180 ${
            !isTicketFlipped ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Back Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                  Secure Entry Pass
                </h3>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5 block truncate max-w-[150px]">
                  {selectedEvent.name}
                </span>
              </div>
            </div>

            {/* Static valid-until badge (the pass does not rotate) */}
            <div className="flex items-center gap-2 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.08]">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono font-medium text-slate-200">
                Valid until {validityLabel}
              </span>
            </div>
          </div>

          {/* Dynamic QR Box & State Overlays */}
          <div className="relative flex flex-col items-center justify-center my-auto py-3">
            <div className="relative p-4 rounded-2xl bg-white p-3.5 shadow-2xl border-4 border-slate-900/80">
              {/* QR Code Container */}
              <motion.div
                key={qrRefreshKey}
                initial={{ opacity: 0.85, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <QRCodeSVG
                  value={qrValue || `EVTRA-${selectedEvent.id}-TOKEN`}
                  size={190}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#0B0F19"
                />
              </motion.div>
            </div>

            {/* Cryptographic Hash Metadata */}
            <div className="mt-3 text-center">
              <span className="font-mono text-[10px] text-slate-400 tracking-wider">
                PASS: {userRegistration?.ticketId || 'EVTRA-TOKEN'}
              </span>
            </div>
          </div>

          {/* Pass validity info */}
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl border bg-emerald-500/10 border-emerald-500/25 text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Valid until the event ends</span>
              </div>
              <span className="text-[11px] font-mono">{validityLabel}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl border bg-white/[0.04] border-white/[0.08] text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">No location needed</span>
              </div>
              <span className="text-[11px] font-mono">Works at the gate</span>
            </div>
          </div>

          {/* Hide QR Button */}
          <div className="pt-2">
            <button
              id="btn-hide-qr"
              onClick={flipTicket}
              className="w-full py-3 px-4 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hide QR · Flip to Pass</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
