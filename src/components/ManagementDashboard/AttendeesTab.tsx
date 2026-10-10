"use client";

import React, { useState, useEffect } from 'react';
import { Search, Download, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export function AttendeesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedEvent, exportAttendeesCsv, token, managementSearch, setManagementSearch } = useEventSystem();

  const fetchAttendees = async () => {
    if (!selectedEvent?.id) return;
    setIsLoading(true);
    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : '');
      const res = await fetch(`/api/registrations/attendees?eventId=${selectedEvent.id}`, {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.attendees)) {
        setAttendees(data.attendees);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [selectedEvent?.id]);

  const activeSearch = searchTerm || managementSearch;

  const filtered = attendees.filter(
    (a) =>
      !activeSearch ||
      a.name?.toLowerCase().includes(activeSearch.toLowerCase()) ||
      a.studentId?.toLowerCase().includes(activeSearch.toLowerCase()) ||
      a.dept?.toLowerCase().includes(activeSearch.toLowerCase()) ||
      a.ticket?.toLowerCase().includes(activeSearch.toLowerCase())
  );

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6 border-2 border-red-500/30 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-red-500/25 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white tracking-tight">Attendee Roster</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-600/20 text-red-400 border border-red-500/30 font-bold">
              {filtered.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedEvent?.name || 'Selected Event'} · Attendance list & live gate status
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar inside tab */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter roster..."
              className="pl-8 pr-7 py-1.5 rounded-xl bg-white/[0.05] border border-red-500/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 w-40 sm:w-56"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={fetchAttendees}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/[0.05] border border-red-500/25 hover:bg-white/[0.1] text-slate-300 transition-colors cursor-pointer"
            title="Refresh Roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={exportAttendeesCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-xs font-bold text-white shadow-md shadow-red-950/40 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto rounded-xl border border-red-500/25 bg-black/30">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-red-500/25 bg-red-600/[0.08] text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3.5">Attendee</th>
              <th className="py-3 px-3.5">Student ID</th>
              <th className="py-3 px-3.5">Department</th>
              <th className="py-3 px-3.5">Ticket ID</th>
              <th className="py-3 px-3.5">Gate Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-500/15">
            {filtered.map((att) => (
              <tr key={att.id || att.ticket} className="hover:bg-red-500/[0.04] transition-colors">
                <td className="py-3 px-3 font-semibold text-white">
                  {att.name}
                </td>
                <td className="py-3 px-3 font-mono text-amber-400 font-medium">
                  {att.studentId}
                </td>
                <td className="py-3 px-3 text-slate-400">
                  {att.dept}
                </td>
                <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                  {att.ticket}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      att.status === 'Confirmed' || att.status === 'verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                    }`}
                  >
                    {att.status}
                  </span>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  {isLoading ? 'Loading roster from database...' : 'No attendees found matching search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
