"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Smartphone,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';
import { CURRENT_STUDENT } from '@/lib/mockData';

export function DigitalTicket3D() {
  const {
    selectedEvent,
    isTicketFlipped,
    flipTicket,
    qrValue,
    qrCountdown,
    qrRefreshKey,
    geoFenceStatus,
    deviceLockStatus,
    currentUser,
  } = useEventSystem();

  // Determine if QR is blocked due to demo states
  const isGeoBlocked = geoFenceStatus !== 'verified';
  const isDeviceBlocked = deviceLockStatus === 'mismatch';
  const isPassBlocked = isGeoBlocked || isDeviceBlocked;

  // Circular progress calculations for 10s timer
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (qrCountdown / 10) * circumference;

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

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Registration Confirmed
              </div>
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
                  {currentUser?.name || CURRENT_STUDENT.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentUser?.enrollmentNo || CURRENT_STUDENT.studentId}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {currentUser?.university || 'Apex Institute of Technology'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                  Ticket Reference
                </span>
                <span className="text-sm font-mono font-semibold text-blue-300 mt-0.5 block truncate">
                  {selectedEvent.ticketId}
                </span>
                <span className="text-[11px] text-slate-400">
                  {selectedEvent.seatTier || 'Standard Admission'}
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
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready for Check-in</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Area: Show QR Button */}
          <div className="pt-6 mt-4">
            <button
              id="btn-show-qr"
              onClick={flipTicket}
              className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 p-[1px] shadow-lg shadow-blue-900/40 hover:shadow-blue-800/60 transition-all duration-300"
            >
              <div className="w-full bg-[#0D1424]/80 backdrop-blur-md rounded-2xl py-3.5 px-5 flex items-center justify-center gap-2 group-hover:bg-transparent transition-colors duration-300">
                <QrCode className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-semibold text-white tracking-wide">
                  Show Secure QR
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <p className="text-[11px] text-center text-slate-400 mt-2.5">
              Tap to display cryptographic entry code with dynamic refresh
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
                <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                  {selectedEvent.name}
                </span>
              </div>
            </div>

            {/* Circular Countdown Badge */}
            <div className="flex items-center gap-2 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.08]">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <svg className="w-5 h-5 transform -rotate-90">
                  <circle
                    cx="10"
                    cy="10"
                    r={radius / 2.3}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2"
                    fill="transparent"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r={radius / 2.3}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * (radius / 2.3)}
                    strokeDashoffset={
                      2 * Math.PI * (radius / 2.3) -
                      (qrCountdown / 10) * (2 * Math.PI * (radius / 2.3))
                    }
                    className="transition-all duration-300 ease-linear"
                  />
                </svg>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-200">
                Refreshes in {qrCountdown < 10 ? `0${qrCountdown}` : qrCountdown}s
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
                className={isPassBlocked ? 'filter blur-md opacity-30 select-none' : ''}
              >
                <QRCodeSVG
                  value={qrValue}
                  size={190}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#0B0F19"
                />
              </motion.div>

              {/* OVERLAY: Geo-Fence or Device Blocked State */}
              <AnimatePresence>
                {isPassBlocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-2xl bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center border border-white/[0.15]"
                  >
                    {isGeoBlocked ? (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Check-in unavailable
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                          {geoFenceStatus === 'outside'
                            ? 'Move within 50m of the event venue to activate your ticket.'
                            : 'Enable device location services to verify perimeter access.'}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                          Check-in blocked
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                          This ticket is associated with another device session.
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cryptographic Hash Metadata */}
            <div className="mt-3 text-center">
              <span className="font-mono text-[10px] text-slate-400 tracking-wider">
                HASH: {qrValue.substring(qrValue.length - 14)}
              </span>
            </div>
          </div>

          {/* Verification Status Pills */}
          <div className="space-y-2 py-2">
            {/* Geo Verification Status */}
            <div
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                geoFenceStatus === 'verified'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {geoFenceStatus === 'verified'
                    ? 'Location Verified'
                    : geoFenceStatus === 'outside'
                    ? 'Outside Zone (240m)'
                    : 'Location Unavailable'}
                </span>
              </div>
              <span className="text-[11px] font-mono">
                {geoFenceStatus === 'verified'
                  ? '32m from venue'
                  : geoFenceStatus === 'outside'
                  ? '> 50m required'
                  : 'GPS offline'}
              </span>
            </div>

            {/* Device Verification Status */}
            <div
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                deviceLockStatus === 'verified'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {deviceLockStatus === 'verified'
                    ? 'Device Verified'
                    : 'Device Session Mismatch'}
                </span>
              </div>
              <span className="text-[11px] font-mono">
                {deviceLockStatus === 'verified'
                  ? 'Locked to device'
                  : 'Token rejected'}
              </span>
            </div>
          </div>

          {/* Hide QR Button */}
          <div className="pt-2">
            <button
              id="btn-hide-qr"
              onClick={flipTicket}
              className="w-full py-3 px-4 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
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
