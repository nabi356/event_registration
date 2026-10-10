"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  UserPlus,
  UserMinus,
  CheckCircle,
  Tag,
  Search,
  X,
  Ticket,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';
import { EventItem } from '@/lib/types';
import { getEventImage } from '@/lib/eventImages';

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
    studentSearch,
    setStudentSearch,
  } = useEventSystem();

  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Compute unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return ['All', ...Array.from(set)];
  }, [events]);

  // Filter events by category & search term
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesCategory =
        activeCategory === 'All' ||
        evt.category?.toLowerCase() === activeCategory.toLowerCase();

      const q = studentSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        evt.name.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        evt.category?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [events, activeCategory, studentSearch]);

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setIsTicketFlipped(false);
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
      <div className="p-8 rounded-3xl glass-panel border border-red-500/20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No Events Published Yet</h3>
        <p className="text-xs text-slate-400">
          Campus events created by management will be displayed here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header & Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Campus Events</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                {filteredEvents.length} Available
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any event to view and claim your digital entry pass
            </p>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-950/40 border border-red-500/40'
                    : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-red-500/20'
                }`}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Events Grid / Cards with High-Res Cover Images */}
      {filteredEvents.length === 0 ? (
        <div className="p-8 rounded-2xl glass-panel border border-red-500/20 text-center">
          <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-white">No Matching Events Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or switching categories.
          </p>
          {studentSearch && (
            <button
              onClick={() => setStudentSearch('')}
              className="mt-3 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-600/30 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredEvents.map((evt, idx) => {
            const isSelected = selectedEvent?.id === evt.id;
            const isRegistered = Boolean(
              currentUser &&
                myRegistrations.some(
                  (r) => r.event?.id === evt.id || (r as any).eventId === evt.id
                )
            );
            const coverImage = getEventImage(evt);
            const evtDeadline = new Date(evt.registrationDeadline || evt.startTime || 0);
            const isPastDeadline = Boolean(evtDeadline && !isNaN(evtDeadline.getTime()) && new Date() > evtDeadline);

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                whileHover={{ y: -6, scale: 1.018 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectEvent(evt)}
                className={`rounded-2xl cursor-pointer overflow-hidden flex flex-col justify-between transition-all duration-300 relative border-2 ${
                  isSelected
                    ? 'bg-[#18121B] border-red-500/70 shadow-2xl shadow-red-950/50 ring-2 ring-red-500/40'
                    : 'glass-panel-interactive border-red-500/25 hover:border-red-500/50 hover:shadow-xl'
                }`}
              >
                {/* Event Cover Photo with Vignette & Overlays */}
                <div className="relative w-full h-36 overflow-hidden">
                  <img
                    src={coverImage}
                    alt={evt.name}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120F16] via-black/40 to-transparent" />

                  {/* Category Pill Over Image */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{evt.category}</span>
                    </span>
                  </div>

                  {/* Status Pill Over Image */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md ${
                        isRegistered
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                          : isPastDeadline
                          ? 'bg-rose-950/70 text-rose-300 border border-rose-500/50'
                          : 'bg-red-600/30 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Registered</span>
                        </>
                      ) : isPastDeadline ? (
                        <>
                          <Clock className="w-2.5 h-2.5 text-rose-400" />
                          <span>Closed</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Available</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title Over Bottom of Image */}
                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1 drop-shadow-md img-overlay-title">
                      {evt.name}
                    </h3>
                  </div>
                </div>

                {/* Event Details Footer */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="font-semibold text-white">{evt.date}</span>
                      <span className="text-slate-500">·</span>
                      <Clock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{evt.time}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    {isRegistered ? (
                      <button
                        onClick={(e) => handleCancelClick(e, evt.id)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <UserMinus className="w-3 h-3" />
                        <span>Cancel Pass</span>
                      </button>
                    ) : isPastDeadline ? (
                      <button
                        disabled
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-400 font-bold text-[11px] border border-red-500/20 cursor-not-allowed"
                        title="Registration deadline has passed"
                      >
                        <Clock className="w-3 h-3 text-rose-400" />
                        <span>Closed</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleRegisterClick(e, evt.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-[11px] shadow-sm shadow-red-950/40 transition-all cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Claim Pass</span>
                      </button>
                    )}

                    <span
                      className={`text-[11px] font-bold ${
                        isSelected ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Viewing Pass ✓' : 'View Pass →'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
