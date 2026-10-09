"use client";

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Tag,
  Clock,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';
import { EventItem } from '@/lib/types';

export function EventsCarousel() {
  const {
    events,
    selectedEvent,
    setSelectedEvent,
    setIsTicketFlipped,
    registerForEvent,
    cancelEventRegistration,
    myRegistrations,
    currentUser,
  } = useEventSystem();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setIsTicketFlipped(false); // Reset to front side
  };

  const handleRegisterClick = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    await registerForEvent(eventId);
  };

  const handleCancelClick = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    if (confirm('Cancel registration for this event? Your pass will be deactivated.')) {
      await cancelEventRegistration(eventId);
    }
  };

  if (events.length === 0) {
    return (
      <section className="mb-10 p-8 rounded-2xl glass-panel border border-white/[0.06] text-center bg-[#0E1524]/40">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-2">
          <Calendar className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">No Events Published Yet</h3>
        <p className="text-xs text-slate-400">
          Only official events created by campus management will be visible here.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-2">
              <span>Campus Events</span>
              <span className="text-xs font-normal text-slate-400">({events.length})</span>
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              Management Published
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Official events published by campus operations. Select an event to inspect credentials.
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all cursor-pointer"
            aria-label="Previous events"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all cursor-pointer"
            aria-label="Next events"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {events.map((evt) => {
          const isSelected = selectedEvent?.id === evt.id;
          const isRegistered = Boolean(
            currentUser &&
              myRegistrations.some(
                (r) => r.event?.id === evt.id || (r as any).eventId === evt.id
              )
          );

          return (
            <motion.div
              key={evt.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleSelectEvent(evt)}
              className={`min-w-[280px] sm:min-w-[320px] max-w-[340px] shrink-0 rounded-2xl cursor-pointer p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-[#111A2E] border-blue-500/40 shadow-xl shadow-blue-950/40'
                  : 'bg-[#0E1524]/60 border border-white/[0.07] hover:border-white/[0.16] hover:bg-[#121B2F]/80'
              }`}
            >
              {/* Selected highlight line */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500" />
              )}

              <div>
                {/* Header row: Category & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                    <Tag className="w-3 h-3 text-blue-400" />
                    {evt.category}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                      isRegistered
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    <CheckCircle className="w-2.5 h-2.5" />
                    {isRegistered ? 'Registered' : 'Available'}
                  </span>
                </div>

                {/* Event Name */}
                <h3 className="text-base font-semibold text-white tracking-tight mb-3 line-clamp-1">
                  {evt.name}
                </h3>
              </div>

              {/* Event Metadata */}
              <div className="space-y-2 pt-3 border-t border-white/[0.05] text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-200">{evt.date}</span>
                  <span className="text-slate-400">·</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  <span className="text-slate-300">{evt.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-slate-300">{evt.venue}</span>
                </div>
              </div>

              {/* Register / Cancel Actions row */}
              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px]">
                {isRegistered ? (
                  <button
                    onClick={(e) => handleCancelClick(e, evt.id)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                    title="Cancel event registration"
                  >
                    <UserMinus className="w-3 h-3" />
                    <span>Cancel Pass</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleRegisterClick(e, evt.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-[11px] text-blue-300 hover:text-white transition-all font-semibold"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Register</span>
                  </button>
                )}

                <span
                  className={`font-medium ${
                    isSelected ? 'text-blue-400' : 'text-slate-400'
                  }`}
                >
                  {isSelected ? 'Active Pass' : 'View Pass →'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
