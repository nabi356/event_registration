"use client";

import React, { useRef } from 'react';
import { EventsCarousel } from './EventsCarousel';
import { DigitalTicket3D } from './DigitalTicket3D';
import { useEventSystem } from '@/context/EventSystemContext';
import {
  Ticket,
  Sparkles,
  Calendar,
  Camera,
  ShieldCheck,
  Search,
  CheckCircle,
} from 'lucide-react';

import { motion } from 'framer-motion';

export function StudentView() {
  const {
    currentUser,
    myRegistrations,
    setIsFaceEnrollModalOpen,
    setFaceEnrollUpdateMode,
    setStudentSearch,
    theme,
  } = useEventSystem();

  const isLight = theme === 'light';
  const actionBtnClass = isLight
    ? 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-white hover:bg-slate-100 text-black border-2 border-red-500/40 hover:border-red-500/70 transition-all cursor-pointer whitespace-nowrap shadow-sm'
    : 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-white border-2 border-red-500/30 hover:border-red-500/60 transition-all cursor-pointer whitespace-nowrap shadow-sm';

  const ticketRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  const scrollToTicket = () => {
    ticketRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToEvents = () => {
    eventsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full pb-16 space-y-6">
      
      {/* Fast Tasks & Instant Actions Bar with Slide-Down Animation */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between flex-wrap gap-2 p-3.5 rounded-2xl glass-panel-interactive border-2 border-red-500/30 shadow-xl"
      >
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 shrink-0 pl-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className={isLight ? "text-amber-700 font-extrabold" : "text-amber-400 font-bold"}>Fast Tasks:</span>
          </span>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={scrollToTicket}
            className={actionBtnClass}
          >
            <Ticket className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className={isLight ? "text-black font-black" : "text-white font-bold"}>View Active Ticket</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={scrollToEvents}
            className={actionBtnClass}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className={isLight ? "text-black font-black" : "text-white font-bold"}>Browse All Events</span>
          </motion.button>

          {currentUser && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setFaceEnrollUpdateMode(false);
                setIsFaceEnrollModalOpen(true);
              }}
              className={actionBtnClass}
            >
              <Camera className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className={isLight ? "text-black font-black" : "text-white font-bold"}>Face ID Check</span>
            </motion.button>
          )}

          {myRegistrations.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setStudentSearch('Registered')}
              className={actionBtnClass}
            >
              <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className={isLight ? "text-black font-black" : "text-amber-300 font-bold"}>My Passes ({myRegistrations.length})</span>
            </motion.button>
          )}
        </div>

        {/* Status Chip */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 pr-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gate System Online</span>
        </div>
      </motion.div>

      {/* Main 2-Column Responsive Split */}
      {/* Left: Campus Events Explorer (Moved to Left!) */}
      {/* Right: Digital Ticket Pass (Moved UP at Top!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        
        {/* LEFT COLUMN: Campus Events List & Explorer (7 cols, Animated Entrance) */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          ref={eventsRef}
          className="lg:col-span-7 order-2 lg:order-1"
        >
          <EventsCarousel />
        </motion.div>

        {/* RIGHT COLUMN: Active Digital Ticket (5 cols, Animated Entrance) */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          ref={ticketRef}
          className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-20"
        >
          <div className="mb-3 text-center lg:text-left pb-3 border-b-2 border-red-500/25">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block mb-0.5">
              Instant Gate Credential
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Official Campus Pass
            </h2>
            <p className="text-xs text-slate-400">
              Present this digital pass at the gate terminal scanner for entrance
            </p>
          </div>

          {/* Active 3D Ticket Pass with Photo */}
          <DigitalTicket3D />
        </motion.div>
      </div>

    </div>
  );
}
