"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, X, Plus, Edit, RefreshCw } from 'lucide-react';
import { EventItem } from '@/lib/types';

interface EventFormModalProps {
  isOpen: boolean;
  eventToEdit?: EventItem | null;
  onClose: () => void;
  onSaved: () => void;
  token?: string;
}

export function EventFormModal({
  isOpen,
  eventToEdit,
  onClose,
  onSaved,
  token,
}: EventFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Keynote & Tech');
  const [venue, setVenue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [lat, setLat] = useState('28.5355');
  const [lng, setLng] = useState('77.3910');
  const [radiusMeters, setRadiusMeters] = useState('50');
  const [capacity, setCapacity] = useState('500');
  const [accentColor, setAccentColor] = useState('#3B82F6');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      setName(eventToEdit.name);
      setCategory(eventToEdit.category || 'Keynote & Tech');
      setVenue(eventToEdit.venue);
      setAccentColor(eventToEdit.accentColor || '#3B82F6');
      if (eventToEdit.startTime) {
        setStartTime(new Date(eventToEdit.startTime).toISOString().slice(0, 16));
      }
      if (eventToEdit.endTime) {
        setEndTime(new Date(eventToEdit.endTime).toISOString().slice(0, 16));
      }
      if (eventToEdit.registrationDeadline) {
        setRegistrationDeadline(new Date(eventToEdit.registrationDeadline).toISOString().slice(0, 16));
      } else if (eventToEdit.startTime) {
        setRegistrationDeadline(new Date(eventToEdit.startTime).toISOString().slice(0, 16));
      }
    } else {
      setName('');
      setCategory('Keynote & Tech');
      setVenue('');
      const now = new Date();
      setStartTime(new Date(now.getTime() + 3600000).toISOString().slice(0, 16));
      setEndTime(new Date(now.getTime() + 10800000).toISOString().slice(0, 16));
      setRegistrationDeadline(new Date(now.getTime() + 3600000).toISOString().slice(0, 16));
      setLat('28.5355');
      setLng('77.3910');
      setRadiusMeters('50');
      setCapacity('500');
      setAccentColor('#3B82F6');
    }
    setErrorMsg(null);
  }, [eventToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : null);

      const endpoint = eventToEdit ? `/api/events/${eventToEdit.id}` : '/api/events';
      const method = eventToEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify({
          name,
          category,
          venue,
          startTime,
          endTime,
          registrationDeadline: registrationDeadline || startTime,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radiusMeters: parseInt(radiusMeters, 10),
          capacity: parseInt(capacity, 10),
          accentColor,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save event');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving event');
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
            className="relative w-full max-w-lg rounded-2xl glass-panel border border-white/[0.14] p-6 shadow-2xl bg-[#0D1526]/95 z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  {eventToEdit ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {eventToEdit ? 'Edit Event Parameters' : 'Create Campus Event'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Perimeter geofence, time schedule, and capacity limits
                  </p>
                </div>
              </div>

              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI & Future Technologies Summit"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Keynote & Tech"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                    Venue Location
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Seminar Hall A"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-amber-400 block mb-1">
                    Registration Cutoff
                  </label>
                  <input
                    type="datetime-local"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-amber-500/30 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Geofence Perimeter Coordinates */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <span className="text-[11px] font-semibold uppercase text-blue-400 block">
                  Perimeter Geofence Configuration
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Radius (m)</label>
                    <input
                      type="number"
                      value={radiusMeters}
                      onChange={(e) => setRadiusMeters(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                    Total Capacity
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                    min="1"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                    Accent Color
                  </label>
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : eventToEdit ? (
                    <Edit className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? 'Saving...' : eventToEdit ? 'Save Changes' : 'Create Event'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
