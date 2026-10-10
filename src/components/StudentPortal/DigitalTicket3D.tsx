"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  RotateCcw,
  Shield,
  MapPin,
  Clock,
  Calendar,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  Ticket,
  AlertCircle,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';
import { getEventImage } from '@/lib/eventImages';

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

  const deadlineDate = selectedEvent ? new Date(selectedEvent.registrationDeadline || selectedEvent.startTime || 0) : null;
  const isPastDeadline = Boolean(deadlineDate && !isNaN(deadlineDate.getTime()) && new Date() > deadlineDate);

  if (!selectedEvent) {
    return (
      <div className="w-full max-w-md mx-auto py-12 text-center rounded-3xl glass-panel border border-red-500/20 p-8">
        <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-3">
          <Ticket className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No Event Selected</h3>
        <p className="text-xs text-slate-400">Select an event from the roster to view your entry pass.</p>
      </div>
    );
  }

  const userRegistration = myRegistrations.find(
    (r) => r.event?.id === selectedEvent.id || (r as any).eventId === selectedEvent.id
  );
  const isRegistered = Boolean(userRegistration);

  const validityLabel = qrValidUntil
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(qrValidUntil)
      )
    : 'Event Duration';

  const handleShowQrClick = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      addToast('info', 'Sign In Required', 'Please sign in to view your pass.');
      return;
    }
    if (!isRegistered) {
      addToast('warning', 'Registration Required', 'Please register for this event to access your ticket.');
      return;
    }
    flipTicket();
  };

  const eventBannerUrl = getEventImage(selectedEvent);

  return (
    <div className="w-full max-w-md mx-auto perspective-1200 py-2">
      {/* 3D Rotating Ticket Container */}
      <motion.div
        className="w-full relative preserve-3d min-h-[600px]"
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
        {/* FRONT SIDE OF TICKET                                     */}
        {/* ======================================================== */}
        <div
          className={`w-full rounded-3xl glass-panel border border-red-500/25 p-0 flex flex-col justify-between absolute inset-0 backface-hidden shadow-2xl overflow-hidden bg-gradient-to-b from-[#18131B]/95 via-[#130F16]/95 to-[#0E0B11]/98 ${
            isTicketFlipped ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {/* Top Event Cover Image Banner */}
          <div className="relative w-full h-44 overflow-hidden border-b border-red-500/20">
            {/* Background image */}
            <img
              src={eventBannerUrl}
              alt={selectedEvent.name}
              className="w-full h-full object-cover brightness-90 transform hover:scale-105 transition-transform duration-700"
            />
            {/* Gradient Dark/Red vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#140F18] via-[#140F18]/60 to-black/30" />

            {/* Top Bar on Image: Brand & Registration Status */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-red-500/30 text-white text-[11px] font-bold tracking-wider uppercase">
                <Shield className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                <span>Eventra Pass</span>
              </div>

              {isRegistered ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Confirmed</span>
                </div>
              ) : isPastDeadline ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/70 backdrop-blur-md border border-rose-500/60 text-rose-300 text-[11px] font-semibold">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span>Deadline Passed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Available</span>
                </div>
              )}
            </div>

            {/* Bottom Title on Image */}
            <div className="absolute bottom-3 left-4 right-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                {selectedEvent.category}
              </span>
              <h2 className="text-xl font-black tracking-tight text-white line-clamp-1 img-overlay-title">
                {selectedEvent.name}
              </h2>
            </div>
          </div>

          {/* Ticket Body Content */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
            {/* Event Time & Venue */}
            <div className="flex items-center justify-between text-xs text-slate-300 pb-3 border-b border-red-500/10">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                <span className="font-semibold text-white">{selectedEvent.date}</span>
                <span className="text-slate-500">·</span>
                <Clock className="w-3.5 h-3.5 text-red-400 ml-1" />
                <span>{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[140px] font-medium">{selectedEvent.venue}</span>
              </div>
            </div>

            {/* Perforated Notch Divider */}
            <div className="relative my-4 -mx-5 sm:-mx-6 flex items-center justify-between">
              <div className="w-4 h-7 bg-[#0B0A0E] rounded-r-full border-r border-t border-b border-red-500/20" />
              <div className="flex-1 border-t-2 border-dashed border-red-500/25 mx-2" />
              <div className="w-4 h-7 bg-[#0B0A0E] rounded-l-full border-l border-t border-b border-red-500/20" />
            </div>

            {/* Attendee Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Passholder
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block truncate">
                  {currentUser ? currentUser.name : 'Guest Attendee'}
                </span>
                <span className="text-[11px] text-amber-400/90 font-mono font-medium block">
                  {currentUser ? currentUser.enrollmentNo : 'Not Signed In'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Ticket Reference
                </span>
                <span className="text-xs font-mono font-bold text-red-400 mt-0.5 block truncate">
                  {isRegistered ? userRegistration?.ticketId : 'NO PASS ISSUED'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {isRegistered ? userRegistration?.seatTier || 'VIP Admission' : 'Register to Claim'}
                </span>
              </div>
            </div>

            {/* Action Button: Show QR Pass or Register */}
            <div className="mt-5 pt-3">
              {!currentUser ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 py-3 px-4 flex items-center justify-center gap-2 text-xs font-bold text-white shadow-lg shadow-red-950/50 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Access Pass</span>
                </button>
              ) : !isRegistered ? (
                isPastDeadline ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-zinc-800/80 border border-red-500/30 py-3 px-4 flex items-center justify-center gap-2 text-xs font-bold text-zinc-400 cursor-not-allowed shadow-inner"
                    title="Registrations for this event are closed as the deadline has passed."
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>Registration Closed (Deadline Passed)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => registerForEvent(selectedEvent.id)}
                    className="w-full rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 py-3 px-4 flex items-center justify-center gap-2 text-xs font-bold text-white shadow-lg shadow-red-950/50 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register for Pass</span>
                  </button>
                )
              ) : (
                <button
                  id="btn-show-qr"
                  onClick={handleShowQrClick}
                  className="w-full rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 py-3 px-4 flex items-center justify-center gap-2 text-xs font-bold text-white shadow-xl shadow-red-950/60 transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span className="tracking-wide">Show Gate Entry QR</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BACK SIDE OF TICKET (Crisp QR Code for Gate Scanner)     */}
        {/* ======================================================== */}
        <div
          className={`w-full rounded-3xl glass-panel border border-red-500/30 p-6 flex flex-col justify-between absolute inset-0 backface-hidden shadow-2xl overflow-hidden bg-gradient-to-b from-[#18121B]/95 via-[#120D15]/95 to-[#0A080D]/98 rotate-y-180 ${
            !isTicketFlipped ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {/* Back Header */}
          <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <QrCode className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                  Gate Entry Token
                </h3>
                <span className="text-[10px] font-mono text-amber-400/90 mt-0.5 block truncate max-w-[150px]">
                  {selectedEvent.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/10 border border-red-500/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Official Pass
              </span>
            </div>
          </div>

          {/* Crisp QR Code Container */}
          <div className="relative flex flex-col items-center justify-center my-auto py-2">
            <div className="relative p-3.5 rounded-2xl bg-white shadow-2xl border-4 border-red-950/60">
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
                  fgColor="#0B0A0E"
                />
              </motion.div>
            </div>

            <span className="font-mono text-[10px] text-amber-400 mt-2.5 font-bold tracking-wider">
              {userRegistration?.ticketId || 'EVTRA-PASS'}
            </span>
          </div>

          {/* Attendee Summary & Validity */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-red-500/15 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Passholder:</span>
              <span className="font-semibold text-white">{currentUser?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Valid Through:</span>
              <span className="font-mono text-amber-400">{validityLabel}</span>
            </div>
          </div>

          {/* Flip Back Button */}
          <div className="pt-2">
            <button
              id="btn-hide-qr"
              onClick={flipTicket}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Flip Back to Ticket</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
